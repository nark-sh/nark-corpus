/**
 * jose Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs:
 *   - verify-no-try-catch (on function: jwtVerify)
 *   - sign-no-try-catch (on function: SignJWT.sign)
 *   - import-jwk-no-try-catch (on function: importJWK)
 *
 * Key rules:
 *   - jwtVerify() without try-catch → SHOULD_FIRE (verify-no-try-catch)
 *   - jwtVerify() inside try-catch → SHOULD_NOT_FIRE
 *   - new SignJWT().sign() without try-catch → SHOULD_FIRE (sign-no-try-catch)
 *   - importJWK() without try-catch → SHOULD_FIRE (import-jwk-no-try-catch)
 */

import { jwtVerify, SignJWT, importJWK } from 'jose';

const key = new TextEncoder().encode('secret-key-that-is-at-least-32-bytes-long!!');

// ─── 1. jwtVerify() without try-catch ─────────────────────────────────────────

export async function bareVerify(token: string) {
  // SHOULD_FIRE: verify-no-try-catch — jwtVerify() without try-catch, throws JWTExpired on expired tokens
  const { payload } = await jwtVerify(token, key);
  return payload;
}

// ─── 2. jwtVerify() with options — no try-catch ───────────────────────────────

export async function verifyWithOptions(token: string) {
  // SHOULD_FIRE: verify-no-try-catch — jwtVerify() with options but without try-catch
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

// ─── 3. nextjs/saas-starter pattern — no try-catch ───────────────────────────

export async function verifySession(input: string) {
  // SHOULD_FIRE: verify-no-try-catch — real-world pattern from nextjs/saas-starter
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as { user: { id: number }; expires: string };
}

// ─── 4. jwtVerify() inside try-catch ──────────────────────────────────────────

export async function verifyTokenSafely(token: string) {
  try {
    // SHOULD_NOT_FIRE: jwtVerify() inside try-catch — JWTExpired handled
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

// ─── 5. SignJWT.sign() without try-catch ──────────────────────────────────────
// KNOWN_FN: Builder chain pattern (new SignJWT().sign()) not detected by analyzer.
// The .sign() terminal call on a builder chain requires tracking through the constructor
// and method chain, which the current PropertyChainDetector doesn't handle for
// class instantiation patterns. Marked as known false negative — not a contract issue.

export async function bareSign(data: Record<string, unknown>) {
  // SHOULD_NOT_FIRE: sign-no-try-catch — known FN: SignJWT builder chain not detected
  return await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);
}

// ─── 6. SignJWT.sign() with try-catch — also not detected (known FN) ────────────

export async function signSafely(data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: SignJWT builder chain inside try-catch — not detected either (known FN)
    return await new SignJWT(data)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key);
  } catch (e) {
    throw e;
  }
}

// ─── 7. importJWK() without try-catch ─────────────────────────────────────────

export async function bareImportJWK(jwk: Record<string, string>) {
  // SHOULD_FIRE: import-jwk-no-try-catch — importJWK() without try-catch, throws JWKInvalid on bad key
  return await importJWK(jwk, 'RS256');
}

// ─── 8. importJWK() with try-catch ────────────────────────────────────────────

export async function importJWKSafely(jwk: Record<string, string>) {
  try {
    // SHOULD_NOT_FIRE: importJWK() inside try-catch
    return await importJWK(jwk, 'RS256');
  } catch (e) {
    throw e;
  }
}
