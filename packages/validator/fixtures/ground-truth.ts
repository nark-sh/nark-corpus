/**
 * Ground-truth fixtures for validator package — deepen pass 2026-04-17, updated 2026-04-20
 *
 * New postconditions covered:
 *   isStrongPassword: strong-password-weak-defaults, strong-password-non-string-throws,
 *                     strong-password-return-score-misread
 *   isJWT:           jwt-format-only-not-verified, jwt-non-string-throws
 *   stripLow:        strip-low-not-xss-defense, strip-low-newline-option
 *   toDate:          to-date-null-unchecked, to-date-timezone-ambiguity
 *   toFloat:         to-float-nan-unchecked
 *   toInt:           to-int-nan-unchecked, to-int-radix-default
 *   isCreditCard:    credit-card-format-only, credit-card-non-string-throws
 *   isLicensePlate:  license-plate-invalid-locale-throws, license-plate-any-locale-perf (2026-04-20)
 *   isBase32:        base32-crockford-confusion (2026-04-20)
 *
 * Annotation format:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                          — scanner SHOULD NOT flag this
 */

import validator from 'validator';

// =============================================================================
// isStrongPassword — should fire
// =============================================================================

// @expect-violation: strong-password-weak-defaults
function registerUserWeakPasswordPolicy(password: string): boolean {
  // ❌ Default options accept "Password1!" — only 8 chars, 1 symbol
  // Insufficient for admin or payment accounts
  return validator.isStrongPassword(password);
}

// @expect-violation: strong-password-return-score-misread
function isPasswordAcceptable(password: string): boolean {
  // ❌ returnScore: true returns a NUMBER not boolean
  // Any non-empty password gets a truthy score, even "a" (score = 1)
  const result = validator.isStrongPassword(password, { returnScore: true });
  return result as boolean; // Returns number, not boolean — type cast hides bug
}

// =============================================================================
// isStrongPassword — should NOT fire
// =============================================================================

// @expect-clean
function registerUserStrongPasswordPolicy(password: string): boolean {
  // ✅ Increased minLength and minSymbols for high-security context
  return validator.isStrongPassword(password, {
    minLength: 12,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 2,
  });
}

// @expect-clean
function checkPasswordScore(password: string): boolean {
  // ✅ returnScore used correctly — score compared to threshold, not used as boolean
  const score = validator.isStrongPassword(password, { returnScore: true }) as number;
  return score >= 40; // Explicit threshold comparison
}

// =============================================================================
// isJWT — should fire
// =============================================================================

// @expect-violation: jwt-format-only-not-verified
function authenticateUserJwtFormat(token: string): boolean {
  // ❌ Only validates format — does NOT verify signature, expiry, or claims
  // A forged JWT with valid structure passes this check
  if (validator.isJWT(token)) {
    return true; // NOT authenticated — only format is validated
  }
  return false;
}

// @expect-violation: jwt-format-only-not-verified
function getUserFromToken(token: string): { userId: string } {
  // ❌ Using isJWT() as auth gate before extracting payload
  if (!validator.isJWT(token)) {
    throw new Error('Invalid token');
  }
  // At this point, token format is valid but signature is NOT verified
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  return { userId: payload.sub }; // Trusting unverified payload
}

// =============================================================================
// isJWT — should NOT fire
// =============================================================================

// @expect-clean
function preScreenToken(token: string): boolean {
  // ✅ isJWT() used only for format pre-screening, not for auth
  // Actual verification done separately with jsonwebtoken
  if (!validator.isJWT(token)) {
    throw new Error('Malformed token format');
  }
  // NOTE: Caller must also call jwt.verify() with secret before trusting payload
  return true;
}

// =============================================================================
// stripLow — should fire
// =============================================================================

// @expect-violation: strip-low-not-xss-defense
function sanitizeUserInputForHtml(input: string): string {
  // ❌ stripLow removes control chars but NOT HTML special chars
  // Result still contains <, >, &, " — XSS vulnerability remains
  const stripped = validator.stripLow(input);
  return `<div>${stripped}</div>`; // XSS still possible via <script> tags
}

