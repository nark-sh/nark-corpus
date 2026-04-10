/**
 * ofetch Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ofetch"):
 *   - ofetch(url)     postcondition: ofetch-no-try-catch
 *   - $fetch(url)     postcondition: ofetch-no-try-catch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires ofetch()/$fetch() without try-catch
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
