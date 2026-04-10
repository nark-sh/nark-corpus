/**
 * Missing error handling for braintree.
 * All gateway calls lack try-catch — should produce ERROR violations.
 *
 * Braintree throws on: AuthenticationError, NotFoundError, ServerError,
 * GatewayTimeoutError, ServiceUnavailableError, TooManyRequestsError.
 * These are NOT returned in result objects — they must be caught with try-catch.
 */

import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID || 'test',
  publicKey: process.env.BT_PUBLIC_KEY || 'test',
  privateKey: process.env.BT_PRIVATE_KEY || 'test',
});

// ─── transaction.sale — no try-catch ─────────────────────────────────────────

export async function processPaymentNoCatch(amount: string, nonce: string) {
  // ❌ No try-catch: AuthenticationError or ServerError will crash caller
  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
  });
  return result.transaction.id;
}

export async function processPaymentResultOnlyNoTryCatch(amount: string, nonce: string) {
  // ❌ Checking result.success is necessary but NOT sufficient — still needs try-catch
  const result = await gateway.transaction.sale({ amount, paymentMethodNonce: nonce });
  if (result.success) {
    return result.transaction.id;
  }
  return null;
}

// ─── clientToken.generate — no try-catch ─────────────────────────────────────

export async function generateTokenNoCatch() {
  // ❌ No try-catch: GatewayTimeoutError or ServerError will crash endpoint
  const response = await gateway.clientToken.generate({});
  return response.clientToken;
}

export async function generateTokenForCustomerNoCatch(customerId: string) {
  // ❌ No try-catch
  const response = await gateway.clientToken.generate({ customerId });
  return response.clientToken;
}

// ─── customer.create — no try-catch ──────────────────────────────────────────

export async function createCustomerNoCatch(email: string, firstName: string) {
  // ❌ No try-catch: AuthenticationError crashes caller
  const result = await gateway.customer.create({ email, firstName });
  return result.customer.id;
}

// ─── customer.find — no try-catch ────────────────────────────────────────────

export async function findCustomerNoCatch(customerId: string) {
  // ❌ No try-catch: NotFoundError throws if customerId is invalid/stale
  const customer = await gateway.customer.find(customerId);
  return customer;
}

// ─── transaction.find — no try-catch ─────────────────────────────────────────

export async function findTransactionNoCatch(transactionId: string) {
  // ❌ No try-catch: NotFoundError throws if transactionId is invalid
  const transaction = await gateway.transaction.find(transactionId);
  return transaction;
}

// ─── transaction.refund — no try-catch ───────────────────────────────────────

export async function refundTransactionNoCatch(transactionId: string) {
  // ❌ No try-catch: throws if transaction is in wrong state for refund
  const result = await gateway.transaction.refund(transactionId);
  return result.transaction.id;
}

// ─── paymentMethod.create — no try-catch ────────────────────────────────────

export async function createPaymentMethodNoCatch(customerId: string, nonce: string) {
  // ❌ No try-catch
  const result = await gateway.paymentMethod.create({
    customerId,
    paymentMethodNonce: nonce,
  });
  return result.paymentMethod.token;
}

// ─── subscription.create — no try-catch ──────────────────────────────────────

export async function createSubscriptionNoCatch(paymentMethodToken: string, planId: string) {
  // ❌ No try-catch
  const result = await gateway.subscription.create({
    paymentMethodToken,
    planId,
  });
  return result.subscription.id;
}
