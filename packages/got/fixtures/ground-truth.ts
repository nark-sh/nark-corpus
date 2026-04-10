/**
 * got Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "got"):
 *   - got.extend()  postcondition: inherited-http-error
 *
 * Detection path: got.extend() call →
 *   ThrowingFunctionDetector fires method call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import got from 'got';

// ─────────────────────────────────────────────────────────────────────────────
// 1. got.extend() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function createClientNoCatch() {
  // SHOULD_FIRE: inherited-http-error — got.extend() inherits error config. No try-catch.
  const client = got.extend({
    prefixUrl: 'https://api.example.com',
    timeout: { request: 5000 },
  });
  return client;
}

export function createClientWithCatch() {
  try {
    // SHOULD_NOT_FIRE: got.extend() inside try-catch satisfies error handling
    const client = got.extend({
      prefixUrl: 'https://api.example.com',
      timeout: { request: 5000 },
    });
    return client;
  } catch (err) {
    console.error('Client creation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. got.extend() — second pattern
// ─────────────────────────────────────────────────────────────────────────────

export function createAuthClientNoCatch(apiKey: string) {
  // SHOULD_FIRE: inherited-http-error — got.extend() with auth headers. No try-catch.
  const client = got.extend({
    prefixUrl: 'https://api.example.com',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return client;
}

export function createAuthClientWithCatch(apiKey: string) {
  try {
    // SHOULD_NOT_FIRE: got.extend() inside try-catch satisfies error handling
    const client = got.extend({
      prefixUrl: 'https://api.example.com',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return client;
  } catch (err) {
    console.error('Client creation failed:', err);
    throw err;
  }
}
