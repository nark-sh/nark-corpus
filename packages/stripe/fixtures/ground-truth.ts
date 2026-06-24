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

// ─────────────────────────────────────────────────────────────────────────────
// 14. constructEventAsync — postconditions: construct-event-async-signature-failed,
//     construct-event-async-timestamp-tolerance
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: construct-event-async-signature-failed
// @expect-violation: construct-event-async-timestamp-tolerance
export async function constructEventAsyncNoCatch(payload: string, sig: string, secret: string) {
  // SHOULD_FIRE: construct-event-async-signature-failed — async webhook verification throws StripeSignatureVerificationError no try-catch
  const event = await stripe.webhooks.constructEventAsync(payload, sig, secret);
  return event;
}

// @expect-clean
export async function constructEventAsyncWithCatch(payload: string, sig: string, secret: string) {
  try {
    // SHOULD_NOT_FIRE: constructEventAsync inside try-catch handles signature verification failure
    const event = await stripe.webhooks.constructEventAsync(payload, sig, secret);
    return event;
  } catch (err: any) {
    console.error('Async webhook signature verification failed:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. finalizeInvoice — postconditions: finalize-no-payment-method-types,
//     finalize-invoice-not-editable
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: finalize-no-payment-method-types
// @expect-violation: finalize-invoice-not-editable
export async function finalizeInvoiceNoCatch(invoiceId: string) {
  // SHOULD_FIRE: finalize-no-payment-method-types — stripe.invoices.finalizeInvoice throws when customer has no payment method no try-catch
  const invoice = await stripe.invoices.finalizeInvoice(invoiceId);
  return invoice;
}

// @expect-clean
export async function finalizeInvoiceWithCatch(invoiceId: string) {
  try {
    // SHOULD_NOT_FIRE: finalizeInvoice inside try-catch handles no-payment-method-types
    const invoice = await stripe.invoices.finalizeInvoice(invoiceId);
    return invoice;
  } catch (err: any) {
    if (err.code === 'invoice_not_editable') {
      return null; // already finalized — treat as no-op
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. invoices.pay — postconditions: pay-requires-action, pay-card-declined,
//     pay-invoice-not-payable
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: pay-requires-action
// @expect-violation: pay-card-declined
// @expect-violation: pay-invoice-not-payable
export async function payInvoiceNoCatch(invoiceId: string) {
  // SHOULD_FIRE: pay-requires-action — stripe.invoices.pay throws when 3DS required no try-catch
  const invoice = await stripe.invoices.pay(invoiceId);
  return invoice;
}

// @expect-clean
export async function payInvoiceWithCatch(invoiceId: string) {
  try {
    // SHOULD_NOT_FIRE: invoices.pay inside try-catch handles requires-action and card-declined
    const invoice = await stripe.invoices.pay(invoiceId);
    return invoice;
  } catch (err: any) {
    if (err.code === 'invoice_payment_intent_requires_action') {
      throw new Error('3DS authentication required — redirect customer to complete payment');
    }
    if (err.type === 'StripeCardError') {
      throw new Error(`Card declined: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. sendInvoice — postconditions: send-invoice-not-open, send-invoice-invalid-email
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: send-invoice-not-open
// @expect-violation: send-invoice-invalid-email
export async function sendInvoiceNoCatch(invoiceId: string) {
  // SHOULD_FIRE: send-invoice-not-open — stripe.invoices.sendInvoice throws on non-open invoice no try-catch
  const invoice = await stripe.invoices.sendInvoice(invoiceId);
  return invoice;
}

// @expect-clean
export async function sendInvoiceWithCatch(invoiceId: string) {
  try {
    // SHOULD_NOT_FIRE: sendInvoice inside try-catch handles not-open and invalid-email
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    return invoice;
  } catch (err: any) {
    if (err.code === 'email_invalid') {
      throw new Error('Customer email address is invalid — update before sending invoice');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. voidInvoice — postconditions: void-invoice-invalid-state, void-invoice-rate-limit
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: void-invoice-invalid-state
// @expect-violation: void-invoice-rate-limit
export async function voidInvoiceNoCatch(invoiceId: string) {
  // SHOULD_FIRE: void-invoice-invalid-state — stripe.invoices.voidInvoice throws on non-open invoice no try-catch
  const invoice = await stripe.invoices.voidInvoice(invoiceId);
  return invoice;
}

// @expect-clean
export async function voidInvoiceWithCatch(invoiceId: string) {
  try {
    // SHOULD_NOT_FIRE: voidInvoice inside try-catch handles invalid-state errors
    const invoice = await stripe.invoices.voidInvoice(invoiceId);
    return invoice;
  } catch (err: any) {
    if (err.code === 'status_transition_invalid') {
      throw new Error(`Cannot void invoice in current state: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. markUncollectible — postconditions: mark-uncollectible-invalid-state
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: mark-uncollectible-invalid-state
export async function markUncollectibleNoCatch(invoiceId: string) {
  // SHOULD_FIRE: mark-uncollectible-invalid-state — stripe.invoices.markUncollectible throws on non-open invoice no try-catch
  const invoice = await stripe.invoices.markUncollectible(invoiceId);
  return invoice;
}

// @expect-clean
export async function markUncollectibleWithCatch(invoiceId: string) {
  try {
    // SHOULD_NOT_FIRE: markUncollectible inside try-catch handles invalid-state
    const invoice = await stripe.invoices.markUncollectible(invoiceId);
    return invoice;
  } catch (err: any) {
    if (err.code === 'status_transition_invalid') {
      return null; // already paid or voided — treat as no-op
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. subscriptions.resume — postconditions: resume-invalid-state, resume-payment-required
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: resume-invalid-state
// @expect-violation: resume-payment-required
export async function resumeSubscriptionNoCatch(subId: string) {
  // SHOULD_FIRE: resume-invalid-state — stripe.subscriptions.resume throws when subscription is not paused no try-catch
  const sub = await stripe.subscriptions.resume(subId);
  return sub;
}

// @expect-clean
export async function resumeSubscriptionWithCatch(subId: string) {
  try {
    // SHOULD_NOT_FIRE: subscriptions.resume inside try-catch handles invalid-state
    const sub = await stripe.subscriptions.resume(subId);
    // Must check status after resume — may still be paused if invoice payment failed
    if (sub.status !== 'active') {
      throw new Error('Subscription resumed but payment required before activation');
    }
    return sub;
  } catch (err: any) {
    if (err.code === 'status_transition_invalid') {
      throw new Error('Subscription is not in paused state — cannot resume');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. paymentIntents.incrementAuthorization — postconditions: increment-authorization-card-declined,
//     increment-authorization-invalid-state
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: increment-authorization-card-declined
// @expect-violation: increment-authorization-invalid-state
export async function incrementAuthorizationNoCatch(piId: string, amount: number) {
  // SHOULD_FIRE: increment-authorization-card-declined — stripe.paymentIntents.incrementAuthorization throws StripeCardError no try-catch
  const pi = await stripe.paymentIntents.incrementAuthorization(piId, { amount });
  return pi;
}

// @expect-clean
export async function incrementAuthorizationWithCatch(piId: string, amount: number) {
  try {
    // SHOULD_NOT_FIRE: incrementAuthorization inside try-catch handles card-declined
    const pi = await stripe.paymentIntents.incrementAuthorization(piId, { amount });
    return pi;
  } catch (err: any) {
    if (err.type === 'StripeCardError') {
      // Issuer declined increment — can still capture for original amount
      return null; // signal: increment failed, use original amount
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. paymentIntents.verifyMicrodeposits — postconditions: verify-microdeposits-amounts-mismatch,
//     verify-microdeposits-attempts-exceeded, verify-microdeposits-timeout
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: verify-microdeposits-amounts-mismatch
// @expect-violation: verify-microdeposits-attempts-exceeded
// @expect-violation: verify-microdeposits-timeout
export async function verifyMicrodepositsNoCatch(piId: string, amounts: number[]) {
  // SHOULD_FIRE: verify-microdeposits-amounts-mismatch — stripe.paymentIntents.verifyMicrodeposits throws when amounts don't match no try-catch
  const pi = await stripe.paymentIntents.verifyMicrodeposits(piId, { amounts });
  return pi;
}

// @expect-clean
export async function verifyMicrodepositsWithCatch(piId: string, amounts: number[]) {
  try {
    // SHOULD_NOT_FIRE: verifyMicrodeposits inside try-catch handles mismatch and timeout
    const pi = await stripe.paymentIntents.verifyMicrodeposits(piId, { amounts });
    return pi;
  } catch (err: any) {
    if (err.code === 'payment_method_microdeposit_verification_amounts_mismatch') {
      throw new Error('Deposit amounts incorrect — please re-enter the amounts from your bank statement');
    }
    if (err.code === 'payment_method_microdeposit_verification_attempts_exceeded') {
      throw new Error('Too many failed attempts — please add a new bank account');
    }
    if (err.code === 'payment_method_microdeposit_verification_timeout') {
      throw new Error('Verification window expired — please start bank account verification again');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. Helper-function-returned instance (scanner-upgrade regression case)
//     The Stripe instance is created inside a helper function whose return value
//     is not directly recognized as a known factory. Mirrors FullAgent/fulling
//     github-app.ts getAppInstance() pattern. Resolved via TypeScript return-type
//     inference in InstanceTrackerPlugin (Case 2 typeChecker fallback).
// ─────────────────────────────────────────────────────────────────────────────

let _lazyStripe: Stripe | null = null;

function getLazyStripe(): Stripe {
  if (!_lazyStripe) {
    _lazyStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _lazyStripe;
}

function makeStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Use distinct variable names (lazyClient / madeClient) so they don't collide
// with the module-level `stripe` already in InstanceTrackerPlugin.instanceMap.
// Names like `stripe` would shadow-resolve to the module-level binding and
// the test would pass for the wrong reason.

export async function createChargeViaLazyHelper() {
  const lazyClient = getLazyStripe();
  // SHOULD_FIRE: card-error — helper-fn-returned instance, charges.create without try-catch
  const charge = await lazyClient.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa',
  });
  return charge;
}

export async function createChargeViaSimpleHelper() {
  const madeClient = makeStripe();
  // SHOULD_FIRE: card-error — direct-return helper, charges.create without try-catch
  const charge = await madeClient.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa',
  });
  return charge;
}

export async function createChargeViaLazyHelperWithCatch() {
  const lazyClient = getLazyStripe();
  try {
    // SHOULD_NOT_FIRE: helper-fn-returned instance inside try-catch is safe
    const charge = await lazyClient.charges.create({
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

export async function constructEventViaHelper(payload: string, sig: string, secret: string) {
  const lazyClient = getLazyStripe();
  // SHOULD_FIRE: signature-verification-failed — helper-fn instance, webhooks.constructEvent without try-catch
  const event = lazyClient.webhooks.constructEvent(payload, sig, secret);
  return event;
}

// update — added in deepen pass 78 (2026-06-24)
// Covers StripePermissionError, StripeIdempotencyError, invalid-state-transition, invalid-parameter.

export async function updateCustomerNoCatch() {
  // SHOULD_FIRE: update-permission-error
  const customer = await stripe.customers.update('cus_123', { email: 'new@example.com' });
  return customer;
}

export async function updateCustomerWithCatch() {
  try {
    // SHOULD_NOT_FIRE: update inside try-catch satisfies all four update postconditions
    const customer = await stripe.customers.update('cus_123', { email: 'new@example.com' });
    return customer;
  } catch (err: any) {
    if (err.type === 'StripePermissionError') throw new Error(`perm: ${err.message}`);
    if (err.type === 'StripeIdempotencyError') throw new Error(`idem: ${err.message}`);
    throw err;
  }
}

export async function updateSubscriptionNoCatch() {
  // SHOULD_FIRE: update-invalid-state-transition
  const sub = await stripe.subscriptions.update('sub_123', { metadata: { plan_tier: 'gold' } });
  return sub;
}

export async function updateInvoiceWithInstanceofCatch() {
  try {
    // SHOULD_NOT_FIRE: instanceof Stripe.errors.StripePermissionError satisfies the postcondition
    const invoice = await stripe.invoices.update('in_123', { description: 'updated' });
    return invoice;
  } catch (err) {
    if (err instanceof Stripe.errors.StripePermissionError) throw new Error('perm');
    if (err instanceof Stripe.errors.StripeIdempotencyError) throw new Error('idem');
    throw err;
  }
}

export async function updatePaymentIntentNoCatchInvalidParam() {
  // SHOULD_FIRE: update-invalid-parameter
  const pi = await stripe.paymentIntents.update('pi_123', { amount: 5000 });
  return pi;
}
