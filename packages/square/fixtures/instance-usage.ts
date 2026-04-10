/**
 * Instance-based usage of Square SDK
 *
 * Tests detection of Square API calls through client instances.
 * This file contains BOTH proper and missing error handling to test
 * that the analyzer can detect violations via instance patterns.
 */

import { Client, Environment, SquareError } from "square";

/**
 * Payment service class that wraps Square client
 */
class PaymentService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({
      accessToken,
      environment: Environment.Sandbox,
    });
  }

  /**
   * ✅ PROPER: Instance method with try-catch
   */
  async createPaymentWithHandling(sourceId: string, amount: bigint) {
    try {
      const response = await this.client.payments.create({
        sourceId,
        idempotencyKey: `payment-${Date.now()}`,
        amountMoney: {
          amount,
          currency: "USD",
        },
      });

      return response.result.payment;
    } catch (error) {
      if (error instanceof SquareError) {
        console.error("Payment failed:", error.message);
      }
      throw error;
    }
  }

  /**
   * ❌ VIOLATION: Instance method without try-catch
   * Should trigger ERROR violation
   */
  async createPaymentWithoutHandling(sourceId: string, amount: bigint) {
    // ❌ No try-catch
    const response = await this.client.payments.create({
      sourceId,
      idempotencyKey: `payment-${Date.now()}`,
      amountMoney: {
        amount,
        currency: "USD",
      },
    });

    return response.result.payment;
  }

  /**
   * ❌ VIOLATION: Accessing nested API without try-catch
   * Should trigger ERROR violation
   */
  async listLocationsWithoutHandling() {
    // ❌ No try-catch
    const response = await this.client.locations.list();
    return response.result.locations || [];
  }
}

/**
 * Order service class
 */
class OrderService {
  private squareClient: Client;

  constructor(client: Client) {
    this.squareClient = client;
  }

  /**
   * ✅ PROPER: Instance method with try-catch
   */
  async createOrder(locationId: string) {
    try {
      const response = await this.squareClient.ordersApi.createOrder({
        order: {
          locationId,
          lineItems: [
            {
              name: "Product",
              quantity: "1",
              basePriceMoney: {
                amount: BigInt(1000),
                currency: "USD",
              },
            },
          ],
        },
        idempotencyKey: `order-${Date.now()}`,
      });

      return response.result.order;
    } catch (error) {
      if (error instanceof SquareError) {
        console.error("Order creation failed:", error.message);
      }
      throw error;
    }
  }

  /**
   * ❌ VIOLATION: Instance method without try-catch
   * Should trigger ERROR violation
   */
  async updateOrder(orderId: string, version: number) {
    // ❌ No try-catch
    const response = await this.squareClient.ordersApi.updateOrder(orderId, {
      order: {
        locationId: "LOCATION_ID",
        version,
      },
    });

    return response.result.order;
  }
}

/**
 * Customer service class
 */
class CustomerService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN || "sandbox-token",
      environment: Environment.Sandbox,
    });
  }

  /**
   * ❌ VIOLATION: Create customer without try-catch
   * Should trigger ERROR violation
   */
  async createCustomer(email: string, name: string) {
    // ❌ No try-catch
    const response = await this.client.customersApi.createCustomer({
      emailAddress: email,
      givenName: name,
    });

    return response.result.customer;
  }

  /**
   * ❌ VIOLATION: Retrieve customer without try-catch
   * Should trigger ERROR violation
   */
  async getCustomer(customerId: string) {
    // ❌ No try-catch
    const response = await this.client.customersApi.retrieveCustomer(customerId);
    return response.result.customer;
  }

  /**
   * ✅ PROPER: Customer lookup with error handling
   */
  async findCustomerSafely(customerId: string) {
    try {
      const response = await this.client.customersApi.retrieveCustomer(customerId);
      return response.result.customer;
    } catch (error) {
      if (error instanceof SquareError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}

/**
 * ❌ VIOLATION: Factory function returning unhandled promise
 * Should trigger ERROR violation
 */
function createClientAndMakePayment(accessToken: string, sourceId: string) {
  const client = new Client({
    accessToken,
    environment: Environment.Sandbox,
  });

  // ❌ No try-catch
  return client.payments.create({
    sourceId,
    idempotencyKey: `payment-${Date.now()}`,
    amountMoney: {
      amount: BigInt(1000),
      currency: "USD",
    },
  });
}

/**
 * ✅ PROPER: Factory function with error handling
 */
async function createClientAndMakePaymentSafely(
  accessToken: string,
  sourceId: string
) {
  const client = new Client({
    accessToken,
    environment: Environment.Sandbox,
  });

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: `payment-${Date.now()}`,
      amountMoney: {
        amount: BigInt(1000),
        currency: "USD",
      },
    });

    return response.result.payment;
  } catch (error) {
    if (error instanceof SquareError) {
      console.error("Payment failed:", error.message);
    }
    throw error;
  }
}

/**
 * ❌ VIOLATION: Using stored client reference without error handling
 * Should trigger ERROR violation
 */
const globalClient = new Client({
  accessToken: "sandbox-token",
  environment: Environment.Sandbox,
});

async function useGlobalClientWithoutHandling() {
  // ❌ No try-catch
  const response = await globalClient.locations.list();
  return response.result.locations;
}

/**
 * ✅ PROPER: Using stored client with error handling
 */
async function useGlobalClientWithHandling() {
  try {
    const response = await globalClient.locations.list();
    return response.result.locations;
  } catch (error) {
    if (error instanceof SquareError) {
      console.error("Failed to list locations:", error.message);
    }
    throw error;
  }
}

// Export for testing
export {
  PaymentService,
  OrderService,
  CustomerService,
  createClientAndMakePayment,
  createClientAndMakePaymentSafely,
  useGlobalClientWithoutHandling,
  useGlobalClientWithHandling,
};
