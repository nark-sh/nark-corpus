/**
 * Plaid — Proper Error Handling Fixture
 *
 * Demonstrates correct usage of the Plaid SDK.
 * All API calls are wrapped in try-catch.
 * Should produce ZERO violations.
 */

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, TransferType, TransferNetwork } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || 'test-client-id',
      'PLAID-SECRET': process.env.PLAID_SECRET || 'test-secret',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// ─── linkTokenCreate ────────────────────────────────────────────────────────

/**
 * Creates a Link token for Plaid Link initialization.
 * Properly handles API errors.
 */
export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'My App',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return response.data.link_token;
  } catch (error: any) {
    const plaidError = error.response?.data;
    console.error('Failed to create link token:', plaidError?.error_code, plaidError?.request_id);
    throw new Error(`Link token creation failed: ${plaidError?.error_message}`);
  }
}

// ─── itemPublicTokenExchange ─────────────────────────────────────────────────

/**
 * Exchanges a Link public token for an access token.
 * Properly handles INVALID_PUBLIC_TOKEN and other errors.
 */
export async function exchangePublicToken(publicToken: string): Promise<string> {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data.access_token;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'INVALID_PUBLIC_TOKEN') {
      throw new Error('Link session expired. Please reconnect your bank.');
    }
    console.error('Token exchange failed:', plaidError?.error_code, plaidError?.request_id);
    throw new Error('Failed to connect bank account');
  }
}

// ─── transactionsSync ────────────────────────────────────────────────────────

/**
 * Syncs transactions incrementally using a cursor.
 * Properly handles PRODUCT_NOT_READY and ITEM_LOGIN_REQUIRED.
 */
export async function syncTransactions(accessToken: string, cursor?: string) {
  try {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
    });
    return {
      added: response.data.added,
      modified: response.data.modified,
      removed: response.data.removed,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more,
    };
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      // User must re-link their account
      throw new Error('RELINK_REQUIRED');
    }
    if (plaidError?.error_code === 'PRODUCT_NOT_READY') {
      // Initial sync still in progress — retry later
      throw new Error('TRANSACTIONS_PENDING');
    }
    console.error('Transaction sync failed:', plaidError?.error_code, plaidError?.request_id);
    throw error;
  }
}

// ─── accountsGet ─────────────────────────────────────────────────────────────

/**
 * Retrieves all accounts for an Item.
 * Properly handles ITEM_LOGIN_REQUIRED.
 */
export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    console.error('Failed to get accounts:', plaidError?.error_code, plaidError?.request_id);
    throw error;
  }
}

// ─── authGet ─────────────────────────────────────────────────────────────────

/**
 * Retrieves bank account/routing numbers for ACH.
 * Properly handles all auth-specific errors.
 */
export async function getAuthData(accessToken: string) {
  try {
    const response = await plaidClient.authGet({
      access_token: accessToken,
    });
    return response.data.numbers;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'PRODUCT_NOT_READY') {
      throw new Error('Auth product not yet initialized for this account');
    }
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    console.error('Auth data fetch failed:', plaidError?.error_code, plaidError?.request_id);
    throw error;
  }
}

// ─── transferCreate ──────────────────────────────────────────────────────────

/**
 * Creates an ACH transfer after authorization.
 * Properly handles financial errors — logs request_id for reconciliation.
 */
export async function createTransfer(
  accessToken: string,
  accountId: string,
  authorizationId: string,
  amount: string,
  description: string,
) {
  try {
    const response = await plaidClient.transferCreate({
      access_token: accessToken,
      account_id: accountId,
      authorization_id: authorizationId,
      description,
    });
    return response.data.transfer;
  } catch (error: any) {
    const plaidError = error.response?.data;
    // ALWAYS log request_id for financial operations — needed for reconciliation
    console.error('Transfer creation failed:', {
      error_type: plaidError?.error_type,
      error_code: plaidError?.error_code,
      request_id: plaidError?.request_id,
    });
    if (plaidError?.error_code === 'AUTHORIZATION_EXPIRED') {
      throw new Error('Transfer authorization expired. Please retry.');
    }
    if (plaidError?.error_code === 'DUPLICATE_TRANSFER') {
      throw new Error('Transfer already submitted.');
    }
    throw new Error(`Transfer failed: ${plaidError?.error_code}`);
  }
}
