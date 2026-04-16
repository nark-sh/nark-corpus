/**
 * Plaid Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the plaid contract spec, NOT V1 behavior.
 *
 * Contracted functions (all methods on PlaidApi instance from import "plaid"):
 *   - plaidClient.linkTokenCreate()              postcondition: api-error
 *   - plaidClient.itemPublicTokenExchange()      postcondition: api-error
 *   - plaidClient.transactionsSync()             postcondition: api-error
 *   - plaidClient.accountsGet()                  postcondition: api-error
 *   - plaidClient.authGet()                      postcondition: api-error
 *   - plaidClient.transferCreate()               postcondition: api-error
 *   - plaidClient.identityGet()                  postconditions: item-login-required, institution-error
 *   - plaidClient.liabilitiesGet()               postconditions: no-liability-accounts, products-not-supported, item-login-required
 *   - plaidClient.investmentsHoldingsGet()       postconditions: no-investment-accounts, item-login-required
 *   - plaidClient.investmentsTransactionsGet()   postconditions: no-investment-accounts, item-login-required
 *   - plaidClient.transactionsGet()              postconditions: item-login-required, product-not-ready
 *   - plaidClient.transactionsRefresh()          postconditions: item-login-required, institution-error
 *   - plaidClient.accountsBalanceGet()           postconditions: item-login-required, institution-error
 *   - plaidClient.itemGet()                      postcondition: item-not-found
 *   - plaidClient.itemRemove()                   postcondition: api-error
 *   - plaidClient.transferAuthorizationCreate()  postconditions: transfer-account-blocked, transfer-unsupported-account-type, item-login-required
 *   - plaidClient.transferGet()                  postcondition: api-error
 *   - plaidClient.signalEvaluate()               postcondition: signal-error
 *   - plaidClient.itemWebhookUpdate()            postcondition: api-error
 *   - plaidClient.transactionsRecurringGet()     postconditions: item-login-required, product-not-ready
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. identityGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: identityGet.item-login-required
// @expect-violation: identityGet.institution-error
export async function getIdentityNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — item-login-required, institution-error — identityGet throws on expired credentials or bank down, no try-catch
  const response = await plaidClient.identityGet({
    access_token: accessToken,
  });
  return response.data.accounts;
}

// @expect-clean
export async function getIdentityWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: identityGet inside try-catch
    const response = await plaidClient.identityGet({
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
// 8. liabilitiesGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: liabilitiesGet.no-liability-accounts
// @expect-violation: liabilitiesGet.products-not-supported
// @expect-violation: liabilitiesGet.item-login-required
export async function getLiabilitiesNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — no-liability-accounts, products-not-supported, item-login-required — no try-catch
  const response = await plaidClient.liabilitiesGet({
    access_token: accessToken,
  });
  return response.data.liabilities;
}

// @expect-clean
export async function getLiabilitiesWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: liabilitiesGet inside try-catch
    const response = await plaidClient.liabilitiesGet({
      access_token: accessToken,
    });
    return response.data.liabilities;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'NO_LIABILITY_ACCOUNTS') {
      return { credit: [], student: [], mortgage: [] };
    }
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. investmentsHoldingsGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: investmentsHoldingsGet.no-investment-accounts
// @expect-violation: investmentsHoldingsGet.item-login-required
export async function getHoldingsNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — no-investment-accounts, item-login-required — no try-catch
  const response = await plaidClient.investmentsHoldingsGet({
    access_token: accessToken,
  });
  return response.data.holdings;
}

// @expect-clean
export async function getHoldingsWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: investmentsHoldingsGet inside try-catch
    const response = await plaidClient.investmentsHoldingsGet({
      access_token: accessToken,
    });
    return response.data.holdings;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. investmentsTransactionsGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: investmentsTransactionsGet.no-investment-accounts
// @expect-violation: investmentsTransactionsGet.item-login-required
export async function getInvestmentTransactionsNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — no-investment-accounts, item-login-required — no try-catch
  const startDate = '2024-01-01';
  const endDate = '2024-12-31';
  const response = await plaidClient.investmentsTransactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
  });
  return response.data.investment_transactions;
}

// @expect-clean
export async function getInvestmentTransactionsWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: investmentsTransactionsGet inside try-catch
    const response = await plaidClient.investmentsTransactionsGet({
      access_token: accessToken,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
    return response.data.investment_transactions;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. transactionsGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: transactionsGet.item-login-required
// @expect-violation: transactionsGet.product-not-ready
export async function getTransactionsNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — item-login-required, product-not-ready — no try-catch
  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
  });
  return response.data.transactions;
}

// @expect-clean
export async function getTransactionsWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: transactionsGet inside try-catch
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
    return response.data.transactions;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    if (plaidError?.error_code === 'PRODUCT_NOT_READY') {
      throw new Error('TRANSACTIONS_NOT_READY');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. accountsBalanceGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: accountsBalanceGet.item-login-required
// @expect-violation: accountsBalanceGet.institution-error
export async function getBalanceNoCatch(accessToken: string) {
  // SHOULD_NOT_FIRE: scanner gap — item-login-required, institution-error — no try-catch
  // accountsBalanceGet makes a live fetch to the institution (not cached)
  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });
  return response.data.accounts;
}

// @expect-clean
export async function getBalanceWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: accountsBalanceGet inside try-catch
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    // Block payment if balance unavailable — do not use stale cache
    throw new Error(`Balance check failed: ${plaidError?.error_code || 'UNKNOWN'}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. itemGet (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: itemGet.item-not-found
export async function getItemNoCatch(accessToken: string) {
  // SHOULD_FIRE: item-not-found — INVALID_ACCESS_TOKEN throws if token is stale, no try-catch
  const response = await plaidClient.itemGet({
    access_token: accessToken,
  });
  return response.data.item;
}

// @expect-clean
export async function getItemWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: itemGet inside try-catch
    const response = await plaidClient.itemGet({
      access_token: accessToken,
    });
    return response.data.item;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'ITEM_NOT_FOUND' || plaidError?.error_code === 'INVALID_ACCESS_TOKEN') {
      // Token is stale — remove from DB and prompt re-link
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. itemRemove (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: itemRemove.api-error
export async function removeItemNoCatch(accessToken: string) {
  // SHOULD_FIRE: api-error — billing continues if removal fails silently, no try-catch
  await plaidClient.itemRemove({
    access_token: accessToken,
  });
}

// @expect-clean
export async function removeItemWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: itemRemove inside try-catch
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
    // Only delete from DB after confirmed Plaid removal
  } catch (error: any) {
    const plaidError = error.response?.data;
    // ITEM_NOT_FOUND is idempotent — treat as successful removal
    if (plaidError?.error_code === 'ITEM_NOT_FOUND') {
      return;
    }
    throw new Error(`Item removal failed: ${plaidError?.error_code}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. transferAuthorizationCreate (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: transferAuthorizationCreate.transfer-account-blocked
// @expect-violation: transferAuthorizationCreate.transfer-unsupported-account-type
// @expect-violation: transferAuthorizationCreate.item-login-required
export async function createTransferAuthNoCatch(
  accessToken: string,
  accountId: string,
) {
  // SHOULD_NOT_FIRE: scanner gap — transfer-account-blocked, transfer-unsupported-account-type, item-login-required — no try-catch
  const response = await plaidClient.transferAuthorizationCreate({
    access_token: accessToken,
    account_id: accountId,
    type: 'debit' as any,
    network: 'ach' as any,
    amount: '100.00',
    ach_class: 'ppd' as any,
    user: { legal_name: 'Test User' },
  });
  return response.data.authorization;
}

// @expect-clean
export async function createTransferAuthWithCatch(
  accessToken: string,
  accountId: string,
) {
  try {
    // SHOULD_NOT_FIRE: transferAuthorizationCreate inside try-catch
    const response = await plaidClient.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: 'debit' as any,
      network: 'ach' as any,
      amount: '100.00',
      ach_class: 'ppd' as any,
      user: { legal_name: 'Test User' },
    });
    return response.data.authorization;
  } catch (error: any) {
    const plaidError = error.response?.data;
    if (plaidError?.error_code === 'TRANSFER_ACCOUNT_BLOCKED') {
      throw new Error('Account is blocked for transfers. Please link a different account.');
    }
    if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
      throw new Error('RELINK_REQUIRED');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. signalEvaluate (added in depth pass 2026-04-13)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: signalEvaluate.signal-error
export async function evaluateSignalNoCatch(
  accessToken: string,
  accountId: string,
) {
  // SHOULD_FIRE: signal-error — INVALID_ACCOUNT_ID or ITEM_LOGIN_REQUIRED throws without try-catch
  const response = await plaidClient.signalEvaluate({
    access_token: accessToken,
    account_id: accountId,
    client_transaction_id: 'txn-001',
    amount: 100.00,
  });
  return response.data.scores;
}

// @expect-clean
export async function evaluateSignalWithCatch(
  accessToken: string,
  accountId: string,
) {
  try {
    // SHOULD_NOT_FIRE: signalEvaluate inside try-catch
    const response = await plaidClient.signalEvaluate({
      access_token: accessToken,
      account_id: accountId,
      client_transaction_id: 'txn-001',
      amount: 100.00,
    });
    return response.data.scores;
  } catch (error: any) {
    const plaidError = error.response?.data;
    // Fail-safe: block transfer if signal evaluation fails
    throw new Error(`Signal evaluation failed: ${plaidError?.error_code || 'UNKNOWN'}`);
  }
}
