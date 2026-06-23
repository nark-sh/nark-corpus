/**
 * Ground-truth fixture for yup
 *
 * Documents expected violations for yup schema validation methods.
 * Each SHOULD_FIRE annotation maps to a postcondition in contract.yaml.
 * Each SHOULD_NOT_FIRE annotation confirms the analyzer does not false-positive.
 *
 * Postcondition IDs:
 *   validate-rejects                    — validate() without try-catch
 *   validatesync-throws                 — validateSync() without try-catch
 *   validatesync-async-test-throws      — validateSync() on schema with async test()
 *   validateat-rejects                  — validateAt() without try-catch
 *   validatesyncat-throws               — validateSyncAt() without try-catch
 *   isvalid-non-validation-error-rethrows — isValid() without catch (async test may throw)
 *   cast-type-error                     — cast() without try-catch (throws TypeError)
 *   cast-transform-throws               — cast() without try-catch (custom transform throws)
 *   standard-validate-infrastructure-error-rethrows — ~standard.validate() without try-catch
 *     (re-throws non-ValidationError from async test functions; added 2026-06-23 pass)
 */

import * as Yup from 'yup';

const userSchema = Yup.object({
  email: Yup.string().email().required(),
  name: Yup.string().required(),
  age: Yup.number().positive().required(),
});

// Schema with async test() — isValid() on this may reject with non-ValidationError
const schemaWithAsyncTest = Yup.object({
  email: Yup.string()
    .email()
    .test('unique', 'Email already taken', async (val) => {
      // Simulates a DB check — could throw DatabaseError, NetworkError, etc.
      return val !== 'taken@example.com';
    }),
});

// ============================================================
// validate() — SHOULD_FIRE cases
// ============================================================

async function validateNoTryCatch(data: unknown) {
  // SHOULD_FIRE: validate-rejects — validate() awaited without try-catch
  const valid = await userSchema.validate(data);
  return valid;
}

const validateArrowNoTryCatch = async (data: unknown) => {
  // SHOULD_FIRE: validate-rejects — validate() in async arrow without try-catch
  return await userSchema.validate(data);
};

// ============================================================
// validateSync() — SHOULD_FIRE cases
// ============================================================

function validateSyncNoTryCatch(data: unknown) {
  // SHOULD_FIRE: validatesync-throws — validateSync() without try-catch
  const valid = userSchema.validateSync(data);
  return valid;
}

// ============================================================
// validateAt() — SHOULD_FIRE cases
// ============================================================

async function validateAtNoTryCatch(data: unknown) {
  // SHOULD_FIRE: validateat-rejects — validateAt() awaited without try-catch
  const valid = await userSchema.validateAt('email', data);
  return valid;
}

// ============================================================
// isValid() — SHOULD_FIRE cases
// ============================================================

async function isValidWithoutCatch(data: unknown) {
  // SHOULD_FIRE: isvalid-non-validation-error-rethrows — isValid() without catch on schema with async test
  const valid = await schemaWithAsyncTest.isValid(data);
  return valid;
}

// ============================================================
// cast() — SHOULD_FIRE cases
// ============================================================

function castWithoutTryCatch(rawInput: unknown) {
  // SHOULD_FIRE: cast-type-error — cast() called without try-catch
  const num = Yup.number().cast(rawInput);
  return num;
}

function castObjectWithoutTryCatch(rawInput: unknown) {
  // SHOULD_FIRE: cast-type-error — cast() on object schema without try-catch
  const obj = userSchema.cast(rawInput);
  return obj;
}

// ============================================================
// validate() — SHOULD_NOT_FIRE cases (proper error handling)
// ============================================================

async function validateWithTryCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: validate() with try-catch — proper error handling
    const valid = await userSchema.validate(data);
    return valid;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed:', error.errors);
    }
    throw error;
  }
}

async function validateWithCatchChain(data: unknown) {
  // SHOULD_NOT_FIRE: validate() with .catch() chained
  return userSchema.validate(data)
    .then(valid => valid)
    .catch(error => {
      throw error;
    });
}

