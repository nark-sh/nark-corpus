/**
 * Edge Cases for Yup Validation
 *
 * This file tests edge cases and special patterns:
 * - Mixed proper and improper handling
 * - Nested validations
 * - Generic catch blocks
 * - Safe methods (isValid, isValidSync)
 *
 * Expected: Violations only for missing try-catch on validate/validateSync methods.
 */

import * as Yup from 'yup';

const userSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
});

/**
 * ✅ PROPER: Generic catch block (catches all errors including ValidationError)
 */
async function validateWithGenericCatch(data: unknown) {
  try {
    const result = await userSchema.validate(data);
    return result;
  } catch (error) {
    // Generic catch - still handles ValidationError
    console.error('Error occurred:', error);
    throw error;
  }
}

/**
 * ✅ PROPER: Catch block without instanceof check (still valid)
 */
async function validateWithSimpleCatch(data: unknown) {
  try {
    const result = await userSchema.validate(data);
    return result;
  } catch (err) {
    // Catches all errors including ValidationError
    console.error('Validation or other error:', err);
    return null;
  }
}

/**
 * ❌ MISSING: Validation outside try-catch even with error handling elsewhere
 * Should trigger violation: validate() is not wrapped in try-catch
 */
async function validateThenHandleElsewhere(data: unknown) {
  const result = await userSchema.validate(data);
  return result;
}

// Later code tries to handle but too late
async function callValidationAndCatch() {
  try {
    return await validateThenHandleElsewhere({ email: 'test' });
  } catch (error) {
    console.error('Error caught externally');
  }
}

/**
 * ✅ SAFE: isValid doesn't throw, no try-catch needed
 */
async function useIsValid(data: unknown) {
  const valid = await userSchema.isValid(data);
  if (!valid) {
    console.error('Invalid data');
    return false;
  }
  return true;
}

/**
 * ✅ SAFE: isValidSync doesn't throw, no try-catch needed
 */
function useIsValidSync(data: unknown) {
  const valid = userSchema.isValidSync(data);
  return valid;
}

/**
 * ❌ MIXED: validate() without try-catch but isValid() used correctly
 * Should trigger violation for validate() call
 */
async function mixedSafeAndUnsafe(data: unknown) {
  // Safe - no violation
  const isValid = await userSchema.isValid(data);

  if (isValid) {
    // ❌ Unsafe - should trigger violation
    const result = await userSchema.validate(data);
    return result;
  }

  return null;
}

/**
 * ✅ PROPER: Nested try-catch blocks
 */
async function nestedTryCatch(data: unknown) {
  try {
    try {
      const result = await userSchema.validate(data);
      return result;
    } catch (innerError) {
      if (innerError instanceof Yup.ValidationError) {
        console.error('Inner catch:', innerError.errors);
      }
      throw innerError;
    }
  } catch (outerError) {
    console.error('Outer catch:', outerError);
    return null;
  }
}

/**
 * ❌ PARTIAL: Inner validation missing try-catch
 * Should trigger violation for inner validate() call
 */
async function partialNesting(data: unknown) {
  try {
    // This is wrapped
    const result1 = await userSchema.validate(data);

    // ❌ This is NOT wrapped in its own try-catch
    async function innerValidation() {
      const result2 = await userSchema.validate(data);
      return result2;
    }

    const inner = await innerValidation();
    return { result1, inner };
  } catch (error) {
    console.error('Outer error:', error);
    return null;
  }
}

/**
 * ✅ PROPER: Finally block with proper error handling
 */
async function validateWithFinally(data: unknown) {
  try {
    const result = await userSchema.validate(data);
    return result;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed');
    }
    throw error;
  } finally {
    console.log('Validation attempt complete');
  }
}

/**
 * ❌ MISSING: Try block without catch (only finally)
 * Should trigger violation: no catch block to handle rejection
 */
async function tryFinallyNoCatch(data: unknown) {
  try {
    const result = await userSchema.validate(data);
    return result;
  } finally {
    console.log('Cleanup');
  }
}

/**
 * ✅ PROPER: Validation with custom error class
 */
class ValidationFailedError extends Error {
  constructor(public validationErrors: string[]) {
    super('Validation failed');
  }
}

async function validateWithCustomError(data: unknown) {
  try {
    const result = await userSchema.validate(data, { abortEarly: false });
    return result;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ValidationFailedError(error.errors);
    }
    throw error;
  }
}

/**
 * ❌ MISSING: Promise.race with validate() without try-catch
 * Should trigger violation: validate() can reject
 */
async function validateWithTimeout(data: unknown) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  );

  const validation = userSchema.validate(data);

  const result = await Promise.race([validation, timeout]);
  return result;
}

/**
 * ✅ PROPER: Promise.race with try-catch
 */
async function validateWithTimeoutProper(data: unknown) {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const validation = userSchema.validate(data);

    const result = await Promise.race([validation, timeout]);
    return result;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed');
    }
    throw error;
  }
}

/**
 * ❌ MISSING: Validation in callback without try-catch
 * Should trigger violation: validate() can reject
 */
function validateInCallback(data: unknown, callback: (result: any) => void) {
  userSchema.validate(data)
    .then(result => {
      callback(result);
    });
  // Missing .catch() - unhandled rejection
}

/**
 * ✅ PROPER: Validation in callback with .catch()
 */
function validateInCallbackProper(data: unknown, callback: (result: any) => void) {
  userSchema.validate(data)
    .then(result => {
      callback(result);
    })
    .catch(error => {
      if (error instanceof Yup.ValidationError) {
        console.error('Validation failed:', error.errors);
      }
    });
}

/**
 * ❌ MISSING: validateSync in synchronous code without try-catch
 * Should trigger violation: validateSync() can throw
 */
function syncValidationNoTryCatch(data: unknown) {
  const result = userSchema.validateSync(data);
  console.log('Result:', result);
  return result;
}

/**
 * ✅ PROPER: Safe check before validation (but still needs try-catch)
 */
async function safeCheckThenValidate(data: unknown) {
  // Check first (safe)
  const isValid = await userSchema.isValid(data);

  if (!isValid) {
    return null;
  }

  // Still need try-catch even though we know it's valid
  // (schema could have changed, race conditions, etc.)
  try {
    const result = await userSchema.validate(data);
    return result;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Unexpected validation error:', error.errors);
    }
    throw error;
  }
}

/**
 * ❌ MISSING: Assuming isValid means validate won't throw (wrong)
 * Should trigger violation: validate() still needs try-catch
 */
async function falseSecurityWithIsValid(data: unknown) {
  const isValid = await userSchema.isValid(data);

  if (isValid) {
    // ❌ Still needs try-catch even though isValid returned true
    const result = await userSchema.validate(data);
    return result;
  }

  return null;
}

// Export for testing
export {
  validateWithGenericCatch,
  validateWithSimpleCatch,
  validateThenHandleElsewhere,
  callValidationAndCatch,
  useIsValid,
  useIsValidSync,
  mixedSafeAndUnsafe,
  nestedTryCatch,
  partialNesting,
  validateWithFinally,
  tryFinallyNoCatch,
  validateWithCustomError,
  validateWithTimeout,
  validateWithTimeoutProper,
  validateInCallback,
  validateInCallbackProper,
  syncValidationNoTryCatch,
  safeCheckThenValidate,
  falseSecurityWithIsValid,
};
