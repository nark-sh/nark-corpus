/**
 * axios-retry Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "axios" + "axios-retry"):
 *   - axios.get()   postcondition: error-4xx-5xx
 *   - axios.post()  postcondition: error-4xx-5xx
 *
 * Detection path: axiosRetry(axios) configures retry → axios.get() still throws
 *   after retries exhausted → ThrowingFunctionDetector fires →
 *   ContractMatcher checks try-catch → postcondition fires
 *
 * New behavioral contracts (2026-04-18 depth pass):
 *   - validate-response-overrides-validate-status
 *   - post-patch-not-retried-by-default
 *   - timeout-global-not-per-retry
 *   - on-retry-error-replaces-original-error
 *   - retry-condition-error-swallowed
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3 });

// ─────────────────────────────────────────────────────────────────────────────
// 1. axios.get() — without try-catch (after retries exhausted, error still thrown)
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoCatch(url: string) {
  // SHOULD_FIRE: error-4xx-5xx — axios.get() throws after retries exhausted. No try-catch.
  const response = await axios.get(url);
  return response.data;
}

export async function getWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: axios.get() inside try-catch satisfies error handling
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error('GET failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. axios.post() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function postNoCatch(url: string, data: unknown) {
  // SHOULD_FIRE: error-4xx-5xx — axios.post() throws after retries exhausted. No try-catch.
  const response = await axios.post(url, data);
  return response.data;
}

export async function postWithCatch(url: string, data: unknown) {
  try {
    // SHOULD_NOT_FIRE: axios.post() inside try-catch satisfies error handling
    const response = await axios.post(url, data);
    return response.data;
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. validateResponse overrides validateStatus — behavioral configuration
// NOTE: These are configuration-time behavioral contracts, not call-site violations.
// The scanner flags these as documentation/awareness patterns.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: validate-response-overrides-validate-status
// validateResponse set without handling 2xx responses — all responses rejected
const instanceBadValidate = axios.create();
axiosRetry(instanceBadValidate, {
  retries: 3,
  // BAD: This sends ALL responses (including 200 OK) through the error path
  // because validateStatus is overridden to () => false
  validateResponse: (res) => res.status === 503,
});

// @expect-clean
// validateResponse correctly includes 2xx in the valid range
const instanceGoodValidate = axios.create();
axiosRetry(instanceGoodValidate, {
  retries: 3,
  validateResponse: (res) => res.status >= 200 && res.status < 300,
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST not retried by default — developer assumption violation
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: post-patch-not-retried-by-default
// Developer configures retry globally but POST requests are NOT retried
const instanceGlobal = axios.create();
axiosRetry(instanceGlobal, { retries: 3 }); // Default retryCondition: idempotent only

export async function createUserAssumedRetried(data: unknown) {
  // SHOULD_FIRE: post-patch-not-retried-by-default
  // POST is NOT idempotent — axiosRetry default will NOT retry this on 5xx
  // Developer assumes retry covers POST, but it doesn't by default
  const response = await instanceGlobal.post('/users', data);
  return response.data;
}

// @expect-clean
// Explicitly configured retryCondition for POST
const instanceExplicit = axios.create();
axiosRetry(instanceExplicit, {
  retries: 3,
  retryCondition: (error) => axiosRetry.isNetworkError(error), // Network errors only (safe for POST)
});

export async function createUserWithExplicitRetry(data: unknown) {
  // SHOULD_NOT_FIRE: retryCondition explicitly configured for POST
  try {
    const response = await instanceExplicit.post('/users', data);
    return response.data;
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Global timeout — retries expire before they run
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: timeout-global-not-per-retry
const instanceTightTimeout = axios.create({ timeout: 2000 }); // 2s timeout for ALL retries
axiosRetry(instanceTightTimeout, {
  retries: 3,
  // shouldResetTimeout: false (default) — timeout shared across all retry attempts
  // If first attempt takes 1.9s, only 0.1s remains for 3 retries
});

export async function fetchWithSharedTimeout(url: string) {
  // SHOULD_FIRE: timeout-global-not-per-retry
  // Without shouldResetTimeout: true, retries may never execute on slow servers
  try {
    const response = await instanceTightTimeout.get(url);
    return response.data;
  } catch (err) {
    throw err; // Error: ECONNABORTED — timeout expired before retries ran
  }
}

// @expect-clean
const instancePerRetryTimeout = axios.create({ timeout: 2000 });
axiosRetry(instancePerRetryTimeout, {
  retries: 3,
  shouldResetTimeout: true, // Each retry gets its own 2s window
  retryDelay: axiosRetry.exponentialDelay,
});

export async function fetchWithPerRetryTimeout(url: string) {
  // SHOULD_NOT_FIRE: shouldResetTimeout explicitly set
  try {
    const response = await instancePerRetryTimeout.get(url);
    return response.data;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. onRetry error swallowing — token refresh failures lost
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: on-retry-error-replaces-original-error
const instanceTokenRefresh = axios.create();
axiosRetry(instanceTokenRefresh, {
  retries: 3,
  onRetry: async (retryCount, error, config) => {
    if (error.response?.status === 401) {
      // BAD: If refreshToken() throws, the error replaces the original AxiosError
      // The catch block receives the refresh error, not the 401 response error
      const token = await refreshToken();
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
  },
});

async function refreshToken(): Promise<string> {
  // Placeholder — in real code, this might throw on network failure
  throw new Error('Refresh service unavailable');
}

export async function fetchWithUnsafeOnRetry(url: string) {
  // SHOULD_FIRE: on-retry-error-replaces-original-error
  // If refreshToken() throws, catch receives the refresh error, not the original 401
  try {
    const response = await instanceTokenRefresh.get(url);
    return response.data;
  } catch (err) {
    // err may be "Refresh service unavailable" instead of AxiosError{status:401}
    console.error('Request failed:', err);
    throw err;
  }
}

// @expect-clean
const instanceSafeTokenRefresh = axios.create();
axiosRetry(instanceSafeTokenRefresh, {
  retries: 3,
  onRetry: async (retryCount, error, config) => {
    try {
      if (error.response?.status === 401) {
        const token = await refreshToken();
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }
    } catch (refreshError) {
      // Swallow refresh error to preserve original AxiosError in catch block
      console.error('Token refresh failed:', refreshError);
    }
  },
});

export async function fetchWithSafeOnRetry(url: string) {
  // SHOULD_NOT_FIRE: onRetry wraps refresh in try-catch
  try {
    const response = await instanceSafeTokenRefresh.get(url);
    return response.data;
  } catch (err) {
    // err is always the original AxiosError (401, etc.)
    console.error('Request failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. onMaxRetryTimesExceeded async error swallowing
//     Postcondition: on-max-retry-times-exceeded-error-replaces-original-error
//     Added 2026-06-23 (deepen-stream-3 pass 8)
// ─────────────────────────────────────────────────────────────────────────────

// External services that may fail during final-failure handling
declare const alertingService: { notify(error: any): Promise<void> };
declare const fallbackDb: { write(payload: any): Promise<void> };

// @expect-violation
const instanceUnsafeMaxRetry = axios.create();
axiosRetry(instanceUnsafeMaxRetry, {
  retries: 3,
  onMaxRetryTimesExceeded: async (error, retryCount) => {
    // If alertingService.notify rejects, this rejection REPLACES the original
    // AxiosError in the caller's catch — the 503-from-upstream evidence is lost.
    await alertingService.notify(error);
    await fallbackDb.write({ failed: true, retryCount });
  },
});

export async function fetchWithUnsafeOnMaxRetry(url: string) {
  // SHOULD_FIRE: onMaxRetryTimesExceeded swallows original error if side-effects fail
  try {
    const response = await instanceUnsafeMaxRetry.get(url);
    return response.data;
  } catch (err) {
    // err may be the alerting/fallback rejection, not the original AxiosError.
    // Triage will walk the wrong call tree.
    console.error('Request failed:', err);
    throw err;
  }
}

// @expect-clean
const instanceSafeMaxRetry = axios.create();
axiosRetry(instanceSafeMaxRetry, {
  retries: 3,
  onMaxRetryTimesExceeded: async (error, retryCount) => {
    try {
      await alertingService.notify(error);
      await fallbackDb.write({ failed: true, retryCount });
    } catch (sideEffectError) {
      // Swallow side-effect failure so the caller still sees the original AxiosError
      console.error('Side-effect failed during max-retry handler:', sideEffectError);
    }
  },
});

export async function fetchWithSafeOnMaxRetry(url: string) {
  // SHOULD_NOT_FIRE: onMaxRetryTimesExceeded wraps side effects in try-catch
  try {
    const response = await instanceSafeMaxRetry.get(url);
    return response.data;
  } catch (err) {
    // err is always the original AxiosError after retries exhausted
    console.error('Request failed:', err);
    throw err;
  }
}
