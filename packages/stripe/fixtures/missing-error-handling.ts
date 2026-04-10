/**
 * Stripe Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * ❌ Missing try-catch for charge creation
 * Should trigger ERROR violation
 */
async function createChargeWithoutErrorHandling() {
  const charge = await stripe.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa',
  });
  return charge;
}

/**
 * ❌ Missing try-catch for PaymentIntent creation
 * Should trigger ERROR violation
 */
async function createPaymentIntentWithoutErrorHandling() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1999,
    currency: 'usd',
  });
  return paymentIntent;
}

/**
 * ❌ Missing try-catch for customer creation
 * Should trigger ERROR violation
 */
async function createCustomerWithoutErrorHandling(email: string) {
  const customer = await stripe.customers.create({
    email,
  });
  return customer;
}

/**
 * ❌ Missing try-catch for refund creation
 * Should trigger ERROR violation
 */
async function createRefundWithoutErrorHandling(chargeId: string) {
  const refund = await stripe.refunds.create({
    charge: chargeId,
  });
  return refund;
}

/**
 * ❌ Missing try-catch for webhook verification
 * Should trigger ERROR violation
 */
function verifyWebhookWithoutErrorHandling(payload: string, signature: string, secret: string) {
  const event = stripe.webhooks.constructEvent(payload, signature, secret);
  return event;
}

/**
 * ❌ Missing try-catch for payment confirmation
 * Should trigger ERROR violation
 */
async function confirmPaymentWithoutErrorHandling(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
  return paymentIntent;
}

/**
 * ❌ Missing try-catch for resource retrieval
 * Should trigger ERROR violation
 */
async function retrieveChargeWithoutErrorHandling(chargeId: string) {
  const charge = await stripe.charges.retrieve(chargeId);
  return charge;
}

/**
 * ❌ Missing try-catch for subscription creation
 * Should trigger ERROR violation
 */
async function createSubscriptionWithoutErrorHandling(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  });
  return subscription;
}
