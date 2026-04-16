/**
 * Ground-truth test fixtures for square@44+ (SquareClient API)
 *
 * Annotations:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                           — scanner MUST NOT flag this
 *
 * Postconditions tested:
 *   square-payments-create-auth-error
 *   square-payments-create-card-declined
 *   square-payments-create-invalid-request
 *   square-payments-create-rate-limit
 *   square-payments-create-timeout
 *   square-refunds-refund-payment-error
 *   square-subscriptions-create-customer-error
 *   square-subscriptions-cancel-error
 *   square-orders-create-error
 *   square-customers-create-error
 *   square-customers-delete-error
 *   square-cards-create-source-used          (deepen-stream-2 pass 4)
 *   square-cards-create-customer-not-found   (deepen-stream-2 pass 4)
 *   square-cards-create-processing-not-enabled (deepen-stream-2 pass 4)
 *   square-invoices-create-error             (deepen-stream-2 pass 4)
 *   square-invoices-publish-card-declined    (deepen-stream-2 pass 4)
 *   square-invoices-publish-wrong-version    (deepen-stream-2 pass 4)
 *   square-orders-update-version-conflict    (deepen-stream-2 pass 4)
 *   square-orders-update-closed-order        (deepen-stream-2 pass 4)
 *   square-orders-pay-amount-mismatch        (deepen-stream-2 pass 4)
 *   square-orders-pay-timeout                (deepen-stream-2 pass 4)
 */

import { SquareClient, SquareError, SquareTimeoutError } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN || "sandbox-token",
});

// ─── VIOLATION CASES ─────────────────────────────────────────────────────────

// @expect-violation: square-payments-create-auth-error
// @expect-violation: square-payments-create-card-declined
// @expect-violation: square-payments-create-invalid-request
// @expect-violation: square-payments-create-rate-limit
// @expect-violation: square-payments-create-timeout
async function createPaymentMissingErrorHandling() {
  // ❌ No try-catch — all SquareError and SquareTimeoutError are unhandled
  const response = await client.payments.create({
    sourceId: "cnon:card-nonce-ok",
    idempotencyKey: `pay-${Date.now()}`,
    amountMoney: { amount: BigInt(1000), currency: "USD" },
  });
  return response;
}

// @expect-violation: square-refunds-refund-payment-error
// @expect-violation: square-refunds-auth-or-rate-limit
async function refundPaymentMissingErrorHandling(paymentId: string) {
  // ❌ No try-catch — REFUND_ERROR and auth/rate-limit errors unhandled
  const response = await client.refunds.refundPayment({
    idempotencyKey: `refund-${Date.now()}`,
    amountMoney: { amount: BigInt(500), currency: "USD" },
    paymentId,
  });
  return response;
}

// @expect-violation: square-subscriptions-create-customer-error
// @expect-violation: square-subscriptions-create-card-error
async function createSubscriptionMissingErrorHandling(customerId: string) {
  // ❌ No try-catch — CUSTOMER_NOT_FOUND and CARD_PROCESSING errors unhandled
  const response = await client.subscriptions.create({
    idempotencyKey: `sub-${Date.now()}`,
    locationId: "LOCATION_ID",
    planVariationId: "PLAN_VARIATION_ID",
    customerId,
    cardId: "ccof:customer-card-id-ok",
  });
  // ❌ No check on response.subscription.status — may be PENDING not ACTIVE
  return response;
}

// @expect-violation: square-subscriptions-cancel-error
async function cancelSubscriptionMissingErrorHandling(subscriptionId: string) {
  // ❌ No try-catch — NOT_FOUND and already-cancelled errors unhandled
  const response = await client.subscriptions.cancel({ subscriptionId });
  return response;
}

// @expect-violation: square-orders-create-error
async function createOrderMissingErrorHandling() {
  // ❌ No try-catch — INVALID_LOCATION and validation errors unhandled
  const response = await client.orders.create({
    order: {
      locationId: "LOCATION_ID",
      lineItems: [
        {
          name: "Widget",
          quantity: "1",
          basePriceMoney: { amount: BigInt(500), currency: "USD" },
        },
      ],
    },
    idempotencyKey: `order-${Date.now()}`,
  });
  return response;
}

// @expect-violation: square-customers-create-error
async function createCustomerMissingErrorHandling(email: string) {
  // ❌ No try-catch — INVALID_EMAIL_ADDRESS and auth errors unhandled
  const response = await client.customers.create({
    emailAddress: email,
    givenName: "John",
    familyName: "Doe",
  });
  return response;
}

// @expect-violation: square-customers-delete-error
async function deleteCustomerMissingErrorHandling(customerId: string) {
  // ❌ No try-catch — CUSTOMER_NOT_FOUND silently swallowed, GDPR risk
  const response = await client.customers.delete({ customerId });
  return response;
}

