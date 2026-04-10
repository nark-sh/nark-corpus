/**
 * jsonwebtoken Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "jsonwebtoken"):
 *   - jwt.verify()  postcondition: verify-token-expired
 *   - jwt.sign()    postcondition: sign-invalid-payload
 *   - jwt.decode()  postcondition: decode-used-for-authentication, decode-null-return-not-checked
 *
 * Detection path: jwt.verify/jwt.sign →
 *   ThrowingFunctionDetector fires direct call →
 *   ContractMatcher checks try-catch → postcondition fires
 *
 * jwt.decode() detection: different pattern — not error handling, but
 * security anti-pattern (return value used for auth decisions without verify())
 */

import jwt from 'jsonwebtoken';

const SECRET = 'my-secret-key';

// ─────────────────────────────────────────────────────────────────────────────
// 1. jwt.verify() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function verifyNoCatch(token: string) {
  // SHOULD_FIRE: verify-token-expired — jwt.verify() throws on expired/invalid token. No try-catch.
  return jwt.verify(token, SECRET);
}

export function verifyWithCatch(token: string) {
  try {
    // SHOULD_NOT_FIRE: jwt.verify() inside try-catch satisfies error handling
    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error('Token verification failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. jwt.sign() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function signNoCatch(payload: object) {
  // SHOULD_FIRE: sign-invalid-payload — jwt.sign() throws on invalid payload. No try-catch.
  return jwt.sign(payload, SECRET);
}

export function signWithCatch(payload: object) {
  try {
    // SHOULD_NOT_FIRE: jwt.sign() inside try-catch satisfies error handling
    return jwt.sign(payload, SECRET);
  } catch (err) {
    console.error('Token signing failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. jwt.decode() — used for authentication (SECURITY VIOLATION)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: decode-used-for-authentication
export function decodeUsedForAuth(token: string): boolean {
  // SHOULD_FIRE: decode-used-for-authentication — jwt.decode() does NOT verify signature. Attacker can forge payload (isAdmin: true).
  const decoded = jwt.decode(token) as any;
  return decoded?.isAdmin === true;  // SECURITY BUG: forged token grants admin access
}

// @expect-violation: decode-used-for-authentication
export function decodeForUserIdExtraction(token: string): string {
  // SHOULD_FIRE: decode-used-for-authentication — using decoded userId for data access decisions without verification.
  const decoded = jwt.decode(token) as any;
  return decoded?.sub;  // SECURITY BUG: decoded.sub from unverified token
}

// @expect-violation: decode-used-for-authentication
export function decodeWithoutNullCheck(token: string): string {
  // SHOULD_FIRE: decode-used-for-authentication — jwt.decode() does NOT verify signature; attacker can forge .sub claim
  const decoded = jwt.decode(token) as any;
  return decoded.sub;  // BUG: unverified token used for user identity lookup; also risks TypeError if null
}

// @expect-clean
export function decodeForKeySelection(token: string, keys: Record<string, string>): boolean {
  // SHOULD_NOT_FIRE: decode() used ONLY to select the right key (kid), then verify() is called.
  // This is a legitimate use case — checking the header to pick from JWKS.
  const header = (jwt.decode(token, { complete: true }) as any)?.header;
  const key = keys[header?.kid];
  if (!key) return false;
  try {
    jwt.verify(token, key, { algorithms: ['RS256'] });
    return true;
  } catch {
    return false;
  }
}

// @expect-clean
export function decodeAfterVerify(token: string): any {
  // SHOULD_NOT_FIRE: verify() is called first, then decode() is used for metadata extraction only.
  // (In practice you'd use the verified payload from verify(), but this pattern is safe.)
  try {
    jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    const decoded = jwt.decode(token);
    if (!decoded) return null;  // null check present
    return decoded;
  } catch {
    return null;
  }
}
