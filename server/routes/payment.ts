import { type Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import bodyParser from "body-parser";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(
  "sk_test_51RR9SdAIn0oICRrzPW2XYyWuaLdBTeoZrz84H7UR9nreCcjOAVyOJRLqJJBclpmxWqpWNvfQcdibqO6gcVv5zmyd00ZdVg2ppA",
);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be performed
  if (checkoutSession.payment_status !== "unpaid") {
    // TODO: Fulfill the purchase
    if (checkoutSession.customer_details) {
      console.log(
        "Fulfilling order for " + checkoutSession.customer_details.email,
      );
    }

    // TODO : Create download link for the user
    // TODO : Send email to the user with the download link
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

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret,
        );
      } catch (err) {
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
    });
    console.log("Session created:", session);
    res.send({
      clientSecret: session.client_secret,
      product: product,
    });
  });
}
