/**
 * ofetch Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ofetch"):
 *   - ofetch(url)          postconditions: ofetch-no-try-catch, ofetch-timeout-unhandled,
 *                                          ofetch-retry-post-disabled
 *   - $fetch(url)          postcondition:  dollar-fetch-no-try-catch
 *   - ofetch.raw(url)      postconditions: raw-still-throws-on-error, raw-timeout-unhandled
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires ofetch()/$fetch()/ofetch.raw() without try-catch
 */

import { ofetch, $fetch } from "ofetch";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ofetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNoCatch() {
  // SHOULD_FIRE: ofetch-no-try-catch — ofetch() automatically throws FetchError on non-2xx; unhandled without try-catch
  const data = await ofetch("/api/users");
  return data;
}

export async function fetchWithCatch() {
  try {
    // SHOULD_NOT_FIRE: ofetch() inside try-catch satisfies FetchError handling requirement
    const data = await ofetch("/api/users");
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. $fetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function dollarFetchNoCatch() {
  // SHOULD_FIRE: dollar-fetch-no-try-catch — $fetch() is ofetch alias; throws FetchError on non-2xx
  const data = await $fetch("/api/posts", { method: "POST", body: { title: "test" } });
  return data;
}

export async function dollarFetchWithCatch() {
  try {
    // SHOULD_NOT_FIRE: dollar-fetch-no-try-catch — $fetch() inside try-catch satisfies requirement
    const data = await $fetch("/api/posts", { method: "POST", body: { title: "test" } });
    return data;
  } catch (error) {
    console.error("$fetch error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ofetch.raw() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function rawNoCatch() {
  // SHOULD_FIRE: raw-still-throws-on-error — ofetch.raw() still throws FetchError on non-2xx,
  // unlike native fetch(). The "raw" suffix refers to the return type (FetchResponse), not bypassing errors.
  const response = await ofetch.raw("/api/data");
  return response._data;
}

export async function rawWithCatch() {
  try {
    // SHOULD_NOT_FIRE: raw-still-throws-on-error — ofetch.raw() inside try-catch satisfies requirement
    const response = await ofetch.raw("/api/data");
    console.log(response.status, response.headers.get("x-request-id"));
    return response._data;
  } catch (error) {
    console.error("ofetch.raw error:", error);
    throw error;
  }
}

export async function rawWithIgnoreError() {
  // SHOULD_NOT_FIRE: ignoreResponseError: true makes ofetch.raw() behave like native fetch()
  // — returns response for all status codes without throwing
  const response = await ofetch.raw("/api/data", { ignoreResponseError: true });
  if (!response.ok) {
    console.error("Request failed with status", response.status);
  }
  return response._data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ofetch() with timeout — throws TimeoutError wrapped in FetchError
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWithTimeoutNoCatch() {
  // SHOULD_FIRE: ofetch-timeout-unhandled — timeout fires a FetchError wrapping TimeoutError;
  // without try-catch the timeout causes unhandled exception
  const data = await ofetch("/api/slow-endpoint", { timeout: 5000 });
  return data;
}

export async function fetchWithTimeoutCaught() {
  try {
    // SHOULD_NOT_FIRE: ofetch-timeout-unhandled — timeout error properly caught
    const data = await ofetch("/api/slow-endpoint", { timeout: 5000 });
    return data;
  } catch (error: any) {
    if (error.cause?.name === "TimeoutError") {
      console.error("Request timed out");
      return null;
    }
    throw error;
  }
}