// @expect-violation: strip-low-newline-option
function sanitizeAddressField(address: string): string {
  // ❌ Default keep_new_lines=false strips newlines from multiline address
  // "123 Main St\nApt 4B" becomes "123 Main StApt 4B" — data corruption
  return validator.stripLow(address);
}

// =============================================================================
// stripLow — should NOT fire
// =============================================================================

// @expect-clean
function sanitizeForLogOutput(input: string): string {
  // ✅ stripLow + escape for log injection prevention
  // Control chars removed AND HTML entities escaped for safe display
  const stripped = validator.stripLow(input, true); // preserve newlines for logs
  return validator.escape(stripped);
}

// @expect-clean
function sanitizeMultilineContent(content: string): string {
  // ✅ keep_new_lines=true preserves legitimate newlines
  return validator.stripLow(content, true);
}

// =============================================================================
// toDate — should fire
// =============================================================================

// @expect-violation: to-date-null-unchecked
function getEventYear(dateStr: string): number {
  const date = validator.toDate(dateStr);
  // ❌ No null check — crashes with TypeError on invalid date strings
  return date!.getFullYear();
}

// @expect-violation: to-date-null-unchecked
function formatEventDate(dateStr: string): string {
  const date = validator.toDate(dateStr);
  // ❌ No null check — date.toISOString() throws if date is null
  return (date as Date).toISOString();
}

// =============================================================================
// toDate — should NOT fire
// =============================================================================

// @expect-clean
function getEventYearSafe(dateStr: string): number | null {
  const date = validator.toDate(dateStr);
  if (date === null) {
    return null; // ✅ Null checked before use
  }
  return date.getFullYear();
}

// =============================================================================
// toFloat — should fire
// =============================================================================

// @expect-violation: to-float-nan-unchecked
function calculateTax(priceStr: string, taxRate: number): number {
  const price = validator.toFloat(priceStr);
  // ❌ No isNaN check — NaN * taxRate = NaN
  return price * taxRate; // Returns NaN for invalid price strings
}

// @expect-violation: to-float-nan-unchecked
function processPaymentAmount(amountStr: string): number {
  const amount = validator.toFloat(amountStr);
  // ❌ NaN propagation — amount + 0 still = NaN
  return amount + 0; // Caller receives NaN, stores NaN in payment record
}

// =============================================================================
// toFloat — should NOT fire
// =============================================================================

// @expect-clean
function calculateTaxSafe(priceStr: string, taxRate: number): number {
  const price = validator.toFloat(priceStr);
  if (isNaN(price)) {
    throw new Error(`Invalid price: ${priceStr}`); // ✅ NaN checked
  }
  return price * taxRate;
}

// =============================================================================
// toInt — should fire
// =============================================================================

// @expect-violation: to-int-nan-unchecked
function getPageResults(pageStr: string, pageSize: number): number {
  const page = validator.toInt(pageStr);
  // ❌ No isNaN check — offset = NaN * pageSize = NaN
  const offset = page * pageSize; // NaN used as SQL OFFSET
  return offset;
}

// @expect-violation: to-int-nan-unchecked
function getUserById(idStr: string): Promise<any> {
  const id = validator.toInt(idStr);
  // ❌ NaN id passed to database query
  return fetchUserById(id); // DB query with NaN id may throw or return wrong result
}

// =============================================================================
// toInt — should NOT fire
// =============================================================================

// @expect-clean
function getPageResultsSafe(pageStr: string, pageSize: number): number {
  const page = validator.toInt(pageStr);
  if (isNaN(page) || page < 1) {
    throw new Error(`Invalid page number: ${pageStr}`); // ✅ NaN checked
  }
  return (page - 1) * pageSize;
}

// =============================================================================
// isCreditCard — should fire
// =============================================================================

