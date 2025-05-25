import { type Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
