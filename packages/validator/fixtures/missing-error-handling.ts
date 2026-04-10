import validator from 'validator';

/**
 * MISSING: isEmail() called but return value not checked
 * Should trigger WARNING violation.
 */
function validateEmailNoCheck(email: string): string {
  validator.isEmail(email); // ❌ Return value ignored
  return email;
}

/**
 * MISSING: normalizeEmail() result not checked for false
 * Should trigger ERROR violation.
 */
function normalizeEmailUnchecked(email: string): string {
  const normalized = validator.normalizeEmail(email);
  // ❌ No check for false - will cause issues if email is invalid
  return normalized as string;
}

/**
 * MISSING: isURL() used without protocol whitelist
 * Should trigger ERROR violation (allows javascript:, data: URIs).
 */
function validateURLNoWhitelist(url: string): string {
  if (!validator.isURL(url)) {
    throw new Error('Invalid URL');
  }
  // ❌ No protocol whitelist - accepts javascript:alert(1)
  return url;
}

/**
 * MISSING: User input rendered in HTML without escape()
 * Should trigger ERROR violation (XSS vulnerability).
 */
function renderUserBioUnsafe(bio: string): string {
  // ❌ No escape() - XSS vulnerability
  return `<p>${bio}</p>`;
}

/**
 * MISSING: JSON.parse() without isJSON() validation
 * Should trigger WARNING violation.
 */
function parseJSONUnsafe(input: string): any {
  // ❌ No validation - will throw SyntaxError on invalid JSON
  return JSON.parse(input);
}

/**
 * MISSING: toDate() failure not checked (returns null)
 * Should trigger ERROR violation.
 */
function parseUserDateUnchecked(dateStr: string): number {
  const date = validator.toDate(dateStr);
  // ❌ No null check - will crash if date is null
  return date!.getFullYear();
}

/**
 * MISSING: toInt() failure not checked (returns NaN)
 * Should trigger ERROR violation.
 */
function parseUserAgeUnchecked(ageStr: string): number {
  const age = validator.toInt(ageStr);
  // ❌ No NaN check - will cause logic errors
  if (age > 150) {
    throw new Error('Age too high');
  }
  return age;
}

/**
 * MISSING: Email not normalized before storage
 * Should trigger WARNING violation (duplicate accounts possible).
 */
async function saveUserEmailUnnormalized(email: string): Promise<void> {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email');
  }
  // ❌ No normalizeEmail() - allows duplicate accounts via case differences
  // User@Example.com and user@example.com treated as different
  await saveToDatabase({ email });
}

/**
 * MISSING: Combined failures - no validation, no escaping
 * Should trigger multiple violations.
 */
function renderUserProfileUnsafe(name: string, bio: string, website: string): string {
  // ❌ No escape on name or bio - XSS vulnerability
  // ❌ No URL validation on website - XSS via javascript: URI
  return `
    <div>
      <h1>${name}</h1>
      <p>${bio}</p>
      <a href="${website}">Website</a>
    </div>
  `;
}

// Mock database function
async function saveToDatabase(data: any): Promise<void> {
  // Simulated database save
}