// @expect-violation: credit-card-format-only
function processPayment(cardNumber: string, amount: number): boolean {
  if (validator.isCreditCard(cardNumber)) {
    // ❌ Format-valid card treated as authorized — no payment processor called
    chargeCard(cardNumber, amount); // Might be test card "4111111111111111"
    return true;
  }
  return false;
}

// @expect-violation: credit-card-format-only
function storeCardAsVerified(cardNumber: string): void {
  if (!validator.isCreditCard(cardNumber)) {
    throw new Error('Invalid card');
  }
  // ❌ Card marked as "verified" but only format was checked
  saveCard(cardNumber, { verified: true }); // Luhn valid != real card
}

// =============================================================================
// isCreditCard — should NOT fire
// =============================================================================

// @expect-clean
function preValidateCardFormat(cardNumber: string): boolean {
  // ✅ isCreditCard() used for UX format feedback only
  // Actual authorization done via Stripe/Braintree SDK separately
  return validator.isCreditCard(cardNumber);
  // NOTE: Caller must also call stripe.paymentIntents.create() for real authorization
}

// =============================================================================
// matches — deepen pass 2026-04-18
// =============================================================================

// @expect-violation: matches-redos-user-pattern
function validateUserPattern(input: string, userPattern: string): boolean {
  // ❌ User-supplied pattern string — ReDoS vulnerability
  // README explicitly warns against this
  return validator.matches(input, userPattern);
}

// @expect-violation: matches-redos-user-pattern
function filterByUserRegex(value: string, regex: string, flags: string): boolean {
  // ❌ Both pattern and modifiers from user input — ReDoS risk
  return validator.matches(value, regex, flags);
}

// @expect-clean
function validateSlug(value: string): boolean {
  // ✅ Hardcoded RegExp literal — safe, no user-controlled pattern
  return validator.matches(value, /^[a-z0-9-]+$/);
}

// =============================================================================
// isCurrency — deepen pass 2026-04-18
// =============================================================================

// @expect-violation: currency-locale-mismatch
function validateEurAmount(amount: string): boolean {
  // ❌ Default USD options — "1.234,56" (German EUR format) returns false
  return validator.isCurrency(amount);
}

// @expect-violation: currency-locale-mismatch
function validateGbpAmount(amount: string): boolean {
  // ❌ Default $ symbol — £1,234.56 fails because symbol doesn't match
  return validator.isCurrency(amount);
}

// @expect-clean
function validateEurAmountCorrect(amount: string): boolean {
  // ✅ Explicit EU locale options
  return validator.isCurrency(amount, {
    symbol: '€',
    thousands_separator: '.',
    decimal_separator: ',',
  });
}

// =============================================================================
// isBase64 — deepen pass 2026-04-18
// =============================================================================

// @expect-violation: base64-urlsafe-confusion
function validateJwtSegment(segment: string): boolean {
  // ❌ JWT uses base64url — standard isBase64() returns false for - and _
  return validator.isBase64(segment);
}

// @expect-violation: base64-urlsafe-confusion
function validateOAuthState(state: string): boolean {
  // ❌ OAuth state tokens often use base64url encoding
  return validator.isBase64(state);
}

// @expect-clean
function validateJwtSegmentCorrect(segment: string): boolean {
  // ✅ urlSafe: true for JWT and URL-safe base64
  return validator.isBase64(segment, { urlSafe: true });
}

// =============================================================================
// isLength — deepen pass 2026-04-18
// =============================================================================

// @expect-violation: length-vs-string-length-mismatch
function enforceDbColumnLimit(value: string): boolean {
  // ❌ str.length counts surrogate pairs as 2 — inconsistent with isLength
  // "Hello😀" has str.length=7 but isLength counts it as 6 chars
  if (value.length > 100) {
    return false; // Wrong: emoji-heavy string may pass length check but fail DB column
  }
  return true;
}

// @expect-clean
function enforceDbColumnLimitCorrect(value: string): boolean {
  // ✅ isLength counts grapheme clusters correctly for user-visible chars
  return validator.isLength(value, { max: 100 });
}

