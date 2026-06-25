/**
 * bcryptjs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "bcryptjs"):
 *   - bcrypt.hash()        postcondition: hash-type-error (async)
 *   - bcrypt.compare()     postcondition: compare-type-error (async)
 *   - bcrypt.genSalt()     postcondition: gensalt-invalid-rounds (async)
 *   - bcrypt.hashSync()    postcondition: hash-sync-type-error (sync)
 *   - bcrypt.compareSync() postcondition: compare-sync-type-error (sync)
 *   - bcrypt.genSaltSync() postcondition: gensalt-sync-invalid-rounds (sync)
 *   - bcrypt.getRounds()   postcondition: get-rounds-type-error (sync)
 *   - bcrypt.getSalt()     postcondition: get-salt-type-error (sync)
 *   - bcrypt.truncates()   postcondition: truncates-type-error (sync)
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. bcrypt.genSalt() — async Promise-returning (added 2026-06-25 pass 19)
// ─────────────────────────────────────────────────────────────────────────────

export async function genSaltNoCatch(rounds: number) {
  // SHOULD_FIRE: gensalt-invalid-rounds — throws on invalid rounds. No try-catch.
  const salt = await bcrypt.genSalt(rounds);
  return salt;
}

export async function genSaltWithCatch(rounds: number) {
  try {
    // SHOULD_NOT_FIRE: genSalt() inside try-catch satisfies error handling
    return await bcrypt.genSalt(rounds);
  } catch (err) {
    console.error('genSalt failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. bcrypt.hashSync() — sync throw-bearing (added 2026-06-25 pass 19)
// ─────────────────────────────────────────────────────────────────────────────

export function hashSyncNoCatch(password: string) {
  // SHOULD_FIRE: hash-sync-type-error — throws synchronously if password is not a string. No try-catch.
  const hash = bcrypt.hashSync(password, 10);
  return hash;
}

export function hashSyncWithCatch(password: string) {
  try {
    // SHOULD_NOT_FIRE: hashSync() inside try-catch satisfies error handling
    return bcrypt.hashSync(password, 10);
  } catch (err) {
    console.error('hashSync failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. bcrypt.compareSync() — sync throw-bearing (added 2026-06-25 pass 19)
// ─────────────────────────────────────────────────────────────────────────────

export function compareSyncNoCatch(password: string, stored: string) {
  // SHOULD_FIRE: compare-sync-type-error — throws if password or hash is not a string. No try-catch.
  const match = bcrypt.compareSync(password, stored);
  return match;
}

export function compareSyncWithCatch(password: string, stored: string) {
  try {
    // SHOULD_NOT_FIRE: compareSync() inside try-catch satisfies error handling
    return bcrypt.compareSync(password, stored);
  } catch (err) {
    console.error('compareSync failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. bcrypt.genSaltSync() — sync throw-bearing (added 2026-06-25 pass 19)
// ─────────────────────────────────────────────────────────────────────────────

export function genSaltSyncNoCatch(rounds: number) {
  // SHOULD_FIRE: gensalt-sync-invalid-rounds — throws on invalid rounds. No try-catch.
  const salt = bcrypt.genSaltSync(rounds);
  return salt;
}

export function genSaltSyncWithCatch(rounds: number) {
  try {
    // SHOULD_NOT_FIRE: genSaltSync() inside try-catch satisfies error handling
    return bcrypt.genSaltSync(rounds);
  } catch (err) {
    console.error('genSaltSync failed:', err);
    throw err;
  }
}
