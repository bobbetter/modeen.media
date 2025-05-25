/**
 * Frontend Environment Configuration
 * Manages environment variables for the client-side application
 */

export interface ClientEnvironmentConfig {
  STRIPE_PUBLISHABLE_KEY: string;
  NODE_ENV: string;
  API_BASE_URL: string;
}

class ClientEnvironmentManager {
  private config: ClientEnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private async loadConfigFromServer(): Promise<string> {
    try {
      const response = await fetch('/api/config');
      const result = await response.json();
      if (result.success) {
        return result.data.stripePublishableKey;
      }
    } catch (error) {
      console.warn('Could not load config from server:', error);
    }
    return '';
  }

  private loadConfig(): ClientEnvironmentConfig {
    // For development, we can use the Vite env var if available
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    const nodeEnv = import.meta.env.MODE || 'development';
    
    return {
      STRIPE_PUBLISHABLE_KEY: stripeKey,
      NODE_ENV: nodeEnv,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    };
  }

  async getStripePublishableKeyAsync(): Promise<string> {
    if (this.config.STRIPE_PUBLISHABLE_KEY) {
      return this.config.STRIPE_PUBLISHABLE_KEY;
    }
    return await this.loadConfigFromServer();
  }

  private validateConfig(): void {
    if (!this.config.STRIPE_PUBLISHABLE_KEY) {
      console.warn('⚠️  STRIPE_PUBLISHABLE_KEY not found. Payment functionality may not work.');
    }

    const isProduction = this.config.NODE_ENV === 'production';
    
    if (isProduction && this.config.STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
      console.warn('⚠️  WARNING: Using test Stripe keys in production environment');
    }
    
    if (!isProduction && this.config.STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
      console.warn('⚠️  WARNING: Using live Stripe keys in development environment');
    }
  }

  get(): ClientEnvironmentConfig {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  getStripePublishableKey(): string {
    return this.config.STRIPE_PUBLISHABLE_KEY;
  }

  getApiBaseUrl(): string {
    return this.config.API_BASE_URL;
  }
}

// Singleton instance
export const clientEnv = new ClientEnvironmentManager();