// @expect-violation: square-payments-complete-error
async function completePaymentMissingErrorHandling(paymentId: string) {
  // ❌ No try-catch — authorization hold expiry and state errors unhandled
  const response = await client.payments.complete({ paymentId });
  return response;
}

// @expect-violation: square-payments-cancel-error
async function cancelPaymentMissingErrorHandling(paymentId: string) {
  // ❌ No try-catch — INVALID_REQUEST_ERROR for already-completed payment unhandled
  const response = await client.payments.cancel({ paymentId });
  return response;
}

// ─── NEW VIOLATION CASES (deepen-stream-2 pass 4) ────────────────────────────

// @expect-violation: square-cards-create-source-used
// @expect-violation: square-cards-create-customer-not-found
// @expect-violation: square-cards-create-processing-not-enabled
async function createCardMissingErrorHandling(customerId: string, sourceId: string) {
  // ❌ No try-catch — SOURCE_USED (nonce reuse), CUSTOMER_NOT_FOUND,
  // and CARD_PROCESSING_NOT_ENABLED all unhandled
  const response = await client.cards.create({
    idempotencyKey: `card-${Date.now()}`,
    sourceId,
    card: { customerId },
  });
  return response;
}

// @expect-violation: square-invoices-create-error
async function createInvoiceMissingErrorHandling(orderId: string, customerId: string) {
  // ❌ No try-catch — INVALID_REQUEST_ERROR (bad order, missing customer data) unhandled
  const response = await client.invoices.create({
    invoice: {
      locationId: "LOCATION_ID",
      orderId,
      primaryRecipient: { customerId },
      paymentRequests: [{ requestType: "BALANCE", dueDate: "2030-01-24" }],
      deliveryMethod: "EMAIL",
    },
    idempotencyKey: `inv-${Date.now()}`,
  });
  return response;
}

// @expect-violation: square-invoices-publish-card-declined
// @expect-violation: square-invoices-publish-wrong-version
async function publishInvoiceMissingErrorHandling(invoiceId: string, version: number) {
  // ❌ No try-catch — CARD_DECLINED at publish time and version mismatch unhandled
  const response = await client.invoices.publish({
    invoiceId,
    version,
    idempotencyKey: `pub-${Date.now()}`,
  });
  return response;
}

// @expect-violation: square-orders-update-version-conflict
// @expect-violation: square-orders-update-closed-order
async function updateOrderMissingErrorHandling(orderId: string, version: number) {
  // ❌ No try-catch — version conflict and closed-order errors unhandled
  const response = await client.orders.update({
    orderId,
    order: {
      locationId: "LOCATION_ID",
      lineItems: [
        {
          name: "Widget",
          quantity: "2",
          basePriceMoney: { amount: BigInt(500), currency: "USD" },
        },
      ],
      version,
    },
    idempotencyKey: `upd-${Date.now()}`,
  });
  return response;
}

// @expect-violation: square-orders-pay-amount-mismatch
// @expect-violation: square-orders-pay-timeout
async function payOrderMissingErrorHandling(orderId: string, paymentIds: string[]) {
  // ❌ No try-catch — amount mismatch and SquareTimeoutError unhandled
  const response = await client.orders.pay({
    orderId,
    idempotencyKey: `pay-${Date.now()}`,
    paymentIds,
  });
  return response;
}

// ─── NEW CLEAN CASES (deepen-stream-2 pass 4) ────────────────────────────────

// @expect-clean
async function createCardWithProperHandling(customerId: string, sourceId: string) {
  try {
    const response = await client.cards.create({
      idempotencyKey: `card-${Date.now()}`,
      sourceId,
      card: { customerId },
    });
    return response;
  } catch (err) {
    if (err instanceof SquareError) {
      const code = err.errors?.[0]?.code;
      if (code === "SOURCE_USED" || code === "SOURCE_EXPIRED") {
        throw new Error("Card nonce expired or already used — generate a new nonce");
      }
      if (code === "CUSTOMER_NOT_FOUND") {
        throw new Error("Customer not found — create customer profile first");
      }
      if (code === "CARD_PROCESSING_NOT_ENABLED") {
        throw new Error("Card processing not enabled for this location — contact Square support");
      }
    }
    throw err;
  }
}

// @expect-clean
async function publishInvoiceWithProperHandling(invoiceId: string, version: number) {
  try {
    const response = await client.invoices.publish({
      invoiceId,
      version,
      idempotencyKey: `pub-${Date.now()}`,
    });
    return response;
  } catch (err) {
    if (err instanceof SquareError) {
      const category = err.errors?.[0]?.category;
      const code = err.errors?.[0]?.code;
      if (category === "PAYMENT_METHOD_ERROR") {
        throw new Error(`Invoice payment declined: ${code}`);
      }
      throw new Error(`Invoice publish failed: ${code}`);
    }
    throw err;
  }
}

