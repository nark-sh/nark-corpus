/**
 * jwt-decode Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: invalid-token
 *
 * Key rules:
 *   - jwtDecode() without try-catch → SHOULD_FIRE
 *   - jwtDecode() inside try-catch → SHOULD_NOT_FIRE
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