// ============================================================
// validateSync() — SHOULD_NOT_FIRE cases
// ============================================================

function validateSyncWithTryCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: validateSync() with try-catch — proper error handling
    const valid = userSchema.validateSync(data);
    return valid;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Sync validation failed:', error.errors);
    }
    throw error;
  }
}

// ============================================================
// isValid() — SHOULD_NOT_FIRE cases
// ============================================================

async function isValidWithTryCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: isValid() with try-catch — handles non-ValidationError from async tests
    const valid = await schemaWithAsyncTest.isValid(data);
    return valid;
  } catch (error) {
    // Handles non-ValidationError from async test() (e.g., DB error, network error)
    console.error('Validation service error:', error);
    return false;
  }
}

async function isValidWithCatchFallback(data: unknown) {
  // SHOULD_NOT_FIRE: isValid() with .catch() chained
  return schemaWithAsyncTest.isValid(data).catch(() => false);
}

// ============================================================
// cast() — SHOULD_NOT_FIRE cases
// ============================================================

function castWithTryCatch(rawInput: unknown) {
  try {
    // SHOULD_NOT_FIRE: cast() with try-catch — handles TypeError
    const num = Yup.number().cast(rawInput);
    return num;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Cast failed:', error.message);
    }
    throw error;
  }
}

function castWithAssertFalse(rawInput: unknown) {
  // SHOULD_NOT_FIRE: cast() with assert: false — returns null instead of throwing
  const result = Yup.number().cast(rawInput, { assert: false });
  return result;
}

// ============================================================
// ~standard.validate() — SHOULD_FIRE cases
// (Standard Schema interface; re-throws non-ValidationError from async test functions)
// ============================================================

async function standardValidateWithoutCatch(data: unknown) {
  // SHOULD_FIRE: standard-validate-infrastructure-error-rethrows
  // ~standard.validate() does NOT throw ValidationError (returns { issues } instead),
  // but DOES re-throw non-ValidationError exceptions from async test() functions.
  // Common in integration libraries (react-hook-form standardResolver, tRPC, conform).
  const result = await schemaWithAsyncTest['~standard'].validate(data);
  if (result.issues) {
    return { ok: false, errors: result.issues };
  }
  return { ok: true, value: result.value };
}

// ============================================================
// ~standard.validate() — SHOULD_NOT_FIRE cases
// ============================================================

async function standardValidateWithTryCatch(data: unknown) {
  try {
    // SHOULD_NOT_FIRE: ~standard.validate() with try-catch — handles infrastructure errors
    const result = await schemaWithAsyncTest['~standard'].validate(data);
    if (result.issues) {
      return { ok: false, errors: result.issues };
    }
    return { ok: true, value: result.value };
  } catch (error) {
    console.error('Validation infrastructure error:', error);
    return { ok: false, errors: [{ message: 'Validation service unavailable' }] };
  }
}

async function standardValidateWithCatchChain(data: unknown) {
  // SHOULD_NOT_FIRE: ~standard.validate() with .catch() handler
  return schemaWithAsyncTest['~standard']
    .validate(data)
    .catch((error: unknown) => {
      console.error('Standard schema validation failed:', error);
      return { issues: [{ message: 'Service unavailable' }] };
    });
}

export {
  validateNoTryCatch,
  validateArrowNoTryCatch,
  validateSyncNoTryCatch,
  validateAtNoTryCatch,
  isValidWithoutCatch,
  castWithoutTryCatch,
  castObjectWithoutTryCatch,
  validateWithTryCatch,
  validateWithCatchChain,
  validateSyncWithTryCatch,
  isValidWithTryCatch,
  isValidWithCatchFallback,
  castWithTryCatch,
  castWithAssertFalse,
  standardValidateWithoutCatch,
  standardValidateWithTryCatch,
  standardValidateWithCatchChain,
};
