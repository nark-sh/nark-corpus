/**
 * joi Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the joi contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - schema.validateAsync() without try-catch → SHOULD_FIRE: validateasync-rejects
 *   - schema.validateAsync() inside try-catch → SHOULD_NOT_FIRE
 *   - schema.validate() (sync) → SHOULD_NOT_FIRE (scanner cannot detect sync result.error check patterns)
 *   - Joi.assert() (sync) → SHOULD_NOT_FIRE (scanner cannot detect sync throws)
 *   - Joi.attempt() (sync) → SHOULD_NOT_FIRE (scanner cannot detect sync throws)
 *
 * Contracted postconditions:
 *   validateasync-rejects: validateAsync() rejects with ValidationError on invalid data
 *
 * Note: validate(), assert(), attempt() are synchronous — the scanner detects
 * unhandled ASYNC calls (await without try-catch). Sync patterns are out of scanner scope.
 *
 * Coverage:
 *   - Section 1: bare validateAsync() → SHOULD_FIRE
 *   - Section 2: validateAsync() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: validate() (sync, result-based) → SHOULD_NOT_FIRE (scanner cannot detect)
 *   - Section 4: Joi.assert() (sync) → SHOULD_NOT_FIRE (scanner cannot detect)
 */

import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare validateAsync() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function validateUserNoCatch(data: unknown) {
  // SHOULD_FIRE: validateasync-rejects — validateAsync() without try-catch, ValidationError unhandled
  const value = await userSchema.validateAsync(data);
  return value;
}

export async function validateEmailNoCatch(email: string) {
  const emailSchema = Joi.string().email().required();
  // SHOULD_FIRE: validateasync-rejects — validateAsync() without try-catch, rejection propagates
  return await emailSchema.validateAsync(email);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. validateAsync() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function validateUserWithCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: validateAsync() inside try-catch satisfies the validateasync-rejects requirement
    const value = await userSchema.validateAsync(data);
    return value;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Validation failed:", error.message);
    }
    throw error;
  }
}

export async function validateEmailWithCatch(email: string) {
  const emailSchema = Joi.string().email().required();
  try {
    // SHOULD_NOT_FIRE: validateAsync() wrapped in try-catch
    return await emailSchema.validateAsync(email);
  } catch (error) {
    console.error("Email validation failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. validate() (sync, result-based) — scanner detects these too
// Note: the scanner fires on validate() and assert() as well (sync throws).
// To avoid these firing, wrap in try-catch.
// ─────────────────────────────────────────────────────────────────────────────

export function validateUserSyncWithCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: validate() wrapped in try-catch satisfies the validate-returns-error requirement
    const { error, value } = userSchema.validate(data);
    if (error) throw error;
    return value;
  } catch (error) {
    console.error("Validation error:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Joi.assert() — wrapped in try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function assertUserDataWithCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: assert() wrapped in try-catch satisfies the assert-throws requirement
    Joi.assert(data, userSchema);
  } catch (error) {
    console.error("Assertion failed:", error);
  }
}
