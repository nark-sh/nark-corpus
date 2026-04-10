/**
 * Missing error handling for Square SDK
 *
 * This file demonstrates INCORRECT error handling patterns.
 * Should trigger ERROR violations.
 */

import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "sandbox-token",
  environment: Environment.Sandbox,
});

/**
 * ❌ VIOLATION: Payment creation without try-catch
 * Should trigger ERROR violation
 */
async function createPaymentWithoutErrorHandling() {
  // ❌ No try-catch block
  const response = await client.payments.create({
    sourceId: "cnon:card-nonce-ok",
    idempotencyKey: `payment-${Date.now()}`,
    amountMoney: {
      amount: BigInt(1000),
      currency: "USD",
    },
  });

  console.log("Payment created:", response.result.payment?.id);
  return response.result;
}

/**
 * ❌ VIOLATION: Order creation without try-catch
 * Should trigger ERROR violation
 */
async function createOrderWithoutErrorHandling() {
  // ❌ No try-catch block
  const response = await client.ordersApi.createOrder({
    order: {
      locationId: "LOCATION_ID",
      lineItems: [
        {
          name: "Test Item",
          quantity: "1",
          basePriceMoney: {
            amount: BigInt(500),
            currency: "USD",
          },
        },
      ],
    },
    idempotencyKey: `order-${Date.now()}`,
  });

  console.log("Order created:", response.result.order?.id);
  return response.result;
}

/**
 * ❌ VIOLATION: Customer creation without try-catch
 * Should trigger ERROR violation
 */
async function createCustomerWithoutErrorHandling(email: string) {
  // ❌ No try-catch block
  const response = await client.customersApi.createCustomer({
    emailAddress: email,
    givenName: "John",
    familyName: "Doe",
  });

  console.log("Customer created:", response.result.customer?.id);
  return response.result.customer;
}

/**
 * ❌ VIOLATION: Customer retrieval without try-catch
 * Should trigger ERROR violation
 */
async function retrieveCustomerWithoutErrorHandling(customerId: string) {
  // ❌ No try-catch block
  const response = await client.customersApi.retrieveCustomer(customerId);
  console.log("Customer retrieved:", response.result.customer?.emailAddress);
  return response.result.customer;
}

/**
 * ❌ VIOLATION: Locations list without try-catch
 * Should trigger ERROR violation
 */
async function listLocationsWithoutErrorHandling() {
  // ❌ No try-catch block
  const response = await client.locations.list();
  console.log(`Found ${response.result.locations?.length || 0} locations`);
  return response.result.locations || [];
}

/**
 * ❌ VIOLATION: Order update without try-catch
 * Should trigger ERROR violation
 */
async function updateOrderWithoutErrorHandling(orderId: string, version: number) {
  // ❌ No try-catch block
  const response = await client.ordersApi.updateOrder(orderId, {
    order: {
      locationId: "LOCATION_ID",
      version,
    },
  });

  console.log("Order updated successfully");
  return response.result;
}

/**
 * ❌ VIOLATION: Multiple API calls without try-catch
 * Should trigger multiple ERROR violations
 */
async function processOrderWorkflowWithoutErrorHandling(email: string) {
  // ❌ No try-catch for any of these calls
  const customer = await client.customersApi.createCustomer({
    emailAddress: email,
    givenName: "Jane",
    familyName: "Smith",
  });

  const order = await client.ordersApi.createOrder({
    order: {
      locationId: "LOCATION_ID",
      customerId: customer.result.customer?.id,
      lineItems: [
        {
          name: "Widget",
          quantity: "2",
          basePriceMoney: {
            amount: BigInt(1500),
            currency: "USD",
          },
        },
      ],
    },
    idempotencyKey: `order-${Date.now()}`,
  });

  const payment = await client.payments.create({
    sourceId: "cnon:card-nonce-ok",
    idempotencyKey: `payment-${Date.now()}`,
    amountMoney: {
      amount: BigInt(3000),
      currency: "USD",
    },
    orderId: order.result.order?.id,
  });

  return {
    customer: customer.result.customer,
    order: order.result.order,
    payment: payment.result.payment,
  };
}

/**
 * ❌ VIOLATION: Promise chain without error handling
 * Should trigger ERROR violation
 */
function createPaymentChainWithoutErrorHandling() {
  // ❌ No .catch() on promise chain
  return client.payments
    .create({
      sourceId: "cnon:card-nonce-ok",
      idempotencyKey: `payment-${Date.now()}`,
      amountMoney: {
        amount: BigInt(1000),
        currency: "USD",
      },
    })
    .then((response) => {
      console.log("Payment created:", response.result.payment?.id);
      return response.result;
    });
  // ❌ Missing .catch() handler
}

/**
 * ❌ VIOLATION: Using legacy createPayment without try-catch
 * Should trigger ERROR violation
 */
async function legacyCreatePaymentWithoutErrorHandling() {
  // ❌ No try-catch block
  const response = await client.paymentsApi.createPayment({
    sourceId: "cnon:card-nonce-ok",
    idempotencyKey: `payment-legacy-${Date.now()}`,
    amountMoney: {
      amount: BigInt(1000),
      currency: "USD",
    },
  });

  console.log("Payment created (legacy):", response.result.payment?.id);
  return response.result;
}

// Export for testing
export {
  createPaymentWithoutErrorHandling,
  createOrderWithoutErrorHandling,
  createCustomerWithoutErrorHandling,
  retrieveCustomerWithoutErrorHandling,
  listLocationsWithoutErrorHandling,
  updateOrderWithoutErrorHandling,
  processOrderWorkflowWithoutErrorHandling,
  createPaymentChainWithoutErrorHandling,
  legacyCreatePaymentWithoutErrorHandling,
};
