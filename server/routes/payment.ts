import { type Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import bodyParser from "body-parser";
import { env } from "../config/environment";
import { sendDownloadLinkEmail } from "../utils/email";
import { createDownloadLink } from "../utils/downloadLink";

const stripeConfig = env.getStripeConfig();
const stripe = new Stripe(stripeConfig.secretKey);
const endpointSecret = stripeConfig.webhookSecret;

async function fulfillCheckout(sessionId: string) {
  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys

  console.log("Fulfilling Checkout Session " + sessionId);

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // performed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  checkoutSession.line_items?.data.forEach((item) => {
    console.log("Data object for line item:", item);
  });
  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be performed
  if (checkoutSession.payment_status !== "unpaid") {
    // Fulfill the purchase
    if (checkoutSession.customer_details && checkoutSession.metadata?.product_id) {
      console.log(
        "Fulfilling order for " + checkoutSession.customer_details.email,
      );

      try {
        const productId = parseInt(checkoutSession.metadata.product_id);
        
        // Create download link using the shared utility
        const { downloadLink, product } = await createDownloadLink({
          product_id: productId,
          session_id: sessionId, // Include the Stripe session ID
          max_download_count: 3, // Allow 3 downloads
          expire_after_seconds: 7 * 24 * 60 * 60, // 7 days expiration
          created_by: checkoutSession.customer_details,
        });

        // Send email with download link
        const customerName = checkoutSession.customer_details.name || "Valued Customer";
        await sendDownloadLinkEmail(
          checkoutSession.customer_details.email!,
          customerName,
          product.name,
          downloadLink.download_link
        );

        console.log(`✅ Download link created and email sent to ${checkoutSession.customer_details.email}`);
      } catch (error) {
        console.error("Error fulfilling checkout:", error);
      }
    } else {
      console.error("Missing customer details or product_id in checkout session");
    }
  }
}

// Separate webhook registration function that must be called before body parsing middleware
export function registerWebhookRoute(app: Express): void {
  app.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }), // required for Stripe to verify signature
    async (request, response) => {
      const sig = request.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      console.log("Webhook received:", request.body);

      // Validate required parameters
      if (!sig) {
        console.error("❌ No stripe signature found");
        return response.status(400).send("No stripe signature found");
      }

      if (!endpointSecret) {
        console.error("❌ No webhook endpoint secret configured");
        return response
          .status(400)
          .send("No webhook endpoint secret configured");
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret,
        );
      } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log("✅ Verified webhook event:", event.type);

      // Handle the event
      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
      ) {
        const session = event.data.object;
        await fulfillCheckout(session.id); // Your fulfillment logic
      }

      response.status(200).end();
    },
  );
}

export function registerPaymentRoutes(app: Express): void {
  app.post("/create-checkout-session", async (req, res) => {
    const productId = req.body.productId;
    console.log("Product ID:", productId);
    if (!productId)
      return res.status(400).json({ error: "Product ID is required" });

    const product = await storage.getProduct(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: "test",
            },
            unit_amount: parseInt(product.price, 10) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      ui_mode: "embedded",
      return_url:
        "https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
      metadata: {
        product_id: productId,
      },
    });
    console.log("Session created:", session);
    res.send({
      clientSecret: session.client_secret,
      product: product,
    });
  });
}
