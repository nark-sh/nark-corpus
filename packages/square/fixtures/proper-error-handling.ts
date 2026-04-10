/**
 * Proper error handling for Square SDK
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should NOT trigger any violations.
 */

import { Client, Environment, SquareError } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || "sandbox-token",
  environment: Environment.Sandbox,
});

/**
 * Example 1: Payment creation with proper error handling
 * ✅ Uses try-catch with SquareError checking
 */
async function createPaymentWithProperHandling() {
  try {
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
  } catch (error) {
    if (error instanceof SquareError) {
      console.error(`Square API error [${error.statusCode}]:`, error.message);

      // Handle specific error codes
      if (error.statusCode === 401) {
        console.error("Authentication failed. Check credentials.");
      } else if (error.statusCode === 422) {
        console.error("Payment declined or validation failed:");
        error.errors?.forEach((e: any) => {
          console.error(`  - ${e.category}: ${e.code} - ${e.detail}`);
        });
      } else if (error.statusCode === 429) {
        console.error("Rate limit exceeded. Implement backoff.");
      }
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/**
 * Example 2: Order creation with proper error handling
 * ✅ Uses try-catch
 */
async function createOrderWithProperHandling() {
  try {
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
  } catch (error) {
    if (error instanceof SquareError) {
      console.error("Failed to create order:", error.message);
    }
    throw error;
  }
}

/**
 * Example 3: Customer creation with proper error handling
 * ✅ Handles duplicate customer scenario
 */
async function createCustomerWithProperHandling(email: string) {
  try {
    const response = await client.customersApi.createCustomer({
      emailAddress: email,
      givenName: "John",
      familyName: "Doe",
    });

    console.log("Customer created:", response.result.customer?.id);
    return response.result.customer;
  } catch (error) {
    if (error instanceof SquareError) {
      if (error.statusCode === 409) {
        console.log("Customer already exists. Retrieving existing customer.");
        // Handle duplicate gracefully
      } else {
        console.error("Failed to create customer:", error.message);
      }
    }
    throw error;
  }
}

/**
 * Example 4: Customer retrieval with proper error handling
 * ✅ Handles 404 not found
 */
async function retrieveCustomerWithProperHandling(customerId: string) {
  try {
    const response = await client.customersApi.retrieveCustomer(customerId);
    console.log("Customer retrieved:", response.result.customer?.emailAddress);
    return response.result.customer;
  } catch (error) {
    if (error instanceof SquareError) {
      if (error.statusCode === 404) {
        console.log("Customer not found.");
        return null;
      }
      console.error("Failed to retrieve customer:", error.message);
    }
    throw error;
  }
}

/**
 * Example 5: Locations list with proper error handling
 * ✅ Uses try-catch
 */
async function listLocationsWithProperHandling() {
  try {
    const response = await client.locations.list();
    console.log(`Found ${response.result.locations?.length || 0} locations`);
    return response.result.locations || [];
  } catch (error) {
    if (error instanceof SquareError) {
      console.error("Failed to list locations:", error.message);

      if (error.statusCode === 401) {
        console.error("Authentication error. Check access token.");
      }
    }
    throw error;
  }
}

/**
 * Example 6: Payment with retry logic and exponential backoff
 * ✅ Comprehensive error handling with retry strategy
 */
async function createPaymentWithRetry(
  sourceId: string,
  amount: bigint,
  maxRetries: number = 3
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.payments.create({
        sourceId,
        idempotencyKey: `payment-retry-${Date.now()}-${attempt}`,
        amountMoney: {
          amount,
          currency: "USD",
        },
      });

      console.log("Payment successful on attempt", attempt + 1);
      return response.result;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof SquareError) {
        // Don't retry on client errors (4xx except 429)
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          console.error("Client error, not retrying:", error.message);
          throw error;
        }

        // Retry on server errors (5xx) or rate limit (429)
        if (error.statusCode >= 500 || error.statusCode === 429) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Retrying after ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Example 7: Order update with version conflict handling
 * ✅ Handles 409 version conflicts
 */
async function updateOrderWithProperHandling(orderId: string, version: number) {
  try {
    const response = await client.ordersApi.updateOrder(orderId, {
      order: {
        locationId: "LOCATION_ID",
        version,
      },
    });

    console.log("Order updated successfully");
    return response.result;
  } catch (error) {
    if (error instanceof SquareError) {
      if (error.statusCode === 409) {
        console.log("Version conflict. Retrieving latest version and retrying.");
        // Should retrieve latest version and retry
      } else if (error.statusCode === 404) {
        console.log("Order not found.");
      }
    }
    throw error;
  }
}

// Export for testing
export {
  createPaymentWithProperHandling,
  createOrderWithProperHandling,
  createCustomerWithProperHandling,
  retrieveCustomerWithProperHandling,
  listLocationsWithProperHandling,
  createPaymentWithRetry,
  updateOrderWithProperHandling,
};
