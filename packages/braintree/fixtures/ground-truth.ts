/**
 * Braintree Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the braintree contract spec, NOT V1 behavior.
 *
 * Contracted functions (all on BraintreeGateway instance from import "braintree"):
 *   - gateway.transaction.sale()      postcondition: api-error  (functionName: 'sale')
 *   - gateway.clientToken.generate()  postcondition: api-error  (functionName: 'generate')
 *   - gateway.customer.create()       postcondition: api-error  (functionName: 'create')
 *   - gateway.customer.find()         postcondition: api-error  (functionName: 'find')
 *   - gateway.transaction.find()      postcondition: api-error  (functionName: 'find')
 *   - gateway.transaction.refund()    postcondition: api-error  (functionName: 'refund')
 *
 * Detection strategy:
 *   - braintree default import → new braintree.BraintreeGateway() → instance tracked
 *     via new instance-tracker fix (new module.ClassName() pattern)
 *   - PropertyChainDetector fires for gateway.*.method() chains (depth >= 2)
 *   - ContractMatcher matches by package='braintree' + functionName (last segment)
 *
 * Key behaviors under test:
 *   - Without try-catch → SHOULD_FIRE
 *   - Inside try-catch → SHOULD_NOT_FIRE
 *   - result.success check alone (no try-catch) → SHOULD_FIRE (business logic != infrastructure)
 *   - this.gateway.method() in class → SHOULD_FIRE (instance tracker via assignment)
 */

import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID || 'test',
  publicKey: process.env.BT_PUBLIC_KEY || 'test',
  privateKey: process.env.BT_PRIVATE_KEY || 'test',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. transaction.sale
// ─────────────────────────────────────────────────────────────────────────────

export async function saleNoCatch(amount: string, nonce: string) {
  // SHOULD_FIRE: api-error — transaction.sale throws on infrastructure failure, no try-catch
  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
  });
  return result;
}

export async function saleWithCatch(amount: string, nonce: string) {
  try {
    // SHOULD_NOT_FIRE: transaction.sale inside try-catch satisfies error handling
    const result = await gateway.transaction.sale({ amount, paymentMethodNonce: nonce });
    return result;
  } catch (err) {
    console.error('Payment failed:', err);
    throw err;
  }
}

export async function saleResultCheckOnlyNoCatch(amount: string, nonce: string) {
  // result.success check is NOT a substitute for try-catch: infrastructure errors throw
  // SHOULD_FIRE: api-error — ServerError/AuthenticationError throw, not returned in result
  const result = await gateway.transaction.sale({ amount, paymentMethodNonce: nonce });
  if (result.success) {
    return result.transaction.id;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. clientToken.generate
// ─────────────────────────────────────────────────────────────────────────────

export async function generateNoCatch() {
  // SHOULD_FIRE: api-error — clientToken.generate throws on GatewayTimeoutError, no try-catch
  const response = await gateway.clientToken.generate({});
  return response.clientToken;
}

export async function generateWithCatch(customerId?: string) {
  try {
    // SHOULD_NOT_FIRE: clientToken.generate inside try-catch
    const response = await gateway.clientToken.generate(customerId ? { customerId } : {});
    return response.clientToken;
  } catch (err) {
    throw new Error('Checkout unavailable');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. customer.create
// ─────────────────────────────────────────────────────────────────────────────

export async function customerCreateNoCatch(email: string) {
  // SHOULD_FIRE: api-error — customer.create throws on authentication/server failure
  const result = await gateway.customer.create({ email });
  return result;
}

export async function customerCreateWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: customer.create inside try-catch
    const result = await gateway.customer.create({ email });
    return result;
  } catch (err) {
    console.error('Customer create failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. customer.find
// ─────────────────────────────────────────────────────────────────────────────

export async function customerFindNoCatch(customerId: string) {
  // SHOULD_FIRE: api-error — customer.find throws NotFoundError for invalid IDs
  const customer = await gateway.customer.find(customerId);
  return customer;
}

export async function customerFindWithCatch(customerId: string) {
  try {
    // SHOULD_NOT_FIRE: customer.find inside try-catch
    const customer = await gateway.customer.find(customerId);
    return customer;
  } catch (err: any) {
    if (err.type === braintree.errorTypes.notFoundError) return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. transaction.find
// ─────────────────────────────────────────────────────────────────────────────

export async function transactionFindNoCatch(txId: string) {
  // SHOULD_FIRE: api-error — transaction.find throws NotFoundError
  const tx = await gateway.transaction.find(txId);
  return tx;
}

export async function transactionFindWithCatch(txId: string) {
  try {
    // SHOULD_NOT_FIRE: transaction.find inside try-catch
    const tx = await gateway.transaction.find(txId);
    return tx;
  } catch (err) {
    console.error('Transaction not found:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. transaction.refund
// ─────────────────────────────────────────────────────────────────────────────

export async function refundNoCatch(txId: string) {
  // SHOULD_FIRE: api-error — transaction.refund throws if wrong state
  const result = await gateway.transaction.refund(txId);
  return result;
}

export async function refundWithCatch(txId: string, amount?: string) {
  try {
    // SHOULD_NOT_FIRE: transaction.refund inside try-catch
    const result = await gateway.transaction.refund(txId, amount);
    return result;
  } catch (err) {
    console.error('Refund failed:', err);
    throw err;
  }
}
