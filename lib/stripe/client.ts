import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia',
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_dummy';
