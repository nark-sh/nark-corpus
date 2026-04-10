/**
 * bcrypt Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "bcrypt"):
 *   - bcrypt.hash()     postcondition: invalid-args
 *   - bcrypt.compare()  postcondition: invalid-args
 *
 * Detection path: direct import → ThrowingFunctionDetector fires hash()/compare() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import bcrypt from 'bcrypt';

// ─────────────────────────────────────────────────────────────────────────────
// 1. bcrypt.hash() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function hashNoCatch(password: string) {
  // SHOULD_FIRE: invalid-args — bcrypt.hash() throws if arguments are invalid. No try-catch.
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function hashWithCatch(password: string) {
  try {
    // SHOULD_NOT_FIRE: bcrypt.hash() inside try-catch satisfies error handling
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (err) {
    console.error('Hash failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. bcrypt.compare() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function compareNoCatch(password: string, stored: string) {
  // SHOULD_FIRE: invalid-args — bcrypt.compare() throws if arguments are invalid. No try-catch.
  const match = await bcrypt.compare(password, stored);
  return match;
}

export async function compareWithCatch(password: string, stored: string) {
  try {
    // SHOULD_NOT_FIRE: bcrypt.compare() inside try-catch satisfies error handling
    const match = await bcrypt.compare(password, stored);
    return match;
  } catch (err) {
    console.error('Compare failed:', err);
    throw err;
  }
}
