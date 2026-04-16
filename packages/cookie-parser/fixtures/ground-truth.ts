/**
 * cookie-parser Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the cookie-parser contract spec, covering helper functions
 * added in the 2026-04-16 depth pass.
 *
 * Key contract rules for helper functions:
 *   - signedCookie() returns false (not throw) for invalid signatures
 *   - signedCookies() mutates the input object — removes signed cookies from it
 *   - JSONCookie() returns undefined (not original string) for non-JSON cookies
 *   - JSONCookies() mutates input object in-place
 *
 * Note: These helper functions are synchronous with return-value behavioral
 * contracts. The scanner concerns queued in this depth pass will add detection
 * rules for the false-return and mutation patterns.
 */

import cookieParser from 'cookie-parser';

const { signedCookie, signedCookies, JSONCookie, JSONCookies } = cookieParser;

// ─────────────────────────────────────────────────────────────────────────────
// 1. signedCookie — tampered cookie returns false, not thrown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @expect-violation: signed-cookie-tampered-false
 * Truthy check conflates false (tampered) with undefined (not signed).
 * This is the dangerous pattern — a tampered cookie passes the if check
 * because the developer expected an exception, not a false return.
 */
function validateSignedCookieTruthyCheck(cookieValue: string) {
  // SHOULD_FIRE: signed-cookie-tampered-false — result is false for tampered cookies,
  // but truthy check lets it pass silently
  const result = signedCookie(cookieValue, 'my-secret');
  if (result) {
    // This branch is reached even when cookie is not tampered — false correctly fails
    // But caller might also use result === false check below — this is the wrong pattern
    return result;
  }
  return null;
}

/**
 * @expect-clean
 * Strict equality check correctly identifies tampered cookies.
 */
function validateSignedCookieStrictCheck(cookieValue: string): string | null {
  // SHOULD_NOT_FIRE: result === false check correctly handles tampered cookies
  const result = signedCookie(cookieValue, 'my-secret');
  if (result === false) {
    throw new Error('Cookie signature invalid — possible tampering detected');
  }
  if (result === undefined) {
    return null; // not a string input
  }
  return result;
}

/**
 * @expect-violation: signed-cookie-non-string-undefined
 * Accessing a cookie that may not exist and passing to signedCookie without a guard.
 */
function validateCookieWithoutExistenceCheck(req: { cookies: Record<string, any> }) {
  // SHOULD_FIRE: signed-cookie-non-string-undefined — req.cookies['session'] may be
  // undefined, signedCookie() returns undefined for non-string input
  const result = signedCookie(req.cookies['session'], 'my-secret');
  return result; // undefined propagated silently if cookie missing
}

/**
 * @expect-clean
 * Check cookie existence before calling signedCookie().
 */
function validateCookieWithExistenceCheck(req: { cookies: Record<string, string> }) {
  // SHOULD_NOT_FIRE: existence check ensures string input
  const cookieVal = req.cookies['session'];
  if (typeof cookieVal !== 'string') {
    return null;
  }
  const result = signedCookie(cookieVal, 'my-secret');
  if (result === false) {
    throw new Error('Cookie tampered');
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. signedCookies — mutates input object
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @expect-violation: signed-cookies-mutates-input
 * Passes req.cookies directly — signed cookies are removed from req.cookies as side effect.
 */
function extractSignedCookiesMutating(req: { cookies: Record<string, string> }) {
  // SHOULD_FIRE: signed-cookies-mutates-input — req.cookies is mutated by signedCookies()
  // Any signed cookies are deleted from req.cookies after this call
  const signed = signedCookies(req.cookies, 'my-secret');
  // req.cookies no longer contains the signed cookies that were moved to `signed`
  return signed;
}

/**
 * @expect-clean
 * Clone input before calling signedCookies() to avoid mutation.
 */
function extractSignedCookiesSafe(req: { cookies: Record<string, string> }) {
  // SHOULD_NOT_FIRE: cloning the input prevents mutation of the original
  const cookiesCopy = { ...req.cookies };
  const signed = signedCookies(cookiesCopy, 'my-secret');
  return signed;
}

/**
 * @expect-violation: signed-cookies-false-on-tamper
 * Iterating returned signed cookies without checking for false values.
 */
function processSignedCookiesWithoutFalseCheck(req: { cookies: Record<string, string> }) {
  // SHOULD_FIRE: signed-cookies-false-on-tamper — result may contain false for tampered cookies
  const signed = signedCookies({ ...req.cookies }, 'my-secret');
  const values: Record<string, string> = {};
  for (const [key, val] of Object.entries(signed)) {
    // Not checking for false — tampered cookies pass through as false (coerced to string)
    values[key] = val as string;
  }
  return values;
}

/**
 * @expect-clean
 * Check each value for false before trusting it.
 */
function processSignedCookiesWithFalseCheck(req: { cookies: Record<string, string> }) {
  // SHOULD_NOT_FIRE: strict false check handles tampered cookies
  const signed = signedCookies({ ...req.cookies }, 'my-secret');
  const values: Record<string, string> = {};
  for (const [key, val] of Object.entries(signed)) {
    if (val === false) {
      throw new Error(`Tampered cookie detected: ${key}`);
    }
    if (val !== undefined) {
      values[key] = val;
    }
  }
  return values;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. JSONCookie — returns undefined, not original string
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @expect-violation: json-cookie-undefined-for-non-json
 * Using JSONCookie as a parse-or-passthrough — but it returns undefined for non-JSON.
 */
function parseOrPassthroughCookie(cookieValue: string): string | object {
  // SHOULD_FIRE: json-cookie-undefined-for-non-json — JSONCookie returns undefined
  // for values not starting with 'j:', caller expects original string as fallback
  const parsed = JSONCookie(cookieValue);
  // parsed is undefined for non-JSON cookies, not cookieValue
  return parsed || cookieValue; // falsy fallback accidentally correct but semantically wrong
}

/**
 * @expect-violation: json-cookie-undefined-for-non-json
 * Directly using JSONCookie result without checking for undefined.
 */
function useJSONCookieDirectly(cookieValue: string): object {
  // SHOULD_FIRE: json-cookie-undefined-for-non-json — result is undefined for non-JSON
  const parsed = JSONCookie(cookieValue);
  return parsed as object; // undefined cast to object — will cause runtime errors downstream
}

/**
 * @expect-clean
 * Check return value before using JSONCookie result.
 */
function useJSONCookieSafely(cookieValue: string): object | null {
  // SHOULD_NOT_FIRE: checks for undefined before using
  const parsed = JSONCookie(cookieValue);
  if (parsed === undefined) {
    return null; // not a JSON cookie
  }
  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. JSONCookies — mutates input in place
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @expect-violation: json-cookies-mutates-input
 * Passing cookies object and expecting the original to remain unchanged.
 */
function processJSONCookiesMutating(cookies: Record<string, string>) {
  // SHOULD_FIRE: json-cookies-mutates-input — JSONCookies mutates input in place
  const original = cookies;
  const processed = JSONCookies(cookies);
  // original and processed are the same object — string values were overwritten
  return { original, processed }; // these are the same reference
}

/**
 * @expect-clean
 * Clone before processing to avoid mutation.
 */
function processJSONCookiesSafe(cookies: Record<string, string>) {
  // SHOULD_NOT_FIRE: clones the input before processing
  const cookiesCopy = { ...cookies };
  const processed = JSONCookies(cookiesCopy);
  return processed;
}
