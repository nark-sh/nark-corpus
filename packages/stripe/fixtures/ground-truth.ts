/**
 * Stripe Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the stripe contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - stripe.*.create(), .confirm(), .retrieve(), .constructEvent() all have
 *     error-severity postconditions with `throws:` — each requires a try-catch
 *   - Stripe uses property-chain access: stripe.charges.create(), stripe.paymentIntents.create(), etc.
 *   - V2 uses PropertyChainDetector for these deep chains
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. create — missing try-catch (various resource types)
// ─────────────────────────────────────────────────────────────────────────────

export async function createChargeNoCatch() {
  // SHOULD_FIRE: card-error — stripe.charges.create throws StripeCardError, no try-catch
  const charge = await stripe.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa',
  });
  return charge;
}

export async function createChargeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: create inside try-catch satisfies error handling
    const charge = await stripe.charges.create({
      amount: 2000,
      currency: 'usd',
      source: 'tok_visa',
    });
    return charge;
  } catch (err: any) {
    if (err.type === 'StripeCardError') {
      throw new Error(`Card declined: ${err.decline_code}`);
    }
    throw err;
  }
}

export async function createPaymentIntentNoCatch() {
  // SHOULD_FIRE: card-error — stripe.paymentIntents.create throws StripeCardError, no try-catch
  const pi = await stripe.paymentIntents.create({
    amount: 1999,
    currency: 'usd',
  });
  return pi;
}

export async function createPaymentIntentWithCatch() {
  try {
    // SHOULD_NOT_FIRE: paymentIntents.create inside try-catch is safe
    const pi = await stripe.paymentIntents.create({
      amount: 1999,
      currency: 'usd',
    });
    return pi;
  } catch (err) {
    throw err;
  }
}

export async function createCustomerNoCatch(email: string) {
  // SHOULD_FIRE: card-error — stripe.customers.create throws StripeError, no try-catch
  const customer = await stripe.customers.create({ email });
  return customer;
}

export async function createCustomerWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: customers.create inside try-catch is safe
    const customer = await stripe.customers.create({ email });
    return customer;
  } catch (err) {
    throw err;
  }
}

export async function createSubscriptionNoCatch(customerId: string, priceId: string) {
  // SHOULD_FIRE: card-error — stripe.subscriptions.create throws, no try-catch
  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  });
  return sub;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. confirm — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmPaymentIntentNoCatch(piId: string) {
  // SHOULD_FIRE: card-error — stripe.paymentIntents.confirm throws StripeCardError, no try-catch
  const pi = await stripe.paymentIntents.confirm(piId);
  return pi;
}

export async function confirmPaymentIntentWithCatch(piId: string) {
  try {
    // SHOULD_NOT_FIRE: confirm inside try-catch is safe
    const pi = await stripe.paymentIntents.confirm(piId);
    return pi;
  } catch (err: any) {
    if (err.type === 'StripeCardError') {
      return null; // signal failure
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. constructEvent / webhooks — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function constructEventNoCatch(payload: string, sig: string, secret: string) {
  // SHOULD_FIRE: signature-verification-failed — constructEvent throws on invalid signature, no try-catch
  const event = stripe.webhooks.constructEvent(payload, sig, secret);
  return event;
}

export function constructEventWithCatch(payload: string, sig: string, secret: string) {
  try {
    // SHOULD_NOT_FIRE: constructEvent inside try-catch is safe
    const event = stripe.webhooks.constructEvent(payload, sig, secret);
    return event;
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. retrieve — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function retrieveChargeNoCatch(chargeId: string) {
  // SHOULD_FIRE: resource-not-found — stripe.charges.retrieve throws on missing resource, no try-catch
  const charge = await stripe.charges.retrieve(chargeId);
  return charge;
}

export async function retrieveChargeWithCatch(chargeId: string) {
  try {
    // SHOULD_NOT_FIRE: retrieve inside try-catch is safe
    const charge = await stripe.charges.retrieve(chargeId);
    return charge;
  } catch (err: any) {
    if (err.code === 'resource_missing') return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Class methods
// ─────────────────────────────────────────────────────────────────────────────

export class StripeService {
  private client: Stripe;

  constructor(key: string) {
    this.client = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
  }

  async createPayment(amount: number) {
    // SHOULD_FIRE: card-error — class method, paymentIntents.create, no try-catch
    const pi = await this.client.paymentIntents.create({ amount, currency: 'usd' });
    return pi;
  }

  async safeCreatePayment(amount: number) {
    try {
      // SHOULD_NOT_FIRE: class method with try-catch is safe
      const pi = await this.client.paymentIntents.create({ amount, currency: 'usd' });
      return pi;
    } catch (err) {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Arrow functions
// ─────────────────────────────────────────────────────────────────────────────

export const createRefundNoCatch = async (chargeId: string) => {
  // SHOULD_FIRE: card-error — arrow function, refunds.create, no try-catch
  const refund = await stripe.refunds.create({ charge: chargeId });
  return refund;
};

export const createRefundWithCatch = async (chargeId: string) => {
  try {
    // SHOULD_NOT_FIRE: arrow function with try-catch is safe
    const refund = await stripe.refunds.create({ charge: chargeId });
    return refund;
  } catch (err) {
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. try-finally without catch — SHOULD still fire
// ─────────────────────────────────────────────────────────────────────────────

export async function createWithTryFinallyNoCatch() {
  try {
    // SHOULD_FIRE: card-error — try-finally without catch doesn't catch exceptions
    const pi = await stripe.paymentIntents.create({ amount: 500, currency: 'usd' });
    return pi;
  } finally {
    console.log('Stripe call attempted');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. retry wrapper — concern-20260401-stripe-1
//    Stripe call inside a retry function arg satisfies rate-limit-error postcondition
// ─────────────────────────────────────────────────────────────────────────────

declare function pRetry<T>(fn: () => Promise<T>, opts?: unknown): Promise<T>;

export async function createPaymentIntentWithRetry() {
  return pRetry(async () => {
    // SHOULD_NOT_FIRE: stripe call inside pRetry wrapper — retry logic satisfies rate-limit-error.
    const pi = await stripe.paymentIntents.create({ amount: 500, currency: 'usd' });
    return pi;
  }, { retries: 3 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. capture — postconditions: capture-authorization-expired, capture-already-captured,
//    capture-invalid-state, capture-rate-limit
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: capture-authorization-expired
// @expect-violation: capture-already-captured
// @expect-violation: capture-invalid-state
export async function capturePaymentIntentNoCatch(piId: string) {
  // FUTURE_SHOULD_FIRE: capture-authorization-expired — stripe.paymentIntents.capture throws on expired
  // authorization, already-captured, invalid state — no try-catch
  // (detection rule not yet implemented — queued as concern-20260402-stripe-deepen-1)
  const pi = await stripe.paymentIntents.capture(piId);
  return pi;
}

// @expect-clean
export async function capturePaymentIntentWithCatch(piId: string) {
  try {
    // SHOULD_NOT_FIRE: capture inside try-catch handles authorization-expired and other errors
    const pi = await stripe.paymentIntents.capture(piId);
    return pi;
  } catch (err: any) {
    if (err.code === 'charge_expired_for_capture' || err.code === 'charge_already_captured') {
      throw new Error(`Capture failed: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. cancel subscription — postconditions: cancel-resource-not-found,
//     cancel-already-canceled, cancel-authentication-error
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: cancel-resource-not-found
// @expect-violation: cancel-already-canceled
export async function cancelSubscriptionNoCatch(subId: string) {
  // FUTURE_SHOULD_FIRE: cancel-resource-not-found — stripe.subscriptions.cancel throws on missing
  // or already-canceled subscription — no try-catch
  // (detection rule not yet implemented — queued as concern-20260402-stripe-deepen-2)
  const sub = await stripe.subscriptions.cancel(subId);
  return sub;
}

// @expect-clean
export async function cancelSubscriptionWithCatch(subId: string) {
  try {
    // SHOULD_NOT_FIRE: subscriptions.cancel inside try-catch handles resource-not-found
    const sub = await stripe.subscriptions.cancel(subId);
    return sub;
  } catch (err: any) {
    if (err.code === 'resource_missing') {
      return null; // already canceled or never existed
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. refund — postconditions: refund-already-refunded, refund-disputed-charge,
//     refund-invalid-amount, refund-rate-limit
//     (also covered in section 6 arrow functions above)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: refund-already-refunded
// @expect-violation: refund-disputed-charge
// @expect-violation: refund-invalid-amount
export async function createRefundNoCatchTyped(piId: string) {
  // FUTURE_SHOULD_FIRE: refund-already-refunded — stripe.refunds.create throws on already-refunded
  // or disputed charge — no try-catch (new postconditions; detection rule queued as
  // concern-20260402-stripe-deepen-3)
  const refund = await stripe.refunds.create({ payment_intent: piId });
  return refund;
}

// @expect-clean
export async function createRefundWithCatchTyped(piId: string) {
  try {
    // SHOULD_NOT_FIRE: refunds.create inside try-catch handles already-refunded
    const refund = await stripe.refunds.create({ payment_intent: piId });
    return refund;
  } catch (err: any) {
    if (err.code === 'charge_already_refunded') {
      return null; // idempotent — already refunded
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. paymentMethods.attach — postconditions: attach-already-attached,
//     attach-authentication-required
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: attach-already-attached
// @expect-violation: attach-authentication-required
export async function attachPaymentMethodNoCatch(pmId: string, customerId: string) {
  // FUTURE_SHOULD_FIRE: attach-already-attached — stripe.paymentMethods.attach throws when
  // PaymentMethod already attached to another Customer — no try-catch
  // (detection rule queued as concern-20260402-stripe-deepen-4)
  const pm = await stripe.paymentMethods.attach(pmId, { customer: customerId });
  return pm;
}

// @expect-clean
export async function attachPaymentMethodWithCatch(pmId: string, customerId: string) {
  try {
    // SHOULD_NOT_FIRE: attach inside try-catch handles already-attached error
    const pm = await stripe.paymentMethods.attach(pmId, { customer: customerId });
    return pm;
  } catch (err: any) {
    if (err.type === 'StripeInvalidRequestError') {
      throw new Error(`Cannot attach payment method: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. paymentMethods.detach — postconditions: detach-default-payment-method,
//     detach-not-attached
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: detach-default-payment-method
// @expect-violation: detach-not-attached
export async function detachPaymentMethodNoCatch(pmId: string) {
  // FUTURE_SHOULD_FIRE: detach-default-payment-method — stripe.paymentMethods.detach can silently
  // break active subscriptions if the PaymentMethod is the subscription's default — no guard
  // (detection rule queued as concern-20260402-stripe-deepen-5)
  const pm = await stripe.paymentMethods.detach(pmId);
  return pm;
}

// @expect-clean
export async function detachPaymentMethodWithCatch(pmId: string) {
  try {
    // SHOULD_NOT_FIRE: detach inside try-catch handles not-attached error
    const pm = await stripe.paymentMethods.detach(pmId);
    return pm;
  } catch (err: any) {
    if (err.type === 'StripeInvalidRequestError') {
      return null; // already detached
    }
    throw err;
  }
}
