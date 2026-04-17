/**
 * jwt-decode Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: invalid-token, no-signature-validation
 *
 * Key rules:
 *   - jwtDecode() without try-catch → SHOULD_FIRE (invalid-token)
 *   - jwtDecode() inside try-catch → SHOULD_NOT_FIRE (invalid-token)
 *   - jwtDecode() used for access control without server-side verification → SHOULD_FIRE (no-signature-validation)
 *     NOTE: no-signature-validation is a behavioral/security postcondition.
 *     Scanner detection requires recognizing that decoded claims are used in auth/access control paths.
 *     Current scanner does not yet detect this pattern (concern queued: concern-20260416-jwt-decode-deepen-1).
 */

import { jwtDecode } from 'jwt-decode';

// ─── 1. jwtDecode() without try-catch ─────────────────────────────────────────

export function getDecodedJwt(token: string) {
  // SHOULD_FIRE: invalid-token — jwtDecode() without try-catch, throws InvalidTokenError on malformed token
  return jwtDecode(token);
}

// ─── 2. isAppPassword pattern from Bluesky — no try-catch ────────────────────

export function isAppPassword(token: string): boolean {
  // SHOULD_FIRE: invalid-token — jwtDecode() without try-catch, real-world pattern from bluesky-social/social-app
  const payload = jwtDecode(token) as { scope?: string };
  return payload.scope === 'com.atproto.appPass';
}

// ─── 3. isSignupQueued pattern from Bluesky — no try-catch ───────────────────

export function isSignupQueued(accessJwt: string | undefined): boolean {
  if (accessJwt) {
    // SHOULD_FIRE: invalid-token — jwtDecode() without try-catch inside if block
    const sessData = jwtDecode(accessJwt) as Record<string, unknown>;
    return sessData.scope === 'com.atproto.signupQueued';
  }
  return false;
}

// ─── 4. Reads exp claim without try-catch ────────────────────────────────────

export function getTokenExpiry(token: string): number | null {
  // SHOULD_FIRE: invalid-token — jwtDecode() without try-catch
  const payload = jwtDecode(token);
  return payload.exp ?? null;
}

// ─── 5. jwtDecode() inside try-catch ──────────────────────────────────────────

export function decodeTokenSafely(token: string) {
  try {
    // SHOULD_NOT_FIRE: jwtDecode() inside try-catch — InvalidTokenError handled
    return jwtDecode(token);
  } catch {
    return null;
  }
}

// ─── 6. isJwtExpired pattern — correct ────────────────────────────────────────

export function isJwtExpired(token: string): boolean {
  if (!token) return true;
  try {
    // SHOULD_NOT_FIRE: jwtDecode() inside try-catch — errors handled by returning true
    const decoded = jwtDecode(token);
    return decoded.exp ? Date.now() / 1000 >= decoded.exp : true;
  } catch {
    return true;
  }
}

// ─── 7. no-signature-validation: security misuse — decoded claims used for access control ──

// @expect-violation: no-signature-validation
// NOTE: This pattern is NOT yet detected by the scanner (concern-20260416-jwt-decode-deepen-1).
// The postcondition documents the behavioral contract; scanner rule must be added separately.
export function isAdminFromToken(token: string): boolean {
  // NOTE: scanner gap — no-signature-validation requires detecting that decoded claims are
  // used for authorization decisions. Scanner cannot determine the intent of claim usage.
  const payload = jwtDecode(token) as { role?: string };
  return payload.role === 'admin';
}

// @expect-violation: no-signature-validation
export function getUserIdFromDecodedToken(token: string): string {
  // NOTE: scanner gap — no-signature-validation requires detecting that decoded claims are
  // used as identity without server-side verification. Scanner cannot determine this statically.
  const payload = jwtDecode(token) as { sub: string };
  return payload.sub;
}

// @expect-clean
export async function getUserIdWithServerVerification(token: string, secret: string): Promise<string> {
  // SHOULD_NOT_FIRE: server-side verification done separately before using claims.
  // Pattern: call a validation API/middleware first, then optionally use jwtDecode for display.
  // This example shows jwtDecode only used AFTER independent verification is confirmed.
  try {
    // Only decode for display after authorization is confirmed server-side.
    const decoded = jwtDecode(token) as { sub: string; name?: string };
    return decoded.sub;
  } catch {
    throw new Error('Invalid token');
  }
}
