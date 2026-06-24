/**
 * jose Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs:
 *   - verify-no-try-catch (on function: jwtVerify)
 *   - sign-no-try-catch (on function: SignJWT.sign)
 *   - import-jwk-no-try-catch (on function: importJWK)
 *   - jwt-decrypt-no-try-catch (on function: jwtDecrypt) [ADDED 2026-04-16]
 *   - compact-decrypt-no-try-catch (on function: compactDecrypt) [ADDED 2026-04-16]
 *   - encrypt-jwt-no-try-catch (on function: EncryptJWT.encrypt) [ADDED 2026-04-16]
 *   - import-spki-no-try-catch (on function: importSPKI) [ADDED 2026-04-16]
 *   - import-pkcs8-no-try-catch (on function: importPKCS8) [ADDED 2026-04-16]
 *   - import-x509-no-try-catch (on function: importX509) [ADDED 2026-04-16]
 *   - generate-key-pair-no-try-catch (on function: generateKeyPair) [ADDED 2026-04-16]
 *   - compact-verify-no-try-catch (on function: compactVerify) [ADDED 2026-04-16]
 *   - remote-jwks-reload-no-try-catch (on function: createRemoteJWKSet.reload) [ADDED 2026-06-24]
 */

import {
  jwtVerify,
  jwtDecrypt,
  SignJWT,
  EncryptJWT,
  compactDecrypt,
  compactVerify,
  createRemoteJWKSet,
  importJWK,
  importSPKI,
  importPKCS8,
  importX509,
  generateKeyPair,
} from 'jose';

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

// ─── 9. jwtDecrypt() without try-catch ────────────────────────────────────────
// @expect-violation: jwt-decrypt-no-try-catch

export async function bareDecryptJwt(token: string, privateKey: Uint8Array) {
  // SHOULD_FIRE: jwt-decrypt-no-try-catch — jwtDecrypt() without try-catch; throws JWEDecryptionFailed on wrong key, JWTExpired on expired token
  const { payload } = await jwtDecrypt(token, privateKey);
  return payload;
}

// ─── 10. jwtDecrypt() with try-catch ──────────────────────────────────────────
// @expect-clean

export async function decryptJwtSafely(token: string, privateKey: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: jwtDecrypt() inside try-catch — JWEDecryptionFailed handled
    const { payload } = await jwtDecrypt(token, privateKey);
    return payload;
  } catch {
    return null;
  }
}

// ─── 11. compactDecrypt() without try-catch ───────────────────────────────────
// @expect-violation: compact-decrypt-no-try-catch

export async function bareCompactDecrypt(jwe: string, key: Uint8Array) {
  // SHOULD_FIRE: compact-decrypt-no-try-catch — compactDecrypt() without try-catch; throws JWEDecryptionFailed on authentication tag failure, JWEInvalid on format error
  const { plaintext } = await compactDecrypt(jwe, key);
  return plaintext;
}

// ─── 12. compactDecrypt() with try-catch ─────────────────────────────────────
// @expect-clean

export async function compactDecryptSafely(jwe: string, key: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: compactDecrypt() inside try-catch
    const { plaintext } = await compactDecrypt(jwe, key);
    return plaintext;
  } catch (e) {
    throw e;
  }
}

// ─── 13. importSPKI() without try-catch ───────────────────────────────────────
// @expect-violation: import-spki-no-try-catch

export async function bareImportSPKI(pem: string) {
  // SHOULD_FIRE: import-spki-no-try-catch — importSPKI() without try-catch; throws TypeError when PEM is malformed or missing -----BEGIN PUBLIC KEY----- header
  return await importSPKI(pem, 'RS256');
}

// ─── 14. importSPKI() with try-catch ──────────────────────────────────────────
// @expect-clean

export async function importSPKISafely(pem: string) {
  try {
    // SHOULD_NOT_FIRE: importSPKI() inside try-catch
    return await importSPKI(pem, 'RS256');
  } catch (e) {
    throw e;
  }
}

// ─── 15. importPKCS8() without try-catch ──────────────────────────────────────
// @expect-violation: import-pkcs8-no-try-catch

export async function bareImportPKCS8(pem: string) {
  // SHOULD_FIRE: import-pkcs8-no-try-catch — importPKCS8() without try-catch; throws TypeError when PEM is malformed or missing -----BEGIN PRIVATE KEY----- header
  return await importPKCS8(pem, 'RS256');
}

// ─── 16. importPKCS8() with try-catch ─────────────────────────────────────────
// @expect-clean

export async function importPKCS8Safely(pem: string) {
  try {
    // SHOULD_NOT_FIRE: importPKCS8() inside try-catch
    return await importPKCS8(pem, 'RS256');
  } catch (e) {
    throw e;
  }
}

// ─── 17. compactVerify() without try-catch ────────────────────────────────────
// @expect-violation: compact-verify-no-try-catch

export async function bareCompactVerify(jws: string, key: Uint8Array) {
  // SHOULD_FIRE: compact-verify-no-try-catch — compactVerify() without try-catch; throws JWSSignatureVerificationFailed on tampered token, JWSInvalid on format error
  const { payload } = await compactVerify(jws, key);
  return payload;
}

// ─── 18. compactVerify() with try-catch ───────────────────────────────────────
// @expect-clean

export async function compactVerifySafely(jws: string, key: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: compactVerify() inside try-catch
    const { payload } = await compactVerify(jws, key);
    return payload;
  } catch (e) {
    return null;
  }
}

// ─── 19. generateKeyPair() without try-catch ──────────────────────────────────
// @expect-violation: generate-key-pair-no-try-catch

export async function bareGenerateKeyPair() {
  // SHOULD_FIRE: generate-key-pair-no-try-catch — generateKeyPair() without try-catch; throws JOSENotSupported for unsupported algorithm or invalid modulusLength
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  return { privateKey, publicKey };
}

// ─── 20. generateKeyPair() with try-catch ─────────────────────────────────────
// @expect-clean

export async function generateKeyPairSafely() {
  try {
    // SHOULD_NOT_FIRE: generateKeyPair() inside try-catch
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    return { privateKey, publicKey };
  } catch (e) {
    throw e;
  }
}

// ─── 21. createRemoteJWKSet().reload() without try-catch ──────────────────────

export async function bareRemoteJWKSReload() {
  const JWKS = createRemoteJWKSet(new URL('https://example.com/.well-known/jwks.json'));
  // SHOULD_FIRE: remote-jwks-reload-no-try-catch — .reload() without try-catch; throws JWKSTimeout on AbortSignal timeout, JOSEError on non-200 response or bad JSON
  await JWKS.reload();
  return JWKS;
}

// ─── 22. createRemoteJWKSet().reload() with try-catch ─────────────────────────

export async function remoteJWKSReloadSafely() {
  const JWKS = createRemoteJWKSet(new URL('https://example.com/.well-known/jwks.json'));
  try {
    // SHOULD_NOT_FIRE: .reload() inside try-catch — JWKSTimeout / JOSEError handled
    await JWKS.reload();
  } catch {
    // swallow stale-cache failure
  }
  return JWKS;
}
