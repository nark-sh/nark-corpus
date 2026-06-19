/**
 * bcryptjs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "bcryptjs"):
 *   - bcrypt.hash()     postcondition: hash-type-error
 *   - bcrypt.compare()  postcondition: compare-type-error
 *
 * Detection path: direct import → ThrowingFunctionDetector fires hash()/compare() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. bcrypt.hash() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function hashNoCatch(password: string) {
  // SHOULD_FIRE: hash-type-error — bcrypt.hash() throws on invalid args. No try-catch.
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
  // SHOULD_FIRE: compare-type-error — bcrypt.compare() throws on invalid args. No try-catch.
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. bcrypt.getRounds() — sync throwing function (added 2026-06-19 pass 18)
// ─────────────────────────────────────────────────────────────────────────────

export function getRoundsNoCatch(storedHash: string) {
  // SHOULD_FIRE: get-rounds-type-error — throws synchronously if input is not a string
  const rounds = bcrypt.getRounds(storedHash);
  return rounds;
}

export function getRoundsWithCatch(storedHash: string) {
  try {
    // SHOULD_NOT_FIRE: getRounds() inside try-catch satisfies error handling
    return bcrypt.getRounds(storedHash);
  } catch (err) {
    console.error('getRounds failed:', err);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. bcrypt.getSalt() — sync throwing function (added 2026-06-19 pass 18)
// ─────────────────────────────────────────────────────────────────────────────

export function getSaltNoCatch(storedHash: string) {
  // SHOULD_FIRE: get-salt-type-error — throws if not a string or if length != 60. No try-catch.
  const salt = bcrypt.getSalt(storedHash);
  return salt;
}

export function getSaltWithCatch(storedHash: string) {
  try {
    // SHOULD_NOT_FIRE: getSalt() inside try-catch satisfies error handling
    return bcrypt.getSalt(storedHash);
  } catch (err) {
    console.error('getSalt failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. bcrypt.truncates() — sync throwing function (added 2026-06-19 pass 18)
// ─────────────────────────────────────────────────────────────────────────────

export function truncatesNoCatch(password: string) {
  // SHOULD_FIRE: truncates-type-error — throws if password is not a string. No try-catch.
  const willTruncate = bcrypt.truncates(password);
  return willTruncate;
}

export function truncatesWithCatch(password: string) {
  try {
    // SHOULD_NOT_FIRE: truncates() inside try-catch satisfies error handling
    return bcrypt.truncates(password);
  } catch (err) {
    console.error('truncates failed:', err);
    return false;
  }
}
