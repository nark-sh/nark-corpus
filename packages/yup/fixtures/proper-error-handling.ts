/**
 * Proper Error Handling for Yup Validation
 *
 * This file demonstrates CORRECT usage of yup validation methods with proper
 * error handling. All validate calls are wrapped in try-catch blocks.
 *
 * Expected: NO violations should be reported for this file.
 */

import * as Yup from 'yup';

// Define schemas
const userSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
  age: Yup.number().positive().integer().required(),
});

const profileSchema = Yup.object({
  username: Yup.string().required(),
  bio: Yup.string().max(500),
});

/**
 * ✅ PROPER: Async validation with try-catch
 */
async function validateUserWithTryCatch(data: unknown) {
  try {
    const validUser = await userSchema.validate(data);
    console.log('Valid user:', validUser);
    return validUser;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed:', error.errors);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Async validation with abortEarly: false
 */
async function validateUserWithAllErrors(data: unknown) {
  try {
    const validUser = await userSchema.validate(data, { abortEarly: false });
    return validUser;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      // Get all errors
      error.inner.forEach(err => {
        console.error(`${err.path}: ${err.message}`);
      });
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Synchronous validation with try-catch
 */
function validateUserSync(data: unknown) {
  try {
    const validUser = userSchema.validateSync(data);
    console.log('Valid user (sync):', validUser);
    return validUser;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Sync validation failed:', error.errors);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: validateAt with try-catch
 */
async function validateEmailField(userData: unknown) {
  try {
    const validEmail = await userSchema.validateAt('email', userData);
    console.log('Valid email:', validEmail);
    return validEmail;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Email validation failed:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: validateSyncAt with try-catch
 */
function validateEmailFieldSync(userData: unknown) {
  try {
    const validEmail = userSchema.validateSyncAt('email', userData);
    console.log('Valid email (sync):', validEmail);
    return validEmail;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Email validation failed (sync):', error.message);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Promise chain with .catch()
 */
async function validateUserWithCatchChain(data: unknown) {
  return userSchema.validate(data)
    .then(validUser => {
      console.log('Valid user:', validUser);
      return validUser;
    })
    .catch(error => {
      if (error instanceof Yup.ValidationError) {
        console.error('Validation failed:', error.errors);
      }
      throw error;
    });
}

/**
 * ✅ PROPER: Multiple validations in sequence
 */
async function validateMultipleSchemas(userData: unknown, profileData: unknown) {
  try {
    const validUser = await userSchema.validate(userData);
    console.log('User validated');

    const validProfile = await profileSchema.validate(profileData);
    console.log('Profile validated');

    return { user: validUser, profile: validProfile };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed:', error.errors);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Validation in Express-like handler
 */
async function expressStyleValidation(requestBody: unknown) {
  try {
    const validData = await userSchema.validate(requestBody, { abortEarly: false });
    // Proceed with valid data
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { success: false, errors };
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Nested try-catch for different error handling
 */
async function nestedValidation(data: unknown) {
  try {
    try {
      const validUser = await userSchema.validate(data);
      return validUser;
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        console.error('Validation error:', validationError.errors);
        // Could retry with defaults or sanitized data
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    throw error;
  }
}

/**
 * ✅ PROPER: Using isValid (safe method, no try-catch needed)
 */
async function checkIfValid(data: unknown) {
  // isValid returns boolean, doesn't throw
  const valid = await userSchema.isValid(data);

  if (!valid) {
    console.log('Data is invalid');
    return false;
  }

  console.log('Data is valid');
  return true;
}

/**
 * ✅ PROPER: Using isValidSync (safe method, no try-catch needed)
 */
function checkIfValidSync(data: unknown) {
  // isValidSync returns boolean, doesn't throw
  const valid = userSchema.isValidSync(data);

  if (!valid) {
    console.log('Data is invalid (sync)');
    return false;
  }

  console.log('Data is valid (sync)');
  return true;
}

/**
 * ✅ PROPER: Form validation pattern
 */
async function validateFormData(formData: unknown) {
  try {
    const validData = await userSchema.validate(formData, { abortEarly: false });
    return { valid: true, data: validData, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.reduce((acc, err) => ({
        ...acc,
        [err.path || 'unknown']: err.message,
      }), {} as Record<string, string>);
      return { valid: false, data: null, errors };
    }
    throw error;
  }
}

// Export for testing
export {
  validateUserWithTryCatch,
  validateUserWithAllErrors,
  validateUserSync,
  validateEmailField,
  validateEmailFieldSync,
  validateUserWithCatchChain,
  validateMultipleSchemas,
  expressStyleValidation,
  nestedValidation,
  checkIfValid,
  checkIfValidSync,
  validateFormData,
};
