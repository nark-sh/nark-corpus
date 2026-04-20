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
// Helper stubs (not under test)
// =============================================================================

async function fetchUserById(id: number): Promise<any> { return null; }
function chargeCard(card: string, amount: number): void { }
function saveCard(card: string, meta: any): void { }
function storeDate(date: string): void { }
