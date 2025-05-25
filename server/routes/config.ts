import { type Express } from "express";
import { env } from "../config/environment";

export function registerConfigRoutes(app: Express): void {
  // Provide client configuration
  app.get("/api/config", (req, res) => {
    const stripeConfig = env.getStripeConfig();
    
    res.json({
      success: true,
      data: {
        stripePublishableKey: stripeConfig.publishableKey,
        environment: env.isDevelopment() ? 'development' : 'production',
      },
    });
  });
}