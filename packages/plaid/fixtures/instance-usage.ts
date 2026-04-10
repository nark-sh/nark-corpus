/**
 * Plaid — Instance Usage Fixture
 *
 * Tests detection of Plaid API calls through class instances stored in
 * different ways: module-level singletons, class fields, function parameters.
 * All calls are missing try-catch → should trigger violations.
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// ─── Module-level singleton ───────────────────────────────────────────────────

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': 'test-client-id',
        'PLAID-SECRET': 'test-secret',
      },
    },
  }),
);

/**
 * ❌ Instance method call without try-catch via module singleton.
 */
export async function linkFromSingleton(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Test App',
    products: [],
    country_codes: [],
    language: 'en',
  });
  return response.data.link_token;
}

// ─── Class field pattern ──────────────────────────────────────────────────────

class PlaidService {
  private client: PlaidApi;

  constructor() {
    this.client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments.sandbox,
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': 'test-client-id',
            'PLAID-SECRET': 'test-secret',
          },
        },
      }),
    );
  }

  /**
   * ❌ Class method using this.client — no try-catch.
   */
  async getAccounts(accessToken: string) {
    const response = await this.client.accountsGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  }

  /**
   * ❌ Transaction sync in a class without error handling.
   */
  async syncTransactions(accessToken: string, cursor?: string) {
    const response = await this.client.transactionsSync({
      access_token: accessToken,
      cursor,
    });
    return response.data;
  }

  /**
   * ✅ Properly handled — should NOT fire.
   */
  async exchangeToken(publicToken: string): Promise<string> {
    try {
      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data.access_token;
    } catch (err: any) {
      throw new Error(`Token exchange failed: ${err.response?.data?.error_code}`);
    }
  }
}

// ─── Factory function pattern ─────────────────────────────────────────────────

function createPlaidClient(): PlaidApi {
  return new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': 'test-client-id',
          'PLAID-SECRET': 'test-secret',
        },
      },
    }),
  );
}

/**
 * ❌ Client created via factory, no try-catch on authGet.
 */
export async function getAuthViaFactory(accessToken: string) {
  const client = createPlaidClient();
  const response = await client.authGet({
    access_token: accessToken,
  });
  return response.data.numbers;
}

export { PlaidService };
