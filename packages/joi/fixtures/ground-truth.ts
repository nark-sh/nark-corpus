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
 *   - Joi.compile() (sync) → SHOULD_NOT_FIRE (scanner cannot detect sync throws)
 *
 * Contracted postconditions:
 *   validateasync-rejects: validateAsync() rejects with ValidationError on invalid data
 *   compile-invalid-schema-throws: compile() throws AssertError on invalid/undefined schema
 *   compile-version-mismatch-throws: compile() throws AssertError on joi version mismatch
 *   extend-empty-extensions-throws: extend() throws AssertError when called with no extensions
 *   extend-invalid-extension-shape-throws: extend() throws when extension shape is invalid
 *   extend-override-existing-type-throws: extend() throws when overriding existing type name
 *   defaults-non-function-modifier-throws: defaults() throws when modifier is not a function
 *   defaults-modifier-returns-non-schema-throws: defaults() throws when modifier returns non-schema
 *
 * Note: validate(), assert(), attempt(), compile() are synchronous — the scanner detects
 * unhandled ASYNC calls (await without try-catch). Sync patterns are out of scanner scope.
 *
 * Coverage:
 *   - Section 1: bare validateAsync() → SHOULD_FIRE
 *   - Section 2: validateAsync() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: validate() (sync, result-based) → SHOULD_NOT_FIRE (scanner cannot detect)
 *   - Section 4: Joi.assert() (sync) → SHOULD_NOT_FIRE (scanner cannot detect)
 *   - Section 5: Joi.compile() (sync) → SHOULD_NOT_FIRE (scanner cannot detect sync throws)
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. Joi.compile() — synchronous, throws AssertError on invalid schema
// Note: compile() is synchronous — scanner cannot detect bare compile() calls.
// Both cases below are SHOULD_NOT_FIRE for the async scanner.
// However, compile() should be wrapped when receiving dynamic schema definitions.
// ─────────────────────────────────────────────────────────────────────────────

export function compileDynamicSchemaSafe(rawSchema: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: compile-invalid-schema-throws — compile() wrapped in try-catch
    // Correct pattern when compiling schemas from dynamic sources (config, plugins)
    const schema = Joi.compile(rawSchema);
    return schema;
  } catch (err) {
    console.error("Invalid schema definition:", err);
    return null;
  }
}

export function compileStaticSchema() {
  // SHOULD_NOT_FIRE: compile-invalid-schema-throws — static literal schema, safe at module load
  // compile() on a known-correct literal schema never throws at runtime
  const schema = Joi.compile({ name: Joi.string().required() });
  return schema;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Joi.extend() — synchronous, throws AssertError on invalid extensions
// Note: extend() is synchronous — scanner cannot detect bare extend() calls.
// All cases below are SHOULD_NOT_FIRE for the async scanner.
// Wrap in try-catch when extensions come from dynamic sources (plugins, config).
// ─────────────────────────────────────────────────────────────────────────────

export function extendDynamicExtensionsSafe(
  extensions: Array<{ type: string; base?: unknown }>
) {
  try {
    // SHOULD_NOT_FIRE: extend-empty-extensions-throws — extend() wrapped in try-catch
    const customJoi = (Joi as any).extend(...extensions);
    return customJoi;
  } catch (err) {
    console.error("Failed to load joi extensions:", err);
    return Joi;
  }
}

export function extendStaticExtension() {
  // SHOULD_FIRE: extend-invalid-extension-shape-throws — bare extend() without try-catch
  const customJoi = (Joi as any).extend({
    type: "trimmedString",
    base: Joi.string(),
    coerce(value: unknown) {
      return { value: typeof value === "string" ? value.trim() : value };
    },
  });
  return customJoi;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Joi.defaults() — synchronous, throws AssertError on invalid modifier
// Note: defaults() is synchronous — scanner cannot detect bare defaults() calls.
// All cases below are SHOULD_NOT_FIRE for the async scanner.
// ─────────────────────────────────────────────────────────────────────────────

export function defaultsCorrectModifier() {
  // SHOULD_FIRE: defaults-modifier-returns-non-schema-throws — bare defaults() without try-catch
  const requiredJoi = (Joi as any).defaults((schema: any) => schema.required());
  return requiredJoi;
}

export function defaultsDynamicModifierSafe(modifierFn: unknown) {
  try {
    // SHOULD_NOT_FIRE: defaults-non-function-modifier-throws — defaults() wrapped in try-catch
    const customJoi = (Joi as any).defaults(modifierFn);
    return customJoi;
  } catch (err) {
    console.error("Invalid joi modifier:", err);
    return Joi;
  }
}
