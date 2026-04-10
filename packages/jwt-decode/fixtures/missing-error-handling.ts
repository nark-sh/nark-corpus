/**
 * Demonstrates MISSING error handling for jwt-decode.
 * Should trigger ERROR violations.
 */
import { jwtDecode } from 'jwt-decode';

/**
 * ❌ Missing try-catch — jwtDecode throws InvalidTokenError on malformed token.
 * Directly returns the decoded token without protection.
 */
function getDecodedJwt(token: string): Record<string, unknown> {
  return jwtDecode(token) as Record<string, unknown>;
}

/**
 * ❌ Missing try-catch — isAppPassword pattern from Bluesky.
 * If session token is malformed, this crashes.
 */
function isAppPassword(token: string): boolean {
  const payload = jwtDecode(token) as { scope?: string };
  return payload.scope === 'com.atproto.appPass';
}

/**
 * ❌ Missing try-catch — reads exp claim without protection.
 */
function getTokenExpiration(token: string): number | null {
  const payload = jwtDecode(token);
  return payload.exp ?? null;
}

/**
 * ❌ isSignupQueued pattern from Bluesky — no try-catch.
 */
function isSignupQueued(accessJwt: string | undefined): boolean {
  if (accessJwt) {
    const sessData = jwtDecode(accessJwt) as Record<string, unknown>;
    return sessData.scope === 'com.atproto.signupQueued';
  }
  return false;
}

export { getDecodedJwt, isAppPassword, getTokenExpiration, isSignupQueued };
