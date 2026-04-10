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
