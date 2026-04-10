/**
 * dotenv Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec and FP-fix concerns, NOT V1 behavior.
 *
 * Contracted functions (from import "dotenv"):
 *   - config()  postconditions: missing-env-file, parse-error
 *
 * Key behaviors under test:
 *   - config() with no follow-up check → SHOULD_FIRE (missing-env-file)
 *   - config() followed immediately by process.env check → SHOULD_NOT_FIRE (concern-20260401-dotenv-1)
 *   - config() followed immediately by result.error check → SHOULD_NOT_FIRE
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