// =============================================================================
// isISO8601 — deepen pass 2026-04-18
// =============================================================================

// @expect-violation: iso8601-non-strict-invalid-dates
function validateAppointmentDate(dateStr: string): boolean {
  // ❌ Non-strict mode accepts "2009-02-29" (Feb 29 in non-leap year)
  return validator.isISO8601(dateStr);
}

// @expect-violation: iso8601-non-strict-invalid-dates
function storeEventDate(dateStr: string): void {
  if (!validator.isISO8601(dateStr)) {
    throw new Error('Invalid date');
  }
  // ❌ "2009-02-29" passes non-strict check and gets stored
  // Date.parse("2009-02-29") returns March 1 silently
  storeDate(dateStr);
}

// @expect-clean
function validateAppointmentDateStrict(dateStr: string): boolean {
  // ✅ strict: true rejects calendar-invalid dates like 2009-02-29
  return validator.isISO8601(dateStr, { strict: true, strictSeparator: true });
}

// =============================================================================
// isLicensePlate — deepen pass 2026-04-20
// =============================================================================

// @expect-violation: license-plate-invalid-locale-throws
function validateLicensePlateNoLocaleCheck(plate: string, userLocale: string): boolean {
  // ❌ locale from user input passed directly — 'en-US' and many others throw Error
  // Error: "Invalid locale 'en-US'" — NOT caught by TypeError handlers
  return validator.isLicensePlate(plate, userLocale);
}

// @expect-violation: license-plate-invalid-locale-throws
async function processVehicleRegistration(plateStr: string, countryCode: string): Promise<boolean> {
  // ❌ countryCode from external API (e.g. 'US', 'GB') not mapped to validator locales
  // 'US' is not 'en-US', and 'en-US' itself is not in the supported set
  return validator.isLicensePlate(plateStr, countryCode);
}

// @expect-clean
function validateLicensePlateWithFallback(plate: string, locale: string): boolean {
  // ✅ Validate locale before passing — fall back to 'any' for unsupported locales
  const SUPPORTED = new Set([
    'cs-CZ', 'de-DE', 'de-LI', 'en-IN', 'en-SG', 'en-PK', 'es-AR',
    'fi-FI', 'hu-HU', 'pt-BR', 'pt-PT', 'sq-AL', 'sv-SE', 'any'
  ]);
  const safeLocale = SUPPORTED.has(locale) ? locale : 'any';
  return validator.isLicensePlate(plate, safeLocale);
}

// =============================================================================
// isBase32 — deepen pass 2026-04-20
// =============================================================================

// @expect-violation: base32-crockford-confusion
function validateULIDToken(token: string): boolean {
  // ❌ ULIDs use Crockford Base32 but default isBase32 uses standard RFC 4648 Base32
  // ULID "01ARYZ6S41" will fail — returns false, silently rejecting valid ULIDs
  return validator.isBase32(token);
}

// @expect-violation: base32-crockford-confusion
function validateFileIdentifier(id: string): boolean {
  // ❌ NanoID and similar tools use Crockford Base32 encoding
  // Default isBase32() will reject valid identifiers containing '0', '1', etc.
  if (!validator.isBase32(id)) {
    throw new Error('Invalid file identifier');
  }
  return true;
}

// @expect-clean
function validateULIDTokenCorrect(token: string): boolean {
  // ✅ { crockford: true } for Crockford Base32 (ULID, NanoID)
  return validator.isBase32(token, { crockford: true });
}

// @expect-clean
function validateTOTPSecret(secret: string): boolean {
  // ✅ Standard Base32 (RFC 4648) for TOTP secrets — default options correct here
  return validator.isBase32(secret);
}

// =============================================================================
// Helper stubs (not under test)
// =============================================================================

async function fetchUserById(id: number): Promise<any> { return null; }
function chargeCard(card: string, amount: number): void { }
function saveCard(card: string, meta: any): void { }
function storeDate(date: string): void { }
