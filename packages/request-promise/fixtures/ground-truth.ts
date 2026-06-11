/**
 * request-promise Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "request-promise"):
 *   - rp() / default     postconditions: http-error-4xx-5xx, network-failure, transform-function-error
 *   - rp.get()           postconditions: http-error-4xx-5xx, network-failure
 *   - rp.post()          postconditions: http-error-4xx-5xx, network-failure
 *   - rp.put()           postconditions: http-error-4xx-5xx, network-failure
 *   - rp.patch()         postconditions: http-error-4xx-5xx, network-failure
 *   - rp.del()           postconditions: http-error-4xx-5xx, network-failure
 *   - rp.head()          postconditions: http-error-4xx-5xx, network-failure, head-resolves-with-headers-not-body
 *
 * Detection path: rp imported from request-promise →
 *   ThrowingFunctionDetector fires direct call rp() / rp.get() / etc. →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import rp = require('request-promise');

// ─────────────────────────────────────────────────────────────────────────────
// 1. rp() — default call (HTTP GET by default)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDefaultNoCatch(url: string) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp() rejects with StatusCodeError on non-2xx. No try-catch.
  const html = await rp(url);
  return html;
}

export async function fetchDefaultWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: rp() inside try-catch satisfies error handling
    const html = await rp(url);
    return html;
  } catch (err) {
    console.error('Request failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. rp.get() — GET shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function getRequestNoCatch(url: string) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.get() rejects with StatusCodeError. No try-catch.
  const data = await rp.get(url);
  return data;
}

export async function getRequestWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: rp.get() inside try-catch satisfies error handling
    const data = await rp.get(url);
    return data;
  } catch (err) {
    console.error('GET failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. rp.post() — POST shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function postRequestNoCatch(url: string, body: object) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.post() rejects with StatusCodeError. No try-catch.
  const response = await rp.post({ uri: url, body, json: true });
  return response;
}

export async function postRequestWithCatch(url: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: rp.post() inside try-catch satisfies error handling
    const response = await rp.post({ uri: url, body, json: true });
    return response;
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. rp.put() — PUT shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function putRequestNoCatch(url: string, body: object) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.put() rejects with StatusCodeError. No try-catch.
  const response = await rp.put({ uri: url, body, json: true });
  return response;
}

export async function putRequestWithCatch(url: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: rp.put() inside try-catch satisfies error handling
    const response = await rp.put({ uri: url, body, json: true });
    return response;
  } catch (err) {
    console.error('PUT failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. rp.patch() — PATCH shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function patchRequestNoCatch(url: string, body: object) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.patch() rejects with StatusCodeError. No try-catch.
  const response = await rp.patch({ uri: url, body, json: true });
  return response;
}

export async function patchRequestWithCatch(url: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: rp.patch() inside try-catch satisfies error handling
    const response = await rp.patch({ uri: url, body, json: true });
    return response;
  } catch (err) {
    console.error('PATCH failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. rp.del() — DELETE shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteRequestNoCatch(url: string) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.del() rejects with StatusCodeError. No try-catch.
  await rp.del(url);
}

export async function deleteRequestWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: rp.del() inside try-catch satisfies error handling
    await rp.del(url);
  } catch (err) {
    console.error('DELETE failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. rp.head() — HEAD shortcut
// ─────────────────────────────────────────────────────────────────────────────

export async function headRequestNoCatch(url: string) {
  // SHOULD_FIRE: http-error-4xx-5xx — rp.head() rejects with StatusCodeError on 404 (a common gotcha for existence-check probes). No try-catch.
  const headers = await rp.head(url);
  return headers;
}

export async function headRequestWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: rp.head() inside try-catch satisfies error handling
    const headers = await rp.head(url);
    return headers;
  } catch (err) {
    console.error('HEAD failed:', err);
    throw err;
  }
}
