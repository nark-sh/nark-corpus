import validator from 'validator';

/**
 * Proper validation checking
 * Should NOT trigger violations (validator doesn't throw).
 */
function validateEmailProperly(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Proper URL validation
 * Should NOT trigger violations (validator doesn't throw).
 */
function validateURLProperly(url: string): boolean {
  return validator.isURL(url);
}