// @expect-clean
async function payOrderWithProperHandling(orderId: string, paymentIds: string[]) {
  try {
    const response = await client.orders.pay({
      orderId,
      idempotencyKey: `pay-${Date.now()}`,
      paymentIds,
    });
    return response;
  } catch (err) {
    if (err instanceof SquareTimeoutError) {
      throw new Error("Order pay timeout — verify order status before retrying");
    }
    if (err instanceof SquareError) {
      throw new Error(`Order payment failed: ${err.errors?.[0]?.code}`);
    }
    throw err;
  }
}

// ─── CLEAN CASES ─────────────────────────────────────────────────────────────

// @expect-clean
async function createPaymentWithProperHandling() {
  try {
    const response = await client.payments.create({
      sourceId: "cnon:card-nonce-ok",
      idempotencyKey: `pay-${Date.now()}`,
      amountMoney: { amount: BigInt(1000), currency: "USD" },
    });
    return response;
  } catch (err) {
    if (err instanceof SquareTimeoutError) {
      // Network timeout — check payment status before retrying to avoid double charge
      throw new Error("Payment timeout — check status before retrying");
    }
    if (err instanceof SquareError) {
      const firstError = err.errors?.[0];
      if (firstError?.category === "PAYMENT_METHOD_ERROR") {
        // Card declined — show user-friendly message based on code
        throw new Error(`Card declined: ${firstError.code}`);
      }
      if (firstError?.category === "AUTHENTICATION_ERROR") {
        // Token issue — alert ops team
        throw new Error("Payment authentication failed");
      }
    }
    throw err;
  }
}

// @expect-clean
async function refundPaymentWithProperHandling(paymentId: string) {
  try {
    const response = await client.refunds.refundPayment({
      idempotencyKey: `refund-${Date.now()}`,
      amountMoney: { amount: BigInt(500), currency: "USD" },
      paymentId,
    });
    return response;
  } catch (err) {
    if (err instanceof SquareError) {
      const firstError = err.errors?.[0];
      if (firstError?.category === "REFUND_ERROR") {
        throw new Error(`Refund failed: ${firstError.code}`);
      }
    }
    throw err;
  }
}

// @expect-clean
async function createSubscriptionWithProperHandling(customerId: string) {
  try {
    const response = await client.subscriptions.create({
      idempotencyKey: `sub-${Date.now()}`,
      locationId: "LOCATION_ID",
      planVariationId: "PLAN_VARIATION_ID",
      customerId,
    });
    // ✅ Check subscription status before granting access
    if (response.subscription?.status !== "ACTIVE") {
      throw new Error(`Subscription not active: ${response.subscription?.status}`);
    }
    return response;
  } catch (err) {
    if (err instanceof SquareError) {
      const code = err.errors?.[0]?.code;
      if (code === "CUSTOMER_NOT_FOUND") {
        throw new Error("Customer not found in Square");
      }
      if (code === "CUSTOMER_MISSING_EMAIL") {
        throw new Error("Customer email required for subscription");
      }
    }
    throw err;
  }
}

// @expect-clean
async function createOrderWithProperHandling() {
  try {
    const response = await client.orders.create({
      order: {
        locationId: "LOCATION_ID",
        lineItems: [
          {
            name: "Widget",
            quantity: "1",
            basePriceMoney: { amount: BigInt(500), currency: "USD" },
          },
        ],
      },
      idempotencyKey: `order-${Date.now()}`,
    });
    return response;
  } catch (err) {
    if (err instanceof SquareError) {
      console.error("Order creation failed:", err.errors?.[0]?.code);
    }
    throw err;
  }
}

export {
  createPaymentMissingErrorHandling,
  refundPaymentMissingErrorHandling,
  createSubscriptionMissingErrorHandling,
  cancelSubscriptionMissingErrorHandling,
  createOrderMissingErrorHandling,
  createCustomerMissingErrorHandling,
  deleteCustomerMissingErrorHandling,
  completePaymentMissingErrorHandling,
  cancelPaymentMissingErrorHandling,
  createPaymentWithProperHandling,
  refundPaymentWithProperHandling,
  createSubscriptionWithProperHandling,
  createOrderWithProperHandling,
  // deepen-stream-2 pass 4 additions
  createCardMissingErrorHandling,
  createInvoiceMissingErrorHandling,
  publishInvoiceMissingErrorHandling,
  updateOrderMissingErrorHandling,
  payOrderMissingErrorHandling,
  createCardWithProperHandling,
  publishInvoiceWithProperHandling,
  payOrderWithProperHandling,
};
