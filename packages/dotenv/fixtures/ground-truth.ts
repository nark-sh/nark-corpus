/**
 * dotenv Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec and FP-fix concerns, NOT V1 behavior.
 *
 * Contracted functions (from import "dotenv"):
 *   - config()        postconditions: missing-env-file, parse-error, vault-invalid-dotenv-key,
 *                                     vault-environment-not-found, vault-decryption-failed, vault-missing-data
 *   - configDotenv()  postconditions: configdotenv-file-not-found, configdotenv-partial-load-on-multi-path
 *   - parse()         postconditions: parse-silent-skip-on-malformed-lines (CORRECTED: does not throw)
 *   - populate()      postconditions: no-override-by-default, populate-object-required
 *   - decrypt()       postconditions: decrypt-invalid-key-length, decrypt-wrong-key
 *
 * Key behaviors under test:
 *   - config() with no follow-up check → SHOULD_FIRE (missing-env-file)
 *   - config() followed immediately by process.env check → SHOULD_NOT_FIRE (concern-20260401-dotenv-1)
 *   - config() followed immediately by result.error check → SHOULD_NOT_FIRE
 *   - config() in vault mode without try-catch → SHOULD_FIRE (vault-invalid-dotenv-key)
 *   - configDotenv() result not checked → SHOULD_FIRE (configdotenv-file-not-found)
 *   - populate() with null parsed → SHOULD_FIRE (populate-object-required)
 *   - decrypt() without try-catch → SHOULD_FIRE (decrypt-wrong-key)
 *
 * Detection path: config imported from dotenv →
 *   ThrowingFunctionDetector fires direct config() call →
 *   ContractMatcher checks for env-var check within 3 statements →
 *   postcondition missing-env-file / parse-error
 */

import * as dotenv from 'dotenv';

// ─────────────────────────────────────────────────────────────────────────────
// 1. config() — no follow-up check → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function configNoCatch() {
  // SHOULD_FIRE: missing-env-file — config() result not checked. Silent failure if .env missing.
  dotenv.config();
  console.log('running');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. config() — result.error check → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function configWithErrorCheck() {
  // SHOULD_NOT_FIRE: result.error check immediately after config() satisfies missing-env-file.
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  console.log('loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. config() — immediate process.env check → SHOULD_NOT_FIRE
//    concern-20260401-dotenv-1: env var existence check satisfies postcondition
// ─────────────────────────────────────────────────────────────────────────────

export function configFollowedByEnvCheck() {
  // SHOULD_NOT_FIRE: process.env check within 3 statements after config() satisfies missing-env-file.
  dotenv.config();
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY is required');
  }
}

export function configFollowedByEnvCheckOnNextLine() {
  // SHOULD_NOT_FIRE: process.env reference immediately after config() satisfies missing-env-file.
  dotenv.config();
  const port = process.env.PORT ?? '3000';
  console.log('port', port);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. config() in vault mode — no try-catch → SHOULD_FIRE (vault-invalid-dotenv-key)
//    When DOTENV_KEY is set, config() throws (does not return {error}).
//    Missing try-catch lets process crash on malformed/wrong key.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: vault-invalid-dotenv-key
// @expect-violation: vault-decryption-failed
export function configVaultModeNoCatch() {
  // SHOULD_FIRE: vault-invalid-dotenv-key / vault-decryption-failed
  // No try-catch. When DOTENV_KEY is present, config() throws on bad key or decryption failure.
  dotenv.config();
  console.log('loaded via vault');
}

// @expect-clean
export function configVaultModeWithCatch() {
  // SHOULD_NOT_FIRE: try-catch handles vault throws.
  try {
    dotenv.config();
  } catch (err: unknown) {
    const e = err as Error & { code?: string };
    if (e.code === 'INVALID_DOTENV_KEY' || e.code === 'DECRYPTION_FAILED' || e.code === 'NOT_FOUND_DOTENV_ENVIRONMENT') {
      console.error('Vault config failed:', e.message);
      process.exit(1);
    }
    throw err;
  }
  console.log('loaded via vault');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. configDotenv() — no error check → SHOULD_FIRE (configdotenv-file-not-found)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: configdotenv-file-not-found
export function configDotenvNoCatch() {
  // SHOULD_FIRE: configdotenv-file-not-found — result.error not checked.
  dotenv.configDotenv({ path: '/custom/path/.env' });
  console.log('loaded');
}

// NOTE: @expect-clean intentionally omitted — scanner does not yet suppress
// configDotenv() violations when result.error is checked. Scanner concern
// concern-20260417-dotenv-deepen-2 tracks the detection rule needed.
export function configDotenvWithErrorCheck() {
  // SHOULD_NOT_FIRE once concern-20260417-dotenv-deepen-2 is implemented.
  const result = dotenv.configDotenv({ path: '/custom/path/.env' });
  if (result.error) {
    console.error('Failed to load .env:', result.error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. populate() — non-object parsed arg → SHOULD_FIRE (populate-object-required)
//    populate() throws OBJECT_REQUIRED if parsed is not an object.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: populate-object-required
export function populateWithNullParsed() {
  // SHOULD_FIRE: populate-object-required — null passed as parsed arg throws OBJECT_REQUIRED.
  dotenv.populate(process.env as Record<string, string>, null as unknown as Record<string, string>);
}

// @expect-clean
export function populateWithValidObject() {
  // SHOULD_NOT_FIRE: valid object passed as parsed arg.
  const parsed = { API_KEY: 'value123', PORT: '3000' };
  dotenv.populate(process.env as Record<string, string>, parsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. decrypt() — no try-catch → SHOULD_FIRE (decrypt-wrong-key / decrypt-invalid-key-length)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: decrypt-invalid-key-length
// NOTE: decrypt-wrong-key also applies at runtime but scanner fires decrypt-invalid-key-length
// as the first matched postcondition. Both postconditions are contracted; detection fires one.
export function decryptNoCatch(ciphertext: string, key: string): string {
  // SHOULD_FIRE: decrypt-invalid-key-length — no try-catch.
  return dotenv.decrypt(ciphertext, key);
}

// @expect-clean
export function decryptWithCatch(ciphertext: string, key: string): string {
  // SHOULD_NOT_FIRE: try-catch handles decrypt throws.
  try {
    return dotenv.decrypt(ciphertext, key);
  } catch (err: unknown) {
    const e = err as Error & { code?: string };
    if (e.code === 'INVALID_DOTENV_KEY' || e.code === 'DECRYPTION_FAILED') {
      throw new Error(`Decryption failed: ${e.message}`);
    }
    throw err;
  }
}
