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

// ─────────────────────────────────────────────────────────────────────────────
// 7. transaction.void
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: void-no-try-catch
export async function voidNoCatch(txId: string) {
  // SHOULD_FIRE: void-no-try-catch — throws on infrastructure failure
  const result = await gateway.transaction.void(txId);
  return result;
}

// @expect-clean
export async function voidWithCatch(txId: string) {
  try {
    // SHOULD_NOT_FIRE: transaction.void inside try-catch
    const result = await gateway.transaction.void(txId);
    if (!result.success) {
      console.error('Void failed (state):', result.message);
    }
    return result;
  } catch (err) {
    console.error('Void failed (infrastructure):', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. transaction.submitForSettlement
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: submit-settlement-no-try-catch
export async function submitForSettlementNoCatch(txId: string) {
  // SHOULD_FIRE: submit-settlement-no-try-catch — throws on infrastructure failure
  const result = await gateway.transaction.submitForSettlement(txId);
  return result;
}

// @expect-clean
export async function submitForSettlementWithCatch(txId: string, amount?: string) {
  try {
    // SHOULD_NOT_FIRE: submitForSettlement inside try-catch
    const result = await gateway.transaction.submitForSettlement(txId, amount);
    if (!result.success) {
      console.error('Settlement failed:', result.message);
    }
    return result;
  } catch (err) {
    console.error('Settlement infrastructure failure:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. subscription.cancel
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: subscription-cancel-no-try-catch
export async function subscriptionCancelNoCatch(subscriptionId: string) {
  // SHOULD_FIRE: subscription-cancel-no-try-catch — throws NotFoundError if ID invalid
  const result = await gateway.subscription.cancel(subscriptionId);
  return result;
}

// @expect-clean
export async function subscriptionCancelWithCatch(subscriptionId: string) {
  try {
    // SHOULD_NOT_FIRE: subscription.cancel inside try-catch
    await gateway.subscription.cancel(subscriptionId);
  } catch (err: any) {
    if (err.type === 'notFoundError') {
      // Already gone — treat as idempotent success
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. subscription.retryCharge
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: retry-charge-no-try-catch
export async function retryChargeNoCatch(subscriptionId: string) {
  // SHOULD_FIRE: retry-charge-no-try-catch — throws on infrastructure failure
  const result = await gateway.subscription.retryCharge(subscriptionId, undefined, true);
  return result;
}

// @expect-clean
export async function retryChargeWithCatch(subscriptionId: string) {
  try {
    // SHOULD_NOT_FIRE: retryCharge inside try-catch with result.success check
    const result = await gateway.subscription.retryCharge(subscriptionId, undefined, true);
    if (result.success) {
      return result.transaction.id;
    } else {
      console.error('Retry charge declined:', result.message);
      return null;
    }
  } catch (err) {
    console.error('Retry charge infrastructure failure:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. webhookNotification.parse
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: webhook-parse-no-try-catch
export async function webhookParseNoCatch(btSignature: string, btPayload: string) {
  // SHOULD_FIRE: webhook-parse-no-try-catch — throws InvalidSignatureError on tampered payload
  const notification = await gateway.webhookNotification.parse(btSignature, btPayload);
  return notification;
}

// @expect-clean
export async function webhookParseWithCatch(btSignature: string, btPayload: string) {
  try {
    // SHOULD_NOT_FIRE: webhookNotification.parse inside try-catch
    const notification = await gateway.webhookNotification.parse(btSignature, btPayload);
    return notification;
  } catch (err: any) {
    if (err.type === 'invalidSignatureError') {
      console.error('Webhook signature invalid — rejecting:', err.message);
      return null; // Return 200 to Braintree to prevent re-delivery
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. dispute.accept
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dispute-accept-no-try-catch
export async function disputeAcceptNoCatch(disputeId: string) {
  // SHOULD_FIRE: dispute-accept-no-try-catch — throws NotFoundError if dispute closed/invalid
  const result = await gateway.dispute.accept(disputeId);
  return result;
}

// @expect-clean
export async function disputeAcceptWithCatch(disputeId: string) {
  try {
    // SHOULD_NOT_FIRE: dispute.accept inside try-catch
    const result = await gateway.dispute.accept(disputeId);
    if (!result.success) {
      console.error('Dispute accept failed:', result.message);
    }
    return result;
  } catch (err) {
    console.error('Dispute accept infrastructure failure:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. dispute.finalize
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dispute-finalize-no-try-catch
export async function disputeFinalizeNoCatch(disputeId: string) {
  // SHOULD_FIRE: dispute-finalize-no-try-catch — throws if dispute invalid
  const result = await gateway.dispute.finalize(disputeId);
  return result;
}

// @expect-clean
export async function disputeFinalizeWithCatch(disputeId: string) {
  try {
    // SHOULD_NOT_FIRE: dispute.finalize inside try-catch
    const result = await gateway.dispute.finalize(disputeId);
    if (!result.success) {
      console.error('Dispute finalize failed:', result.message);
    }
    return result;
  } catch (err) {
    console.error('Dispute finalize infrastructure failure:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. customer.update / subscription.update / paymentMethod.update
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: update-no-try-catch
export async function customerUpdateNoCatch(customerId: string, email: string) {
  // SHOULD_FIRE: update-no-try-catch — throws on infrastructure failure
  const result = await gateway.customer.update(customerId, { email });
  return result;
}

// @expect-clean
export async function customerUpdateWithCatch(customerId: string, email: string) {
  try {
    // SHOULD_NOT_FIRE: customer.update inside try-catch
    const result = await gateway.customer.update(customerId, { email });
    if (!result.success) {
      console.error('Customer update failed:', result.message);
    }
    return result;
  } catch (err) {
    console.error('Customer update infrastructure failure:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. customer.delete / paymentMethod.delete
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: delete-no-try-catch
export async function customerDeleteNoCatch(customerId: string) {
  // SHOULD_FIRE: delete-no-try-catch — throws NotFoundError if already deleted
  await gateway.customer.delete(customerId);
}

// @expect-clean
export async function customerDeleteWithCatch(customerId: string) {
  try {
    // SHOULD_NOT_FIRE: customer.delete inside try-catch
    await gateway.customer.delete(customerId);
  } catch (err: any) {
    if (err.type === 'notFoundError') {
      // Already deleted — idempotent success
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. dispute.addTextEvidence
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dispute-add-text-evidence-no-try-catch
export async function disputeAddTextEvidenceNoCatch(disputeId: string, content: string) {
  // SHOULD_FIRE: dispute-add-text-evidence-no-try-catch
  const result = await gateway.dispute.addTextEvidence(disputeId, { content, category: 'PROOF_OF_FULFILLMENT' });
  return result;
}

// @expect-clean
export async function disputeAddTextEvidenceWithCatch(disputeId: string, content: string) {
  try {
    // SHOULD_NOT_FIRE: addTextEvidence inside try-catch
    const result = await gateway.dispute.addTextEvidence(disputeId, { content, category: 'PROOF_OF_FULFILLMENT' });
    if (!result.success) {
      console.error('addTextEvidence rejected:', result.message);
    }
    return result;
  } catch (err: any) {
    if (err.type === 'notFoundError') {
      // Dispute no longer in OPEN state — re-fetch and abort cleanly
      return null;
    }
    if (err.name === 'InvalidKeysError') {
      throw new Error(`Evidence validation failed: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. dispute.addFileEvidence
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dispute-add-file-evidence-no-try-catch
export async function disputeAddFileEvidenceNoCatch(disputeId: string, documentId: string) {
  // SHOULD_FIRE: dispute-add-file-evidence-no-try-catch
  const result = await gateway.dispute.addFileEvidence(disputeId, { documentId, category: 'PROOF_OF_FULFILLMENT' });
  return result;
}

// @expect-clean
export async function disputeAddFileEvidenceWithCatch(disputeId: string, documentId: string) {
  try {
    // SHOULD_NOT_FIRE: addFileEvidence inside try-catch
    const result = await gateway.dispute.addFileEvidence(disputeId, { documentId, category: 'PROOF_OF_FULFILLMENT' });
    if (!result.success) {
      throw new Error(`File evidence rejected: ${result.message}`);
    }
    return result;
  } catch (err: any) {
    if (err.type === 'notFoundError') {
      // Re-verify dispute state and documentUpload existence
      return null;
    }
    throw err;
  }
}
