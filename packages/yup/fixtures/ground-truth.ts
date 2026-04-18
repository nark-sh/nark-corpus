/**
 * Ground-truth fixture for yup
 *
 * Documents expected violations for yup schema validation methods.
 * Each SHOULD_FIRE annotation maps to a postcondition in contract.yaml.
 * Each SHOULD_NOT_FIRE annotation confirms the analyzer does not false-positive.
 *
 * Note: The yup analyzer has a known limitation — schema instances created by
 * factory functions (Yup.object(), Yup.string(), etc.) cannot currently be
 * tracked by the analyzer. Detection rate is 0% until factory-method tracking
 * is implemented. These annotations document the DESIRED behavior.
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

// SHOULD_FIRE: validate-rejects — validate() awaited without try-catch
async function validateNoTryCatch(data: unknown) {
  const valid = await userSchema.validate(data);
  return valid;
}

// SHOULD_FIRE: validate-rejects — validate() in async arrow without try-catch
const validateArrowNoTryCatch = async (data: unknown) => {
  return await userSchema.validate(data);
};

// ============================================================
// validateSync() — SHOULD_FIRE cases
// ============================================================

// SHOULD_FIRE: validatesync-throws — validateSync() without try-catch
function validateSyncNoTryCatch(data: unknown) {
  const valid = userSchema.validateSync(data);
  return valid;
}

// ============================================================
// validateAt() — SHOULD_FIRE cases
// ============================================================

// SHOULD_FIRE: validateat-rejects — validateAt() awaited without try-catch
async function validateAtNoTryCatch(data: unknown) {
  const valid = await userSchema.validateAt('email', data);
  return valid;
}

// ============================================================
// isValid() — SHOULD_FIRE cases
// ============================================================

// SHOULD_FIRE: isvalid-non-validation-error-rethrows — isValid() without catch on schema with async test
async function isValidWithoutCatch(data: unknown) {
  const valid = await schemaWithAsyncTest.isValid(data);
  return valid;
}

// ============================================================
// cast() — SHOULD_FIRE cases
// ============================================================

// SHOULD_FIRE: cast-type-error — cast() called without try-catch
function castWithoutTryCatch(rawInput: unknown) {
  const num = Yup.number().cast(rawInput);
  return num;
}

// SHOULD_FIRE: cast-type-error — cast() on object schema without try-catch
function castObjectWithoutTryCatch(rawInput: unknown) {
  const obj = userSchema.cast(rawInput);
  return obj;
}

// ============================================================
// validate() — SHOULD_NOT_FIRE cases (proper error handling)
// ============================================================

// SHOULD_NOT_FIRE: validate() with try-catch — proper error handling
async function validateWithTryCatch(data: unknown) {
  try {
    const valid = await userSchema.validate(data);
    return valid;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed:', error.errors);
    }
    throw error;
  }
}

// SHOULD_NOT_FIRE: validate() with .catch() chained
async function validateWithCatchChain(data: unknown) {
  return userSchema.validate(data)
    .then(valid => valid)
    .catch(error => {
      throw error;
    });
}

// ============================================================
// validateSync() — SHOULD_NOT_FIRE cases
// ============================================================

// SHOULD_NOT_FIRE: validateSync() with try-catch — proper error handling
function validateSyncWithTryCatch(data: unknown) {
  try {
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

// SHOULD_NOT_FIRE: isValid() with try-catch — handles non-ValidationError from async tests
async function isValidWithTryCatch(data: unknown) {
  try {
    const valid = await schemaWithAsyncTest.isValid(data);
    return valid;
  } catch (error) {
    // Handles non-ValidationError from async test() (e.g., DB error, network error)
    console.error('Validation service error:', error);
    return false;
  }
}

// SHOULD_NOT_FIRE: isValid() with .catch() chained
async function isValidWithCatchFallback(data: unknown) {
  return schemaWithAsyncTest.isValid(data).catch(() => false);
}

// ============================================================
// cast() — SHOULD_NOT_FIRE cases
// ============================================================

// SHOULD_NOT_FIRE: cast() with try-catch — handles TypeError
function castWithTryCatch(rawInput: unknown) {
  try {
    const num = Yup.number().cast(rawInput);
    return num;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Cast failed:', error.message);
    }
    throw error;
  }
}

// SHOULD_NOT_FIRE: cast() with assert: false — returns null instead of throwing
function castWithAssertFalse(rawInput: unknown) {
  const result = Yup.number().cast(rawInput, { assert: false });
  return result;
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
};
