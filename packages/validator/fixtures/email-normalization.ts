import validator from 'validator';

/**
 * Email Normalization Patterns for validator.normalizeEmail()
 */

/**
 * PROPER: Normalize email before storage
 * Should NOT trigger violation.
 */
async function registerUserSafe(email: string, password: string): Promise<void> {
  // Trim whitespace
  const trimmed = validator.trim(email);

  // Validate format
  if (!validator.isEmail(trimmed)) {
    throw new Error('Invalid email format');
  }

  // Normalize (converts to lowercase, removes Gmail aliases)
  const normalized = validator.normalizeEmail(trimmed);
  if (normalized === false) {
    throw new Error('Email normalization failed');
  }

  // Now safe to store - prevents duplicate accounts
  await createUser({ email: normalized, password });
}

/**
 * PROPER: Check normalizeEmail() return value
 * Should NOT trigger violation.
 */
function processEmailSafe(email: string): string {
  const normalized = validator.normalizeEmail(email);
  if (normalized === false) {
    throw new Error('Invalid email - normalization failed');
  }
  return normalized;
}

/**
 * MISSING: Email not normalized before storage
 * Should trigger WARNING violation (allows duplicates).
 */
async function registerUserDuplicatesAllowed(email: string, password: string): Promise<void> {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email');
  }

  // ❌ No normalization - allows:
  // - User@Example.com
  // - user@example.com
  // - user+spam@gmail.com
  // All treated as DIFFERENT users
  await createUser({ email, password });
}

/**
 * MISSING: normalizeEmail() result not checked
 * Should trigger ERROR violation.
 */
function normalizeEmailUnchecked(email: string): string {
  const normalized = validator.normalizeEmail(email);
  // ❌ No check for false - type assertion hides the bug
  return normalized as string;
}

/**
 * PROPER: Normalize with custom options
 * Should NOT trigger violation.
 */
function normalizeEmailCustomOptions(email: string): string {
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_subaddress: false, // Keep +alias for Gmail
    gmail_remove_dots: false,       // Keep dots in Gmail addresses
    all_lowercase: true             // Still lowercase everything
  });

  if (normalized === false) {
    throw new Error('Invalid email');
  }

  return normalized;
}

/**
 * PROPER: Email login with normalization (prevents case-sensitivity issues)
 * Should NOT trigger violation.
 */
async function loginUserSafe(email: string, password: string): Promise<boolean> {
  // Normalize login email same way as registration
  const trimmed = validator.trim(email);
  const normalized = validator.normalizeEmail(trimmed);

  if (normalized === false) {
    throw new Error('Invalid email format');
  }

  // Look up user by normalized email
  const user = await findUserByEmail(normalized);
  if (!user) {
    return false;
  }

  return verifyPassword(user, password);
}

/**
 * MISSING: Email lookup without normalization (case-sensitive)
 * Should trigger WARNING violation.
 */
async function loginUserCaseSensitive(email: string, password: string): Promise<boolean> {
  // ❌ No normalization - user who registered with User@Example.com
  // cannot login with user@example.com
  const user = await findUserByEmail(email);
  if (!user) {
    return false;
  }

  return verifyPassword(user, password);
}

/**
 * PROPER: Bulk email processing with normalization
 * Should NOT trigger violation.
 */
function deduplicateEmailsSafe(emails: string[]): string[] {
  const normalized = emails
    .map(email => validator.normalizeEmail(email))
    .filter((email): email is string => email !== false); // Remove invalid

  // Remove duplicates using Set
  return Array.from(new Set(normalized));
}

/**
 * MISSING: Bulk processing without normalization
 * Should trigger WARNING violation (duplicates not detected).
 */
function deduplicateEmailsUnsafe(emails: string[]): string[] {
  // ❌ No normalization - User@Example.com and user@example.com both kept
  return Array.from(new Set(emails));
}

// Mock functions
async function createUser(data: { email: string; password: string }): Promise<void> {
  // Simulated user creation
}

async function findUserByEmail(email: string): Promise<any> {
  // Simulated user lookup
  return null;
}

async function verifyPassword(user: any, password: string): Promise<boolean> {
  // Simulated password verification
  return false;
}
