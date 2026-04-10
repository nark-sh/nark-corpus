import validator from 'validator';

/**
 * PROPER: Checks return value from isEmail()
 * Should NOT trigger violation.
 */
function validateEmailWithCheck(email: string): string {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}

/**
 * PROPER: Normalizes email and checks for failure
 * Should NOT trigger violation.
 */
function normalizeEmailSafely(email: string): string {
  const normalized = validator.normalizeEmail(email);
  if (normalized === false) {
    throw new Error('Invalid email - normalization failed');
  }
  return normalized;
}

/**
 * PROPER: Validates URL with protocol whitelist
 * Should NOT trigger violation.
 */
function validateSecureURL(url: string): string {
  if (!validator.isURL(url, { protocols: ['https'], require_protocol: true })) {
    throw new Error('Invalid or insecure URL');
  }
  return url;
}

/**
 * PROPER: Validates JSON before parsing
 * Should NOT trigger violation.
 */
function safeJSONParse(input: string): any {
  if (!validator.isJSON(input)) {
    throw new Error('Invalid JSON format');
  }
  return JSON.parse(input);
}

/**
 * PROPER: Escapes user input before HTML rendering
 * Should NOT trigger violation.
 */
function renderUserBio(bio: string): string {
  const safeBio = validator.escape(bio);
  return `<p>${safeBio}</p>`;
}

/**
 * PROPER: Handles sanitizer failures (toDate returns null)
 * Should NOT trigger violation.
 */
function parseUserDate(dateStr: string): Date {
  const date = validator.toDate(dateStr);
  if (date === null) {
    throw new Error('Invalid date format');
  }
  return date;
}

/**
 * PROPER: Handles sanitizer failures (toInt returns NaN)
 * Should NOT trigger violation.
 */
function parseUserAge(ageStr: string): number {
  const age = validator.toInt(ageStr);
  if (isNaN(age)) {
    throw new Error('Invalid age - must be a number');
  }
  if (age < 0 || age > 150) {
    throw new Error('Invalid age - out of range');
  }
  return age;
}

/**
 * PROPER: Combined sanitization + validation pattern
 * Should NOT trigger violation.
 */
function processUserEmail(rawEmail: string): string {
  // Sanitize first
  const trimmed = validator.trim(rawEmail);

  // Validate
  if (!validator.isEmail(trimmed)) {
    throw new Error('Invalid email format');
  }

  // Normalize
  const normalized = validator.normalizeEmail(trimmed);
  if (normalized === false) {
    throw new Error('Email normalization failed');
  }

  return normalized;
}
