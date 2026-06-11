/**
 * Ground-truth fixtures for validator package — deepen pass 2026-04-17, updated 2026-06-11
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
 *   isMobilePhone:   mobile-phone-invalid-locale-throws (2026-04-20, stream-1 pass 4)
 *   isPostalCode:    postal-code-invalid-locale-throws (2026-04-20, stream-1 pass 4)
 *   isTaxID:         tax-id-invalid-locale-throws (2026-04-20, stream-1 pass 4)
 *   isVAT:           vat-invalid-country-code-throws (2026-04-20, stream-1 pass 4)
 *   isIdentityCard:  identity-card-invalid-locale-throws (2026-04-20, stream-1 pass 4)
 *   unescape:        unescape-xss-reintroduction (2026-04-20, stream-1 pass 4)
 *   blacklist:       blacklist-regex-injection (2026-04-20, stream-1 pass 4)
 *   whitelist:       whitelist-regex-injection (2026-04-20, stream-1 pass 4)
 *   toBoolean:       to-boolean-loose-mode-truthy-surprise (2026-04-20, stream-1 pass 4)
 *   trim:            trim-non-string-throws (2026-04-20, stream-1 pass 4)
 *   isByteLength:    isbytelength-byte-vs-char-confusion, isbytelength-non-string-throws (2026-04-20, stream-2 pass 5)
 *   isWhitelisted:   iswhitelisted-null-chars-throws, iswhitelisted-unchecked-return (2026-04-20, stream-2 pass 5)
 *   isAlpha:         alpha-invalid-locale-throws, alpha-ignore-type-throws (2026-04-20, stream-1 pass 7)
 *   isAlphanumeric:  alphanumeric-invalid-locale-throws, alphanumeric-ignore-type-throws (2026-04-20, stream-1 pass 7)
 *   isDecimal:       decimal-invalid-locale-throws, decimal-force-decimal-not-set (2026-04-20, stream-1 pass 7)
 *   isDate:          isdate-non-strict-accepts-date-objects, isdate-strict-format-mismatch (2026-04-20, stream-1 pass 7)
 *   isIBAN:          iban-format-only-not-account-verified, iban-whitespace-stripping-silent (2026-04-20, stream-1 pass 7)
 *   isEmpty:         isempty-whitespace-not-empty-by-default (2026-06-11, stream-1 pass 3)
 *   isFloat:         isfloat-invalid-locale-silent-false, isfloat-locale-comma-replace-asymmetry (2026-06-11, stream-1 pass 3)
 *   isHash:          ishash-unknown-algorithm-silent-false (2026-06-11, stream-1 pass 3)
 *   isIn:            isin-undefined-values-silent-false (2026-06-11, stream-1 pass 3)
 *   isBoolean:       isboolean-strict-accepts-zero-one (2026-06-11, stream-1 pass 3)
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
// isMobilePhone — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: mobile-phone-invalid-locale-throws
function validateMobileFromAcceptLanguage(phone: string, acceptLang: string): boolean {
  // ❌ Accept-Language header value used directly as locale — 'en', 'fr-FR;q=0.9' throw Error
  // Error("Invalid locale 'en'") — not caught by TypeError handlers
  return validator.isMobilePhone(phone, acceptLang as any);
}

// @expect-violation: mobile-phone-invalid-locale-throws
function validatePhoneForCountry(phone: string, countryIsoCode: string): boolean {
  // ❌ ISO 3166-1 alpha-2 code ('US', 'GB') not valid — needs full locale ('en-US', 'en-GB')
  return validator.isMobilePhone(phone, countryIsoCode as any);
}

// @expect-clean
function validateMobilePhoneSafe(phone: string, locale: string): boolean {
  // ✅ Fallback to 'any' when locale not validated
  const availableLocales: string[] = (validator.isMobilePhone as any).locales || [];
  const safeLocale = availableLocales.includes(locale) ? locale : 'any';
  return validator.isMobilePhone(phone, safeLocale as any);
}

// =============================================================================
// isPostalCode — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: postal-code-invalid-locale-throws
function validatePostalCodeFromForm(code: string, countryAlpha3: string): boolean {
  // ❌ ISO alpha-3 codes ('USA', 'GBR') not valid — isPostalCode uses alpha-2 ('US', 'GB')
  // Error("Invalid locale 'USA'") — plain Error, not TypeError
  return validator.isPostalCode(code, countryAlpha3 as any);
}

// @expect-violation: postal-code-invalid-locale-throws
function validatePostalCodeUnsafe(code: string, locale: string): boolean {
  // ❌ locale from external config — if unsupported locale added, throws in production
  return validator.isPostalCode(code, locale as any);
}

// @expect-clean
function validatePostalCodeSafe(code: string): boolean {
  // ✅ Use 'any' to accept any recognized postal code format
  return validator.isPostalCode(code, 'any');
}

// =============================================================================
// isTaxID — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: tax-id-invalid-locale-throws
function validateTaxIdFromUserCountry(taxId: string, countryCode: string): boolean {
  // ❌ Short country code 'US' passed instead of full locale 'en-US' — throws Error
  // isTaxID('123-45-6789', 'US') → Error("Invalid locale 'US'")
  return validator.isTaxID(taxId, countryCode as any);
}

// @expect-violation: tax-id-invalid-locale-throws
function validateEuTaxId(taxId: string, locale: string): boolean {
  // ❌ locale from i18n config that uses different naming (e.g., 'de' instead of 'de-DE')
  return validator.isTaxID(taxId, locale as any);
}

// @expect-clean
function validateTaxIdWithFallback(taxId: string, locale: string): boolean {
  // ✅ try-catch to handle unsupported locale gracefully
  try {
    return validator.isTaxID(taxId, locale as any);
  } catch (e: any) {
    if (e.message && e.message.startsWith('Invalid locale')) {
      return false; // unsupported locale, treat as invalid
    }
    throw e;
  }
}

// =============================================================================
// isVAT — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: vat-invalid-country-code-throws
function validateVatNumberFromForm(vatNumber: string, countryAlpha3: string): boolean {
  // ❌ 3-letter country code ('DEU', 'GBR') — isVAT expects 2-letter ('DE', 'GB')
  // Error("Invalid country code: 'DEU'") — different message format from locale errors!
  return validator.isVAT(vatNumber, countryAlpha3 as any);
}

// @expect-violation: vat-invalid-country-code-throws
function validateVatLowercase(vatNumber: string, cc: string): boolean {
  // ❌ lowercase country code ('gb', 'de') — isVAT requires uppercase
  return validator.isVAT(vatNumber, cc as any);
}

// @expect-clean
function validateVatNumberSafe(vatNumber: string, countryCode: string): boolean {
  // ✅ normalize to uppercase and validate before calling
  const cc = countryCode.toUpperCase();
  const SUPPORTED = new Set(['AL','AT','BE','BG','CH','CY','CZ','DE','DK','EE',
    'EL','ES','EU','FI','FR','GB','HR','HU','IE','IT','LT','LU','LV','MT',
    'NL','NO','PL','PT','RO','SE','SI','SK']);
  if (!SUPPORTED.has(cc)) return false;
  return validator.isVAT(vatNumber, cc as any);
}

// =============================================================================
// isIdentityCard — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: identity-card-invalid-locale-throws
function validateIdCardFromUserCountry(idNumber: string, locale: string): boolean {
  // ❌ locale from country dropdown — user may select unsupported country
  // Error("Invalid locale '<locale>'") — plain Error, not TypeError
  return validator.isIdentityCard(idNumber, locale as any);
}

// @expect-clean
function validateIdCardSafe(idNumber: string, locale: string): boolean {
  // ✅ Fall back to 'any' for unsupported locales
  return validator.isIdentityCard(idNumber, (locale || 'any') as any);
}

// =============================================================================
// unescape — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: unescape-xss-reintroduction
function renderUserComment(escapedContent: string): string {
  // ❌ Unescaping HTML-encoded content before rendering in HTML — reintroduces XSS!
  const rawContent = validator.unescape(escapedContent);
  return `<div class="comment">${rawContent}</div>`; // XSS via <script> in rawContent
}

// @expect-violation: unescape-xss-reintroduction
function displayProductDescription(encodedDesc: string): string {
  // ❌ "Cleaning up" encoded description before putting in template
  const unescaped = validator.unescape(encodedDesc);
  return `<p>${unescaped}</p>`; // Direct HTML injection
}

// @expect-clean
function renderUserCommentSafe(rawContent: string): string {
  // ✅ Store raw, escape at render time — no unescape needed
  return `<div class="comment">${validator.escape(rawContent)}</div>`;
}

// @expect-clean
function logUserInput(escapedContent: string): void {
  // ✅ unescape for non-HTML output (logging to console) — safe context
  const rawContent = validator.unescape(escapedContent);
  console.log('User input:', rawContent); // Plaintext log — not HTML
}

// =============================================================================
// blacklist — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: blacklist-regex-injection
function sanitizeInputWithUserChars(input: string, charsToRemove: string): string {
  // ❌ charsToRemove from user input — regex injection if it contains ], -, ^, \
  // 'a-z' in charsToRemove becomes range [a-z] not literal characters a, -, z
  return validator.blacklist(input, charsToRemove);
}

// @expect-violation: blacklist-regex-injection
function removeCharsFromConfig(input: string, configChars: string): string {
  // ❌ chars from external config file — if config contains regex metacharacters, breaks
  return validator.blacklist(input, configChars);
}

// @expect-clean
function removeSpecialCharsHardcoded(input: string): string {
  // ✅ Hardcoded chars string — no regex injection risk
  return validator.blacklist(input, '<>"\'/');
}

// =============================================================================
// whitelist — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: whitelist-regex-injection
function filterToAllowedChars(input: string, allowedChars: string): string {
  // ❌ allowedChars from user input — regex injection in [^${chars}]+ pattern
  // '^' in allowedChars inverts the negation; '-' creates character ranges
  return validator.whitelist(input, allowedChars);
}

// @expect-clean
function keepOnlyAlphanumeric(input: string): string {
  // ✅ Hardcoded character set — safe
  return validator.whitelist(input, 'a-zA-Z0-9');
}

// =============================================================================
// toBoolean — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: to-boolean-loose-mode-truthy-surprise
function parseFeatureFlag(flagValue: string): boolean {
  // ❌ Non-strict mode — 'no', 'off', 'disabled' all return TRUE
  // Environment variable FEATURE_X=no → toBoolean('no') = TRUE!
  return validator.toBoolean(flagValue);
}

// @expect-violation: to-boolean-loose-mode-truthy-surprise
function isFeatureEnabled(configValue: string): boolean {
  // ❌ 'disabled', 'null', '0.0', 'NO' all return true in non-strict mode
  const enabled = validator.toBoolean(configValue);
  return enabled; // Always true for 'disabled' — silently enables feature
}

// @expect-clean
function parseFeatureFlagStrict(flagValue: string): boolean {
  // ✅ strict=true: only '1' and 'true' return true — everything else false
  return validator.toBoolean(flagValue, true);
}

// =============================================================================
// trim — deepen pass 2026-04-20 (stream-1 pass 4)
// =============================================================================

// @expect-violation: trim-non-string-throws
function sanitizeOptionalField(value: string | null | undefined): string {
  // ❌ null/undefined input throws TypeError("Expected a string but received a null")
  return validator.trim(value as string);
}

// @expect-violation: trim-non-string-throws
function cleanRequestField(req: { body: { name?: string } }): string {
  // ❌ Optional field may be undefined when not submitted in the form
  return validator.trim(req.body.name as string);
}

// @expect-clean
function sanitizeOptionalFieldSafe(value: string | null | undefined): string {
  // ✅ Guard with nullish coalescing before passing to trim
  return validator.trim(value ?? '');
}

// =============================================================================
// isByteLength — deepen pass 2026-04-20 (stream-2 pass 5)
// =============================================================================

// @expect-violation: isbytelength-byte-vs-char-confusion
function validateDisplayNameForDb(name: string): boolean {
  // ❌ Using isByteLength with a character-count limit (100 chars) as if it were bytes.
  // CJK names: '大切なユーザー' (7 chars) = 21 bytes — will fail {max:100} byte check
  // even though only 7 characters are used. Silently rejects valid international names.
  // Conversely, if the DB column is VARCHAR(100) bytes, isLength() should NOT be used here.
  if (!validator.isByteLength(name, { max: 100 })) {
    throw new Error('Name too long');
  }
  return true;
}

// @expect-violation: isbytelength-non-string-throws
function validateBioField(bio: string | null): boolean {
  // ❌ Optional bio field may be null — throws TypeError before byte count
  return validator.isByteLength(bio as string, { min: 0, max: 255 });
}

// @expect-violation: isbytelength-non-string-throws
function validatePayloadSize(payload: unknown): boolean {
  // ❌ payload from JSON body may not be a string — isByteLength throws immediately
  return validator.isByteLength(payload as string, { max: 1024 });
}

// @expect-clean
function validateRedisKeyByteLength(key: string): boolean {
  // ✅ Redis has a 512MB key limit but common practice is to cap at 1KB.
  // Key bytes (not chars) is the correct measure here — isByteLength is appropriate.
  if (typeof key !== 'string') return false;
  return validator.isByteLength(key, { min: 1, max: 1024 });
}

// @expect-clean
function validateDisplayNameForUiLimit(name: string): boolean {
  // ✅ UI character limit (max 50 visible chars) — isLength is correct here, not isByteLength
  // Comment documents why isLength is used over isByteLength for character-count constraints
  return validator.isLength(name, { min: 1, max: 50 });
}

// =============================================================================
// isWhitelisted — deepen pass 2026-04-20 (stream-2 pass 5)
// =============================================================================

// @expect-violation: iswhitelisted-null-chars-throws
function validateInputAgainstConfig(input: string, config: { allowedChars?: string }): boolean {
  // ❌ config.allowedChars may be undefined — throws TypeError on chars.indexOf()
  // Unlike most is* validators where only the first arg can throw, here the SECOND arg
  // (chars) throws if null/undefined. TypeError: "Cannot read properties of undefined"
  return validator.isWhitelisted(input, config.allowedChars as string);
}

// @expect-violation: iswhitelisted-null-chars-throws
function checkInputCharset(input: string, allowedCharset: string | null): boolean {
  // ❌ allowedCharset null from optional DB column — throws inside isWhitelisted loop
  // assertString(str) passes but chars.indexOf() fails with null
  return validator.isWhitelisted(input, allowedCharset as string);
}

// @expect-violation: iswhitelisted-unchecked-return
function storeTagWithoutValidation(input: string): void {
  // ❌ isWhitelisted returns boolean but result not checked before storing input
  // The ORIGINAL unmodified input is used — validator is bypassed
  validator.isWhitelisted(input, 'abcdefghijklmnopqrstuvwxyz0123456789-');
  storeTagInDb(input); // input unchanged — isWhitelisted is not a sanitizer!
}

// @expect-violation: iswhitelisted-unchecked-return
function processTagInput(tag: string): string {
  // ❌ isWhitelisted is confused with whitelist() (sanitizer).
  // isWhitelisted returns boolean, does NOT return a filtered string.
  const safe = validator.isWhitelisted(tag, 'abcdefghijklmnopqrstuvwxyz');
  return safe as any; // safe is boolean 'true'/'false', not a sanitized string
}

// @expect-clean
function validateTagWithCheck(input: string): void {
  // ✅ Check the return value and reject invalid input
  const allowedChars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
  if (!validator.isWhitelisted(input, allowedChars)) {
    throw new Error('Tag contains invalid characters');
  }
  storeTagInDb(input); // Only reached if all chars are in allowed set
}

// @expect-clean
function validateInputWithFallback(input: string, config: { allowedChars?: string }): boolean {
  // ✅ Default chars if config value is absent — no null/undefined for chars
  const allowed = config.allowedChars ?? 'abcdefghijklmnopqrstuvwxyz0123456789';
  return validator.isWhitelisted(input, allowed);
}

// =============================================================================
// isAlpha — should fire
// =============================================================================

// @expect-violation: alpha-invalid-locale-throws
function validateNameForLocale(name: string, userLocale: string): boolean {
  // ❌ userLocale from user settings passed directly — may be 'zh-CN-Simplified' or 'POSIX'
  // throws Error("Invalid locale '...'") for unrecognized locales
  return validator.isAlpha(name, userLocale as any);
}

// @expect-violation: alpha-ignore-type-throws
function validateNameIgnoringChars(name: string, charsToIgnore: string[]): boolean {
  // ❌ charsToIgnore is an array, not string or RegExp — throws Error
  return validator.isAlpha(name, 'en-US', { ignore: charsToIgnore as any });
}

// =============================================================================
// isAlpha — should NOT fire
// =============================================================================

// @expect-clean
function validateNameSafeLocale(name: string, userLocale: string): boolean {
  // ✅ Pre-validate locale against supported set
  const { isAlpha } = validator;
  const SUPPORTED_LOCALES = new Set(['en-US', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP', 'zh-TW', 'ar']);
  const safeLocale = SUPPORTED_LOCALES.has(userLocale) ? userLocale : 'en-US';
  return validator.isAlpha(name, safeLocale as any);
}

// @expect-clean
function validateNameIgnoringHyphenSpace(name: string): boolean {
  // ✅ ignore is a string — valid
  return validator.isAlpha(name, 'en-US', { ignore: ' -' });
}

// =============================================================================
// isAlphanumeric — should fire
// =============================================================================

// @expect-violation: alphanumeric-invalid-locale-throws
function validateUsernameForLocale(username: string, locale: string): boolean {
  // ❌ locale from Accept-Language header passed without validation
  return validator.isAlphanumeric(username, locale as any);
}

// =============================================================================
// isAlphanumeric — should NOT fire
// =============================================================================

// @expect-clean
function validateUsernameSafe(username: string, locale: string): boolean {
  // ✅ Fallback to en-US for unrecognized locales
  const safeLocale = ['en-US', 'de-DE', 'fr-FR', 'zh-TW'].includes(locale) ? locale : 'en-US';
  return validator.isAlphanumeric(username, safeLocale as any);
}

// =============================================================================
// isDecimal — should fire
// =============================================================================

// @expect-violation: decimal-invalid-locale-throws
function validateDecimalForLocale(price: string, locale: string): boolean {
  // ❌ locale from user profile passed directly — may be unsupported
  return validator.isDecimal(price, { locale: locale as any });
}

// @expect-violation: decimal-force-decimal-not-set
function validatePriceRequiresDecimal(price: string): boolean {
  // ❌ No force_decimal — '100' (integer) passes as valid price
  // Financial form expects '100.00' format but accepts bare '100'
  return validator.isDecimal(price);
}

// =============================================================================
// isDecimal — should NOT fire
// =============================================================================

// @expect-clean
function validatePriceSafe(price: string): boolean {
  // ✅ force_decimal: true requires decimal point, locale validated
  return validator.isDecimal(price, { force_decimal: true, locale: 'en-US' });
}

// =============================================================================
// isDate — should fire
// =============================================================================

// @expect-violation: isdate-non-strict-accepts-date-objects
function validateDateInput(input: any): boolean {
  // ❌ Non-strict mode: if input is a Date object, isDate() returns true
  // but caller may then try to call string methods on it
  if (!validator.isDate(input)) {
    throw new Error('Invalid date');
  }
  // Subsequent string operation will throw if input was a Date object
  const trimmed = (input as string).trim();
  return true;
}

// @expect-violation: isdate-strict-format-mismatch
function validateISODateStrict(dateStr: string): boolean {
  // ❌ Strict mode with default format ('YYYY/MM/DD') — rejects '2024-01-15' (ISO format)
  // Returns false for valid ISO dates because format doesn't match
  return validator.isDate(dateStr, { strictMode: true });
}

// =============================================================================
// isDate — should NOT fire
// =============================================================================

// @expect-clean
function validateISODateCorrect(dateStr: string): boolean {
  // ✅ Strict mode with explicit format matching expected input
  return validator.isDate(dateStr, { strictMode: true, format: 'YYYY-MM-DD' });
}

// =============================================================================
// isIBAN — should fire
// =============================================================================

// @expect-violation: iban-format-only-not-account-verified
async function initiateBankTransfer(iban: string, amount: number): Promise<void> {
  // ❌ isIBAN() used as sole validation before payment — only checks format+checksum,
  // not account existence, activity, or ownership
  if (!validator.isIBAN(iban)) {
    throw new Error('Invalid IBAN');
  }
  // Proceeds directly to transfer without payment provider account verification
  await processTransfer(iban, amount);
}

// @expect-violation: iban-whitespace-stripping-silent
async function storeBankAccount(rawIban: string): Promise<void> {
  // ❌ isIBAN validates space-formatted IBANs silently, stores with inconsistent spacing
  if (!validator.isIBAN(rawIban)) {
    throw new Error('Invalid IBAN');
  }
  // rawIban may contain spaces ('DE89 3704 0044...')  — not normalized before storage
  await saveBankAccountToDb(rawIban);
}

// =============================================================================
// isIBAN — should NOT fire
// =============================================================================

// @expect-clean
async function storeBankAccountNormalized(rawIban: string): Promise<void> {
  // ✅ Validate then normalize before storage
  if (!validator.isIBAN(rawIban)) {
    throw new Error('Invalid IBAN format');
  }
  const normalizedIban = rawIban.replace(/\s+/g, '').toUpperCase();
  await saveBankAccountToDb(normalizedIban);
}

// =============================================================================
// Helper stubs (not under test)
// =============================================================================

async function fetchUserById(id: number): Promise<any> { return null; }
function chargeCard(card: string, amount: number): void { }
function saveCard(card: string, meta: any): void { }
function storeDate(date: string): void { }
function storeTagInDb(tag: string): void { }
async function processTransfer(iban: string, amount: number): Promise<void> { }

// =============================================================================
// isEmpty — should fire (2026-06-11, stream-1 pass 3)
// =============================================================================

// @expect-violation: isempty-whitespace-not-empty-by-default
function validateRequiredFieldDefault(userInput: string): void {
  // ❌ Default ignore_whitespace: false — '  ' is NOT empty and passes through
  if (validator.isEmpty(userInput)) {
    throw new Error('Name is required');
  }
  saveUserName(userInput);  // whitespace-only names saved to DB
}

// =============================================================================
// isEmpty — should NOT fire
// =============================================================================

// @expect-clean
function validateRequiredFieldIgnoreWhitespace(userInput: string): void {
  // ✅ ignore_whitespace: true catches whitespace-only inputs
  if (validator.isEmpty(userInput, { ignore_whitespace: true })) {
    throw new Error('Name is required');
  }
  saveUserName(userInput.trim());
}

// =============================================================================
// isFloat — should fire (2026-06-11, stream-1 pass 3)
// =============================================================================

// @expect-violation: isfloat-invalid-locale-silent-false
function validateEuropeanPriceUnsupportedLocale(priceStr: string): boolean {
  // ❌ 'en-GB' is NOT in isFloatLocales — silently returns false for all input
  return validator.isFloat(priceStr, { locale: 'en-GB' as any });
}

// @expect-violation: isfloat-locale-comma-replace-asymmetry
function validateGermanPriceWithThousandsSep(rawInput: string): boolean {
  // ❌ '1.234,56' (German format) needs thousands sep stripped first
  // Without stripping, regex rejects it silently
  return validator.isFloat(rawInput, { locale: 'de-DE' as any, min: 0 });
}

// =============================================================================
// isFloat — should NOT fire
// =============================================================================

// @expect-clean
function validateFloatWithSafeLocale(priceStr: string, userLocale: string): boolean {
  // ✅ Validate locale is in supported set before use
  const safeLocale = validator.isFloatLocales.includes(userLocale as any) ? userLocale : 'en-US';
  return validator.isFloat(priceStr, { locale: safeLocale as any, min: 0 });
}

// =============================================================================
// isHash — should fire (2026-06-11, stream-1 pass 3)
// =============================================================================

// @expect-violation: ishash-unknown-algorithm-silent-false
function validateHashWithDash(hashValue: string): boolean {
  // ❌ 'sha-256' is not a valid algorithm name — silently returns false for all input
  return validator.isHash(hashValue, 'sha-256' as any);
}

// @expect-violation: ishash-unknown-algorithm-silent-false
function validateHashWrongCase(hashValue: string): boolean {
  // ❌ 'SHA256' (uppercase) is not a valid algorithm name — always returns false
  return validator.isHash(hashValue, 'SHA256' as any);
}

// =============================================================================
// isHash — should NOT fire
// =============================================================================

// @expect-clean
function validateHashExactAlgorithmName(hashValue: string): boolean {
  // ✅ Exact lowercase algorithm name from the supported set
  return validator.isHash(hashValue, 'sha256');
}

// =============================================================================
// isIn — should fire (2026-06-11, stream-1 pass 3)
// =============================================================================

// @expect-violation: isin-undefined-values-silent-false
function checkUserRoleUnsafe(userRole: string, allowedRoles: string[] | undefined): void {
  // ❌ If allowedRoles is undefined, isIn() returns false — all access silently denied
  if (!validator.isIn(userRole, allowedRoles as any)) {
    throw new Error('Access denied');
  }
  grantAccess(userRole);
}

// =============================================================================
// isIn — should NOT fire
// =============================================================================

// @expect-clean
function checkUserRoleSafe(userRole: string, allowedRoles: string[]): void {
  // ✅ Guard against undefined allowlist before calling isIn()
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error('Permission configuration error: no roles defined');
  }
  if (!validator.isIn(userRole, allowedRoles)) {
    throw new Error('Access denied');
  }
  grantAccess(userRole);
}

// =============================================================================
// isBoolean — should fire (2026-06-11, stream-1 pass 3)
// =============================================================================

// @expect-violation: isboolean-strict-accepts-zero-one
function validateConsentCheckboxMismatch(rawValue: string): boolean {
  // ❌ isBoolean() in strict mode accepts '1', but downstream uses === 'true'
  // A user submitting '1' passes validation but gets treated as false (consent not recorded)
  if (!validator.isBoolean(rawValue)) {
    return false;
  }
  return rawValue === 'true';  // '1' passes isBoolean() but returns false here
}

// =============================================================================
// isBoolean — should NOT fire
// =============================================================================

// @expect-clean
function validateConsentCheckboxExplicit(rawValue: string): boolean {
  // ✅ Explicitly check for the expected boolean string format
  if (!['true', 'false'].includes(rawValue)) {
    throw new Error('Consent must be "true" or "false"');
  }
  return rawValue === 'true';
}

// =============================================================================
// Helper stubs for new tests (not under test)
// =============================================================================

function saveUserName(name: string): void { }
function grantAccess(role: string): void { }
async function saveBankAccountToDb(iban: string): Promise<void> { }

// =============================================================================
// isNumeric — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: isnumeric-non-string-typeerror
function validateQuantityUnsafe(qty: string | null): boolean {
  // ❌ qty may be null from optional query param — throws TypeError
  return validator.isNumeric(qty as any);
}

// @expect-violation: isnumeric-invalid-locale-silent-mismatch
function validateAmountWithBadLocale(amount: string): boolean {
  // ❌ 'xx-XX' is not a supported locale — alpha.decimal['xx-XX'] is undefined;
  // regex becomes "[+-]?([0-9]*[undefined]..." which silently matches incorrectly
  return validator.isNumeric(amount, { locale: 'xx-XX' as any });
}

// =============================================================================
// isNumeric — should NOT fire
// =============================================================================

// @expect-clean
function validateQuantitySafe(qty: unknown): boolean {
  // ✅ Guard against non-string before calling isNumeric()
  if (typeof qty !== 'string') return false;
  return validator.isNumeric(qty);
}

// @expect-clean
function validateAmountWithKnownLocale(amount: string): boolean {
  // ✅ Known supported locale from validator's list
  return validator.isNumeric(amount, { locale: 'de-DE' });
}

// =============================================================================
// isInt — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: isint-non-string-typeerror
function validatePageNumberUnsafe(page: number | string): boolean {
  // ❌ page arrives as actual number from JSON body — throws TypeError
  return validator.isInt(page as any, { min: 1, max: 100 });
}

// @expect-violation: isint-range-returns-false-not-throw
function validateAgeUnchecked(rawAge: string): void {
  // ❌ isInt() returns false for out-of-range values but doesn't throw;
  // code doesn't check the return value so invalid ages silently pass
  validator.isInt(rawAge, { min: 0, max: 150 });
  saveAge(rawAge); // proceeds with unvalidated age
}

// =============================================================================
// isInt — should NOT fire
// =============================================================================

// @expect-clean
function validateAgeSafe(rawAge: string): string {
  // ✅ Check return value and reject
  if (!validator.isInt(rawAge, { min: 0, max: 150 })) {
    throw new Error('Age must be an integer between 0 and 150');
  }
  return rawAge;
}

// =============================================================================
// equals — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: equals-non-string-typeerror
function verifyTokenUnsafe(providedToken: string | null, expectedToken: string): boolean {
  // ❌ providedToken may be null when Authorization header is missing — throws TypeError
  return validator.equals(providedToken as any, expectedToken);
}

// =============================================================================
// equals — should NOT fire
// =============================================================================

// @expect-clean
function verifyTokenSafe(providedToken: string | null, expectedToken: string): boolean {
  // ✅ Guard against null before calling equals()
  if (typeof providedToken !== 'string') return false;
  return validator.equals(providedToken, expectedToken);
}

// =============================================================================
// contains — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: contains-non-string-typeerror
function checkProfanityUnsafe(input: string | null): boolean {
  // ❌ input may be null from optional form field — throws TypeError
  return validator.contains(input as any, 'badword');
}

// @expect-violation: contains-unchecked-return-security-bypass
function enforceNoncePresenceUnsafe(payload: string, nonce: string): void {
  // ❌ contains() returns false when nonce is absent — result not checked;
  // missing nonce silently passes the guard
  validator.contains(payload, nonce);
  processPayload(payload);
}

// =============================================================================
// contains — should NOT fire
// =============================================================================

// @expect-clean
function checkProfanitySafe(input: string | null): boolean {
  // ✅ Guard against null, check return value
  if (typeof input !== 'string') return false;
  return validator.contains(input, 'badword');
}

// @expect-clean
function enforceNoncePresenceSafe(payload: string, nonce: string): void {
  // ✅ Check the return value and throw if nonce is absent
  if (!validator.contains(payload, nonce)) {
    throw new Error('Invalid payload: nonce missing');
  }
  processPayload(payload);
}

// =============================================================================
// isAfter — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: isafter-unparseable-date-returns-false
function validateFutureDateUnsafe(userDate: string): boolean {
  // ❌ isAfter() returns false for BOTH "date is in the past" AND "date is invalid";
  // garbage strings like 'not-a-date' silently return false — same as a past date
  return validator.isAfter(userDate);
}

// =============================================================================
// isAfter — should NOT fire
// =============================================================================

// @expect-clean
function validateFutureDateSafe(userDate: string): boolean {
  // ✅ Validate format first, then check range
  if (!validator.isISO8601(userDate)) {
    throw new Error('Invalid date format');
  }
  if (!validator.isAfter(userDate)) {
    throw new Error('Date must be in the future');
  }
  return true;
}

// =============================================================================
// isBefore — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: isbefore-unparseable-date-returns-false
function checkSubscriptionExpiryUnsafe(expiryDate: string): boolean {
  // ❌ isBefore() returns false for BOTH "not expired yet" AND "invalid date string";
  // a corrupt expiry date is treated as "subscription not yet expired" — perpetual access
  return !validator.isBefore(expiryDate);
}

// =============================================================================
// isBefore — should NOT fire
// =============================================================================

// @expect-clean
function checkSubscriptionExpirySafe(expiryDate: string): boolean {
  // ✅ Validate format first to distinguish parse failure from valid not-expired
  if (!validator.isISO8601(expiryDate)) {
    throw new Error('Invalid expiry date format');
  }
  return !validator.isBefore(expiryDate); // true = not yet expired
}

// =============================================================================
// ltrim — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: ltrim-non-string-typeerror
function normalizeUsernameUnsafe(username: string | null): string {
  // ❌ username may be null from optional header — throws TypeError
  return validator.ltrim(username as any);
}

// =============================================================================
// ltrim — should NOT fire
// =============================================================================

// @expect-clean
function normalizeUsernameSafe(username: string | null): string {
  // ✅ Guard against null before calling ltrim()
  if (typeof username !== 'string') return '';
  return validator.ltrim(username);
}

// =============================================================================
// rtrim — should fire (2026-06-11, deepen-stream-2 pass 4)
// =============================================================================

// @expect-violation: rtrim-non-string-typeerror
function sanitizeSearchQueryUnsafe(query: string | undefined): string {
  // ❌ query may be undefined from missing query param — throws TypeError
  return validator.rtrim(query as any);
}

// =============================================================================
// rtrim — should NOT fire
// =============================================================================

// @expect-clean
function sanitizeSearchQuerySafe(query: string | undefined): string {
  // ✅ Guard against undefined before calling rtrim()
  if (typeof query !== 'string') return '';
  return validator.rtrim(query);
}

// =============================================================================
// Additional helper stubs for new tests
// =============================================================================

function saveAge(age: string): void { }
function processPayload(payload: string): void { }
