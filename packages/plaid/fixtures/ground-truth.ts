/**
 * Plaid Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the plaid contract spec, NOT V1 behavior.
 *
 * Contracted functions (all methods on PlaidApi instance from import "plaid"):
 *   - plaidClient.linkTokenCreate()          postcondition: api-error
 *   - plaidClient.itemPublicTokenExchange()  postcondition: api-error
 *   - plaidClient.transactionsSync()         postcondition: api-error
 *   - plaidClient.accountsGet()              postcondition: api-error
 *   - plaidClient.authGet()                  postcondition: api-error
 *   - plaidClient.transferCreate()           postcondition: api-error
 *
 * Detection: PlaidApi instance tracking (class_names: ["PlaidApi"]).
 * All methods are direct instance calls (2-level: instance.method()).
 */

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || 'test-client-id',
        'PLAID-SECRET': process.env.PLAID_SECRET || 'test-secret',
      },
    },
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. linkTokenCreate
// ─────────────────────────────────────────────────────────────────────────────

export async function linkTokenNoCatch(userId: string) {
  // SHOULD_FIRE: api-error — linkTokenCreate throws on rate limit or API error, no try-catch
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'My App',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });
  return response.data.link_token;
}

export async function linkTokenWithCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: linkTokenCreate inside try-catch satisfies error handling
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
    throw new Error(`Link token failed: ${plaidError?.error_code}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. itemPublicTokenExchange
// ─────────────────────────────────────────────────────────────────────────────

export async function exchangeTokenNoCatch(publicToken: string) {
  // SHOULD_FIRE: api-error — INVALID_PUBLIC_TOKEN throws if token already used, no try-catch
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data.access_token;
}

export async function exchangeTokenWithCatch(publicToken: string) {
  try {
    // SHOULD_NOT_FIRE: exchange inside try-catch
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data.access_token;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'INVALID_PUBLIC_TOKEN') {
      throw new Error('Link session expired. Please reconnect your bank.');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. transactionsSync
// ─────────────────────────────────────────────────────────────────────────────

export async function syncTransactionsNoCatch(accessToken: string, cursor?: string) {
  // SHOULD_FIRE: api-error — ITEM_LOGIN_REQUIRED / PRODUCT_NOT_READY throws, no try-catch
  const response = await plaidClient.transactionsSync({
    access_token: accessToken,
    cursor,
  });
  return response.data;
}

export async function syncTransactionsWithCatch(accessToken: string, cursor?: string) {
  try {
    // SHOULD_NOT_FIRE: transactionsSync inside try-catch
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
    });
    return response.data;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. accountsGet
// ─────────────────────────────────────────────────────────────────────────────

export async function getAccountsNoCatch(accessToken: string) {
  // SHOULD_FIRE: api-error — accountsGet throws on ITEM_LOGIN_REQUIRED, no try-catch
  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  });
  return response.data.accounts;
}

export async function getAccountsWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: accountsGet inside try-catch
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. authGet
// ─────────────────────────────────────────────────────────────────────────────

export async function getAuthNoCatch(accessToken: string) {
  // SHOULD_FIRE: api-error — authGet throws on PRODUCT_NOT_READY or institution error, no try-catch
  const response = await plaidClient.authGet({
    access_token: accessToken,
  });
  return response.data.numbers;
}

export async function getAuthWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: authGet inside try-catch
    const response = await plaidClient.authGet({
      access_token: accessToken,
    });
    return response.data.numbers;
  } catch (error: any) {
    const plaidError = error.response?.data;
    console.error('Auth fetch failed:', plaidError?.error_code, plaidError?.request_id);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. transferCreate
// ─────────────────────────────────────────────────────────────────────────────

export async function createTransferNoCatch(
  accessToken: string,
  accountId: string,
  authorizationId: string,
) {
  // SHOULD_FIRE: api-error — financial operation throws on AUTHORIZATION_EXPIRED etc., no try-catch
  const response = await plaidClient.transferCreate({
    access_token: accessToken,
    account_id: accountId,
    authorization_id: authorizationId,
    description: 'Test transfer',
  });
  return response.data.transfer;
}

export async function createTransferWithCatch(
  accessToken: string,
  accountId: string,
  authorizationId: string,
) {
  try {
    // SHOULD_NOT_FIRE: transferCreate inside try-catch
    const response = await plaidClient.transferCreate({
      access_token: accessToken,
      account_id: accountId,
      authorization_id: authorizationId,
      description: 'Test transfer',
    });
    return response.data.transfer;
  } catch (error: any) {
    const plaidError = error.response?.data;
    console.error('Transfer failed:', {
      error_type: plaidError?.error_type,
      error_code: plaidError?.error_code,
      request_id: plaidError?.request_id,
    });
    throw new Error(`Transfer failed: ${plaidError?.error_code}`);
  }
}
