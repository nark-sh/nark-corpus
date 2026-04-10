/**
 * Stripe Fixtures - Instance Usage
 *
 * These examples test detection of Stripe usage via instances.
 */

import Stripe from 'stripe';

/**
 * Service class using Stripe instance
 */
class PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  /**
   * ❌ Missing try-catch on instance method
   * Should trigger ERROR violation
   */
  async createCharge(amount: number, currency: string) {
    const charge = await this.stripe.charges.create({
      amount,
      currency,
      source: 'tok_visa',
    });
    return charge;
  }

  /**
   * ✅ Proper error handling on instance method
   * Should NOT trigger violation
   */
  async createChargeWithErrorHandling(amount: number, currency: string) {
    try {
      const charge = await this.stripe.charges.create({
        amount,
        currency,
        source: 'tok_visa',
      });
      return charge;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeCardError) {
        console.error('Card declined');
      }
      throw error;
    }
  }

  /**
   * ❌ Missing try-catch for PaymentIntent
   * Should trigger ERROR violation
   */
  async createPaymentIntent(amount: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    return paymentIntent;
  }

  /**
   * ❌ Missing try-catch for customer
   * Should trigger ERROR violation
   */
  async createCustomer(email: string) {
    const customer = await this.stripe.customers.create({
      email,
    });
    return customer;
  }
}

/**
 * Dependency injection pattern
 */
class BillingService {
  constructor(private readonly stripe: Stripe) {}

  /**
   * ❌ Missing try-catch
   * Should trigger ERROR violation
   */
  async chargeCustomer(customerId: string, amount: number) {
    const charge = await this.stripe.charges.create({
      customer: customerId,
      amount,
      currency: 'usd',
    });
    return charge;
  }

  /**
   * ✅ With error handling
   * Should NOT trigger violation
   */
  async chargeCustomerSafely(customerId: string, amount: number) {
    try {
      const charge = await this.stripe.charges.create({
        customer: customerId,
        amount,
        currency: 'usd',
      });
      return charge;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        console.error('Stripe error:', error.type);
      }
      throw error;
    }
  }
}

/**
 * Module-level instance
 */
const stripeClient = new Stripe(process.env.STRIPE_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * ❌ Missing try-catch on module-level instance
 * Should trigger ERROR violation
 */
async function processPaymentWithModuleInstance(amount: number) {
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount,
    currency: 'usd',
  });
  return paymentIntent;
}
