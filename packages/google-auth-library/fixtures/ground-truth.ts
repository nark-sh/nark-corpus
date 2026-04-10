/**
 * google-auth-library Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the google-auth-library contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - OAuth2Client.getToken() throws GaxiosError on invalid_grant/network failure → MUST try-catch
 *   - OAuth2Client.getTokenInfo() throws Error if token is invalid → MUST try-catch
 *   - A try-catch (any catch block) satisfies the requirement
 *   - A .catch() chain also satisfies the requirement
 *   - try-finally without catch does NOT satisfy the requirement
 */

import { OAuth2Client, GaxiosError } from 'google-auth-library';

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// ─── 1. getToken — bare call, no try-catch ────────────────────────────────────

export async function getTokenNoCatch(code: string) {
  // SHOULD_FIRE: get-token-unprotected — getToken makes OAuth2 network call, no try-catch
  const { tokens } = await client.getToken(code);
  return tokens;
}

// ─── 2. getToken — try-catch present ─────────────────────────────────────────

export async function getTokenWithCatch(code: string) {
  try {
    // SHOULD_NOT_FIRE: getToken is inside try-catch — get-token-unprotected requirement satisfied
    const { tokens } = await client.getToken(code);
    return tokens;
  } catch (error) {
    throw error;
  }
}

// ─── 3. getToken — try-finally without catch ─────────────────────────────────

export async function getTokenTryFinallyNoCatch(code: string) {
  try {
    // SHOULD_FIRE: get-token-unprotected — try-finally has no catch clause
    const { tokens } = await client.getToken(code);
    return tokens;
  } finally {
    console.log('auth attempt complete');
  }
}

// ─── 4. getToken with options object — no try-catch ──────────────────────────

export async function getTokenOptionsNoCatch(code: string, redirectUri: string) {
  // SHOULD_FIRE: get-token-unprotected — options-style call, no try-catch
  const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
  return tokens;
}

// ─── 5. getToken with options object — try-catch present ─────────────────────

export async function getTokenOptionsWithCatch(code: string, redirectUri: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — requirement satisfied
    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
    return tokens;
  } catch (err) {
    if (err instanceof GaxiosError) {
      console.error('OAuth error:', err.message);
    }
    throw err;
  }
}

// ─── 6. getTokenInfo — bare call, no try-catch ───────────────────────────────

export async function getTokenInfoNoCatch(accessToken: string) {
  // SHOULD_FIRE: get-token-info-unprotected — docs say "will throw if token is invalid"
  const info = await client.getTokenInfo(accessToken);
  return info;
}

// ─── 7. getTokenInfo — try-catch present ─────────────────────────────────────

export async function getTokenInfoWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — get-token-info-unprotected requirement satisfied
    const info = await client.getTokenInfo(accessToken);
    return info;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}

// ─── 8. Real-world pattern (postiz-app): getToken + getTokenInfo sequential ──

export async function authenticate(params: { code: string }) {
  // SHOULD_FIRE: get-token-unprotected — real-world pattern, no error handling
  const { tokens } = await client.getToken(params.code);
  client.setCredentials(tokens);
  return tokens;
}
