/**
 * Environment Configuration
 * Manages secrets and configuration for different environments
 */

export interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Session
  SESSION_SECRET: string;

  // Email (if needed)
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  // App
  NODE_ENV: "development" | "production" | "test";
  PORT: string;
}

export class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const env = process.env.NODE_ENV || "development";

    // Select Stripe keys based on environment
    const stripeKeyPrefix = env === "production" ? "" : "_TEST";
    const stripeSecretKey = this.getRequiredSecret(
      `STRIPE_SECRET_KEY${stripeKeyPrefix}`,
    );
    const stripePublishableKey = this.getRequiredSecret(
      `STRIPE_PUBLISHABLE_KEY${stripeKeyPrefix}`,
    );
    const stripeWebhookSecret = this.getRequiredSecret(
      `STRIPE_WEBHOOK_SECRET${stripeKeyPrefix}`,
    );

    return {
      DATABASE_URL: this.getRequiredSecret("DATABASE_URL"),
      STRIPE_SECRET_KEY: stripeSecretKey,
      STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
      SESSION_SECRET: this.getRequiredSecret("SESSION_SECRET"),
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      NODE_ENV: env as "development" | "production" | "test",
      PORT: process.env.PORT || "5000",
    };
  }

  private getRequiredSecret(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private validateConfig(): void {
    const env = this.config.NODE_ENV;

    if (env === "production") {
      // Additional production validations
      if (this.config.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
        console.warn(
          "⚠️  WARNING: Using test Stripe keys in production environment",
        );
      }

      if (this.config.SESSION_SECRET.length < 32) {
        throw new Error(
          "SESSION_SECRET must be at least 32 characters in production",
        );
      }
    }

    if (env === "development") {
      // Development-specific validations
      if (this.config.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
        console.warn(
          "⚠️  WARNING: Using live Stripe keys in development environment",
        );
      }
    }
  }

  get(): EnvironmentConfig {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === "development";
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  getStripeConfig() {
    return {
      secretKey: this.config.STRIPE_SECRET_KEY,
      publishableKey: this.config.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: this.config.STRIPE_WEBHOOK_SECRET,
    };
  }

  getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL,
    };
  }

  getSessionConfig() {
    return {
      secret: this.config.SESSION_SECRET,
      secure: this.isProduction(), // Only use secure cookies in production
      maxAge: this.isDevelopment()
        ? 1000 * 60 * 60 * 24 * 7
        : 1000 * 60 * 60 * 24, // 7 days dev, 1 day prod
    };
  }
}

// Singleton instance
export const env = new EnvironmentManager();
