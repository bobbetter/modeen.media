# Secrets Management Guide

This project uses a structured approach to manage secrets for different environments.

## Local Development (Replit IDE)

For local development in the Replit IDE, you have two options:

### Option 1: Using Replit Secrets (Recommended)
1. Go to the Secrets tab in your Replit project
2. Add the following secrets for development:

```
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SESSION_SECRET=your_development_session_secret_32_chars_minimum
```

### Option 2: Using .env file
1. Copy `.env.example` to `.env`
2. Fill in your development values in the `.env` file

## Production Deployment

For production deployment on Replit:

1. Go to your deployed app's settings
2. Add the following production secrets:

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
SESSION_SECRET=secure_random_32_character_minimum_string
```

## Environment Validation

The system automatically:
- ✅ Validates required secrets are present
- ⚠️  Warns if using test keys in production
- ⚠️  Warns if using live keys in development
- 🔒 Enforces stronger security in production (secure cookies, shorter sessions)

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use test keys for development**
3. **Use live keys only for production**
4. **Generate strong session secrets (32+ characters)**
5. **Regularly rotate your secrets**