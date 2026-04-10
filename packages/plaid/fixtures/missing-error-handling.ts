/**
 * Plaid — Missing Error Handling Fixture
 *
 * Demonstrates INCORRECT usage — all API calls are missing try-catch.
 * Should produce ERROR violations for each function.
 */

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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

// ─── linkTokenCreate — missing try-catch ─────────────────────────────────────

/**
 * ❌ No try-catch — API errors will crash the caller.
 */
export async function createLinkTokenUnsafe(userId: string): Promise<string> {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'My App',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });
  return response.data.link_token;
}

// ─── itemPublicTokenExchange — missing try-catch ──────────────────────────────

/**
 * ❌ No try-catch — INVALID_PUBLIC_TOKEN will crash the request handler.
 *    Common in Next.js API routes handling the Link callback.
 */
export async function exchangePublicTokenUnsafe(publicToken: string): Promise<string> {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data.access_token;
}

// ─── transactionsSync — missing try-catch ────────────────────────────────────

/**
 * ❌ No try-catch — PRODUCT_NOT_READY or ITEM_LOGIN_REQUIRED crashes webhook handler.
 *    This is particularly dangerous in background jobs.
 */
export async function syncTransactionsUnsafe(accessToken: string, cursor?: string) {
  const response = await plaidClient.transactionsSync({
    access_token: accessToken,
    cursor,
  });
  return response.data;
}

// ─── accountsGet — missing try-catch ─────────────────────────────────────────

/**
 * ❌ No try-catch — ITEM_LOGIN_REQUIRED crashes account display.
 */
export async function getAccountsUnsafe(accessToken: string) {
  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  });
  return response.data.accounts;
}

// ─── authGet — missing try-catch ─────────────────────────────────────────────

/**
 * ❌ No try-catch — API error before ACH transfer crashes the payment flow.
 */
export async function getAuthDataUnsafe(accessToken: string) {
  const response = await plaidClient.authGet({
    access_token: accessToken,
  });
  return response.data.numbers;
}

// ─── transferCreate — missing try-catch ──────────────────────────────────────

/**
 * ❌ No try-catch — financial operation with no error handling.
 *    Transfer failure is silent: money is NOT moved but app may assume success.
 */
export async function createTransferUnsafe(
  accessToken: string,
  accountId: string,
  authorizationId: string,
  description: string,
) {
  const response = await plaidClient.transferCreate({
    access_token: accessToken,
    account_id: accountId,
    authorization_id: authorizationId,
    description,
  });
  return response.data.transfer;
}
