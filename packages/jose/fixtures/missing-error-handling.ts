/**
 * Demonstrates MISSING error handling for jose.
 * Should trigger ERROR violations for jwtVerify and importJWK.
 */
import { jwtVerify, SignJWT, importJWK } from 'jose';

const key = new TextEncoder().encode('secret-key-that-is-at-least-32-bytes-long!!');

// ❌ jwtVerify without try-catch — should trigger ERROR violation
async function verifyTokenUnsafe(token: string) {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

// ❌ importJWK without try-catch — should trigger ERROR violation
async function importKeyUnsafe(jwk: Record<string, string>) {
  const cryptoKey = await importJWK(jwk, 'RS256');
  return cryptoKey;
}

// ❌ SignJWT.sign() without try-catch — should trigger WARNING violation
async function signTokenUnsafe(data: Record<string, unknown>) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
  return token;
}
