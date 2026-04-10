/**
 * Stripe Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling for Stripe.
 * Should NOT trigger any violations.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Proper error handling for charge creation
 */
async function createChargeWithProperErrorHandling() {
  try {
    const charge = await stripe.charges.create({
      amount: 2000,
      currency: 'usd',
      source: 'tok_visa',
      description: 'Test charge',
    });
    return charge;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      // Handle card decline
      console.error('Card declined:', error.decline_code);
      throw new Error('Payment failed: ' + error.message);
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      // Implement exponential backoff
      console.error('Rate limit hit, retry with backoff');
      throw error;
    } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
      // Configuration error - alert ops
      console.error('Authentication failed - check API key');
      throw error;
    } else {
      // Network or other errors
      console.error('Stripe error:', error);
      throw error;
    }
  }
}

/**
 * Proper error handling for PaymentIntent creation
 */
async function createPaymentIntentWithProperErrorHandling() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999,
      currency: 'usd',
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      console.error('Card error:', error.message);
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      console.error('Rate limit error');
    } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
      console.error('Auth error');
    }
    throw error;
  }
}

/**
 * Proper error handling for customer creation
 */
async function createCustomerWithProperErrorHandling(email: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      description: 'Test customer',
    });
    return customer;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error creating customer:', error.type);
      throw error;
    }
    throw error;
  }
}

/**
 * Proper error handling for webhook verification
 */
function verifyWebhookWithProperErrorHandling(payload: string, signature: string, secret: string) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      // Signature invalid - possible attack
      console.error('Webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }
    throw error;
  }
}

/**
 * Proper error handling for payment confirmation
 */
async function confirmPaymentWithProperErrorHandling(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      // Card declined during confirmation
      console.error('Payment confirmation failed:', error.decline_code);
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      // Retry with backoff
      console.error('Rate limit hit');
    }
    throw error;
  }
}

/**
 * Proper error handling for resource retrieval
 */
async function retrieveChargeWithProperErrorHandling(chargeId: string) {
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    return charge;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Resource not found
      console.error('Charge not found:', chargeId);
      return null;
    } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
      console.error('Auth error');
    }
    throw error;
  }
}
