/**
 * Missing Error Handling for Yup Validation
 *
 * This file demonstrates INCORRECT usage of yup validation methods WITHOUT
 * proper error handling. All validate calls are missing try-catch blocks.
 *
 * Expected: Multiple ERROR violations should be reported for this file.
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
 * ❌ MISSING: Async validation without try-catch
 * Should trigger violation: validate() can reject with ValidationError
 */
async function validateUserNoTryCatch(data: unknown) {
  const validUser = await userSchema.validate(data);
  console.log('Valid user:', validUser);
  return validUser;
}

/**
 * ❌ MISSING: Async validation with abortEarly, no try-catch
 * Should trigger violation: validate() can reject with ValidationError
 */
async function validateUserAllErrorsNoTryCatch(data: unknown) {
  const validUser = await userSchema.validate(data, { abortEarly: false });
  console.log('Valid user:', validUser);
  return validUser;
}

/**
 * ❌ MISSING: Synchronous validation without try-catch
 * Should trigger violation: validateSync() can throw ValidationError
 */
function validateUserSyncNoTryCatch(data: unknown) {
  const validUser = userSchema.validateSync(data);
  console.log('Valid user (sync):', validUser);
  return validUser;
}

/**
 * ❌ MISSING: validateAt without try-catch
 * Should trigger violation: validateAt() can reject with ValidationError
 */
async function validateEmailFieldNoTryCatch(userData: unknown) {
  const validEmail = await userSchema.validateAt('email', userData);
  console.log('Valid email:', validEmail);
  return validEmail;
}

/**
 * ❌ MISSING: validateSyncAt without try-catch
 * Should trigger violation: validateSyncAt() can throw ValidationError
 */
function validateEmailFieldSyncNoTryCatch(userData: unknown) {
  const validEmail = userSchema.validateSyncAt('email', userData);
  console.log('Valid email (sync):', validEmail);
  return validEmail;
}

/**
 * ❌ MISSING: Multiple validations without try-catch
 * Should trigger violation: both validate() calls can reject
 */
async function validateMultipleSchemasNoTryCatch(userData: unknown, profileData: unknown) {
  const validUser = await userSchema.validate(userData);
  console.log('User validated');

  const validProfile = await profileSchema.validate(profileData);
  console.log('Profile validated');

  return { user: validUser, profile: validProfile };
}

/**
 * ❌ MISSING: Express-like handler without try-catch
 * Should trigger violation: validate() can reject
 */
async function expressStyleNoTryCatch(requestBody: unknown) {
  const validData = await userSchema.validate(requestBody, { abortEarly: false });
  return { success: true, data: validData };
}

/**
 * ❌ MISSING: Chained validations without try-catch
 * Should trigger violations: both validate() calls can reject
 */
async function chainedValidationsNoTryCatch(data: unknown) {
  const validUser = await userSchema.validate(data);
  const validProfile = await profileSchema.validate({ username: 'test' });
  return { validUser, validProfile };
}

/**
 * ❌ MISSING: validate() in arrow function without try-catch
 * Should trigger violation: validate() can reject
 */
const validateArrowNoTryCatch = async (data: unknown) => {
  const result = await userSchema.validate(data);
  return result;
};

/**
 * ❌ MISSING: validateSync in arrow function without try-catch
 * Should trigger violation: validateSync() can throw
 */
const validateSyncArrowNoTryCatch = (data: unknown) => {
  const result = userSchema.validateSync(data);
  return result;
};

/**
 * ❌ MISSING: Validation in conditional without try-catch
 * Should trigger violation: validate() can reject
 */
async function conditionalValidationNoTryCatch(data: unknown, shouldValidate: boolean) {
  if (shouldValidate) {
    const validUser = await userSchema.validate(data);
    return validUser;
  }
  return null;
}

/**
 * ❌ MISSING: Validation in loop without try-catch
 * Should trigger violation: validate() can reject
 */
async function validateArrayNoTryCatch(items: unknown[]) {
  const results = [];
  for (const item of items) {
    const validItem = await userSchema.validate(item);
    results.push(validItem);
  }
  return results;
}

/**
 * ❌ MISSING: Validation with .then() but no .catch()
 * Should trigger violation: unhandled promise rejection
 */
async function validateWithThenNoCatch(data: unknown) {
  return userSchema.validate(data)
    .then(validUser => {
      console.log('Valid user:', validUser);
      return validUser;
    });
  // Missing .catch() - unhandled rejection
}

/**
 * ❌ MISSING: validateSync with options but no try-catch
 * Should trigger violation: validateSync() can throw
 */
function validateSyncWithOptionsNoTryCatch(data: unknown) {
  const validUser = userSchema.validateSync(data, { abortEarly: false });
  return validUser;
}

/**
 * ❌ MISSING: validateAt with path validation, no try-catch
 * Should trigger violation: validateAt() can reject
 */
async function validateNestedFieldNoTryCatch(data: unknown) {
  const validPassword = await userSchema.validateAt('password', data);
  return validPassword;
}

/**
 * ❌ MISSING: Multiple validateAt calls without try-catch
 * Should trigger violations: both can reject
 */
async function validateMultipleFieldsNoTryCatch(data: unknown) {
  const validEmail = await userSchema.validateAt('email', data);
  const validPassword = await userSchema.validateAt('password', data);
  return { validEmail, validPassword };
}

/**
 * ❌ MISSING: Validation in Promise.all without try-catch
 * Should trigger violations: all validate() calls can reject
 */
async function parallelValidationsNoTryCatch(items: unknown[]) {
  const results = await Promise.all(
    items.map(item => userSchema.validate(item))
  );
  return results;
}

/**
 * ❌ MISSING: Validation as return value without try-catch
 * Should trigger violation: validate() can reject
 */
async function returnValidationDirectly(data: unknown) {
  return await userSchema.validate(data);
}

/**
 * ❌ MISSING: validateSyncAt in class method without try-catch
 * Should trigger violation: validateSyncAt() can throw
 */
class UserValidator {
  validateEmailSync(data: unknown) {
    const validEmail = userSchema.validateSyncAt('email', data);
    return validEmail;
  }

  async validateEmailAsync(data: unknown) {
    const validEmail = await userSchema.validateAt('email', data);
    return validEmail;
  }
}

// Export for testing
export {
  validateUserNoTryCatch,
  validateUserAllErrorsNoTryCatch,
  validateUserSyncNoTryCatch,
  validateEmailFieldNoTryCatch,
  validateEmailFieldSyncNoTryCatch,
  validateMultipleSchemasNoTryCatch,
  expressStyleNoTryCatch,
  chainedValidationsNoTryCatch,
  validateArrowNoTryCatch,
  validateSyncArrowNoTryCatch,
  conditionalValidationNoTryCatch,
  validateArrayNoTryCatch,
  validateWithThenNoCatch,
  validateSyncWithOptionsNoTryCatch,
  validateNestedFieldNoTryCatch,
  validateMultipleFieldsNoTryCatch,
  parallelValidationsNoTryCatch,
  returnValidationDirectly,
  UserValidator,
};
