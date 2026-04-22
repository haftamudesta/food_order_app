const Stripe = require('stripe');

// Ensure environment variables are loaded
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not defined in config.env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  maxNetworkRetries: 2,
});

console.log('✅ Stripe initialized successfully');

module.exports = stripe;