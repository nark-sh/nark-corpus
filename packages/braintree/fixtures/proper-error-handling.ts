/**
 * Proper error handling for braintree.
 * All gateway calls are wrapped in try-catch — should produce 0 violations.
 *
 * Braintree uses a dual error model:
 *   - Infrastructure failures THROW (require try-catch)
 *   - Business logic failures are returned in result object (check result.success)
 * This fixture demonstrates correct handling of both.
 */

import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID || 'test',
  publicKey: process.env.BT_PUBLIC_KEY || 'test',
  privateKey: process.env.BT_PRIVATE_KEY || 'test',
});

// ─── transaction.sale — proper handling ──────────────────────────────────────

export async function processPaymentProper(amount: string, nonce: string) {
  try {
    const result = await gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });
    if (result.success) {
      return { transactionId: result.transaction.id };
    } else {
      return { error: result.message };
    }
  } catch (err) {
    // Infrastructure failure: auth error, network, timeout, server error
    throw new Error(`Payment infrastructure failure: ${err}`);
  }
}

export async function processPaymentWithCatchOnly(amount: string, nonce: string) {
  try {
    const result = await gateway.transaction.sale({ amount, paymentMethodNonce: nonce });
    return result;
  } catch (err) {
    console.error('transaction.sale failed:', err);
    throw err;
  }
}

// ─── clientToken.generate — proper handling ──────────────────────────────────

export async function generateClientTokenProper(customerId?: string) {
  try {
    const response = await gateway.clientToken.generate(
      customerId ? { customerId } : {}
    );
    return response.clientToken;
  } catch (err) {
    console.error('Failed to generate client token:', err);
    throw new Error('Checkout unavailable — try again later');
  }
}

// ─── customer.create — proper handling ───────────────────────────────────────

export async function createCustomerProper(email: string, firstName: string) {
  try {
    const result = await gateway.customer.create({ email, firstName });
    if (result.success) {
      return { customerId: result.customer.id };
    } else {
      return { error: result.message };
    }
  } catch (err) {
    console.error('Failed to create customer:', err);
    throw err;
  }
}

// ─── customer.find — proper handling ─────────────────────────────────────────

export async function findCustomerProper(customerId: string) {
  try {
    const customer = await gateway.customer.find(customerId);
    return customer;
  } catch (err: any) {
    if (err.type === braintree.errorTypes.notFoundError) {
      return null;
    }
    throw err;
  }
}

// ─── transaction.find — proper handling ──────────────────────────────────────

export async function findTransactionProper(transactionId: string) {
  try {
    const transaction = await gateway.transaction.find(transactionId);
    return transaction;
  } catch (err: any) {
    if (err.type === braintree.errorTypes.notFoundError) {
      return null;
    }
    throw err;
  }
}

// ─── transaction.refund — proper handling ────────────────────────────────────

export async function refundTransactionProper(transactionId: string, amount?: string) {
  try {
    const result = await gateway.transaction.refund(transactionId, amount);
    if (result.success) {
      return { refundId: result.transaction.id };
    } else {
      return { error: result.message };
    }
  } catch (err) {
    console.error('Refund failed:', err);
    throw err;
  }
}

// ─── paymentMethod.create — proper handling ───────────────────────────────────

export async function createPaymentMethodProper(customerId: string, nonce: string) {
  try {
    const result = await gateway.paymentMethod.create({
      customerId,
      paymentMethodNonce: nonce,
    });
    if (result.success) {
      return { token: result.paymentMethod.token };
    } else {
      return { error: result.message };
    }
  } catch (err) {
    console.error('Failed to create payment method:', err);
    throw err;
  }
}

// ─── subscription.create — proper handling ───────────────────────────────────

export async function createSubscriptionProper(paymentMethodToken: string, planId: string) {
  try {
    const result = await gateway.subscription.create({
      paymentMethodToken,
      planId,
    });
    if (result.success) {
      return { subscriptionId: result.subscription.id };
    } else {
      return { error: result.message };
    }
  } catch (err) {
    console.error('Failed to create subscription:', err);
    throw err;
  }
}
