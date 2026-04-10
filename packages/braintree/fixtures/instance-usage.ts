/**
 * Instance usage patterns for braintree.
 * Tests detection via class instance tracking (BraintreeGateway).
 * All patterns should produce violations where try-catch is absent.
 */

import braintree from 'braintree';

// ─── Service class pattern ─────────────────────────────────────────────────

class PaymentService {
  private gateway: braintree.BraintreeGateway;

  constructor() {
    this.gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Production,
      merchantId: process.env.BT_MERCHANT_ID || '',
      publicKey: process.env.BT_PUBLIC_KEY || '',
      privateKey: process.env.BT_PRIVATE_KEY || '',
    });
  }

  // ❌ No try-catch: throws on infrastructure failure
  async charge(amount: string, nonce: string) {
    const result = await this.gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });
    return result;
  }

  // ✅ Wrapped in try-catch
  async chargeWithErrorHandling(amount: string, nonce: string) {
    try {
      const result = await this.gateway.transaction.sale({
        amount,
        paymentMethodNonce: nonce,
        options: { submitForSettlement: true },
      });
      return result;
    } catch (err) {
      console.error('Payment failed:', err);
      throw err;
    }
  }

  // ❌ No try-catch: NotFoundError will crash
  async getTransaction(id: string) {
    const tx = await this.gateway.transaction.find(id);
    return tx;
  }
}

// ─── Module-level gateway (assigned separately) ──────────────────────────────

let moduleGateway: braintree.BraintreeGateway;

function initGateway() {
  moduleGateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: 'test',
    publicKey: 'test',
    privateKey: 'test',
  });
}

// ❌ No try-catch on module-level gateway usage
export async function generateClientToken() {
  initGateway();
  const response = await moduleGateway.clientToken.generate({});
  return response.clientToken;
}

// ─── Inline gateway creation + usage ─────────────────────────────────────────

export async function createCustomerInline(email: string) {
  const gw = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: 'test',
    publicKey: 'test',
    privateKey: 'test',
  });

  // ❌ No try-catch
  const result = await gw.customer.create({ email });
  return result.customer.id;
}
