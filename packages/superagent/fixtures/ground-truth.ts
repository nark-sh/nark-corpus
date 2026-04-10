/**
 * superagent Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "superagent"):
 *   - superagent.get()   postcondition: network-error-handling
 *   - superagent.post()  postcondition: network-error-handling
 *
 * Detection path: direct import → ThrowingFunctionDetector fires get()/post() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import superagent from 'superagent';

// ─────────────────────────────────────────────────────────────────────────────
// 1. superagent.get() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoCatch(url: string) {
  // SHOULD_FIRE: network-error-handling — superagent.get() throws on network errors. No try-catch.
  const res = await superagent.get(url);
  return res.body;
}

export async function getWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: superagent.get() inside try-catch satisfies error handling
    const res = await superagent.get(url);
    return res.body;
  } catch (err) {
    console.error('GET failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. superagent.post() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function postNoCatch(url: string, data: unknown) {
  // SHOULD_FIRE: network-error-handling — superagent.post() throws on network errors. No try-catch.
  const res = await superagent.post(url).send(data);
  return res.body;
}

export async function postWithCatch(url: string, data: unknown) {
  try {
    // SHOULD_NOT_FIRE: superagent.post() inside try-catch satisfies error handling
    const res = await superagent.post(url).send(data);
    return res.body;
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}
