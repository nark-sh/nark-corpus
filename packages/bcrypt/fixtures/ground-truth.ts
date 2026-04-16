/**
 * bcrypt Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "bcrypt"):
 *   - bcrypt.hash()       postconditions: invalid-args, hash-invalid-callback, hashing-error
 *   - bcrypt.compare()    postconditions: invalid-args, compare-invalid-callback, comparison-error
 *   - bcrypt.genSalt()    postconditions: invalid-rounds, invalid-minor, gen-salt-entropy-error
 *   - bcrypt.hashSync()   postconditions: hash-sync-invalid-args, hash-sync-event-loop-block
 *   - bcrypt.compareSync() postconditions: compare-sync-invalid-args, compare-sync-event-loop-block
 *   - bcrypt.genSaltSync() postconditions: gen-salt-sync-invalid-rounds, gen-salt-sync-invalid-minor
 *   - bcrypt.getRounds()  postconditions: get-rounds-missing-hash, get-rounds-invalid-type
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. bcrypt.genSalt() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function genSaltNoCatch() {
  // SHOULD_FIRE: invalid-rounds — bcrypt.genSalt() missing try-catch (scanner detects via existing rule)
  const salt = await bcrypt.genSalt(10);
  return salt;
}

export async function genSaltWithCatch() {
  try {
    // SHOULD_NOT_FIRE: bcrypt.genSalt() inside try-catch
    const salt = await bcrypt.genSalt(10);
    return salt;
  } catch (err) {
    console.error('genSalt failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. bcrypt.hashSync() — in an async context that could be a request handler
// ─────────────────────────────────────────────────────────────────────────────

export function hashSyncNoCatch(password: string) {
  // SHOULD_FIRE: hash-sync-invalid-args — bcrypt.hashSync() missing try-catch
  const hash = bcrypt.hashSync(password, 10);
  return hash;
}

export function hashSyncWithCatch(password: string) {
  try {
    // SHOULD_NOT_FIRE: hashSync wrapped in try-catch
    const hash = bcrypt.hashSync(password, 10);
    return hash;
  } catch (err) {
    console.error('hashSync failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. bcrypt.getRounds() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function getRoundsNoCatch(hash: string) {
  // SHOULD_FIRE: get-rounds-missing-hash — bcrypt.getRounds() missing try-catch
  const rounds = bcrypt.getRounds(hash);
  return rounds;
}

export function getRoundsWithCatch(hash: string) {
  try {
    // SHOULD_NOT_FIRE: getRounds wrapped in try-catch
    const rounds = bcrypt.getRounds(hash);
    return rounds;
  } catch (err) {
    console.error('getRounds failed:', err);
    throw err;
  }
}
