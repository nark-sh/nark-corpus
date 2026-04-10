/**
 * Demonstrates PROPER error handling for jose.
 * Should NOT trigger any violations.
 */
import { jwtVerify, SignJWT, importJWK } from 'jose';

const key = new TextEncoder().encode('secret-key-that-is-at-least-32-bytes-long!!');

// Proper jwtVerify with try-catch
async function verifyTokenProperly(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    throw error;
  }
}

// Proper SignJWT with try-catch
async function signTokenProperly(data: Record<string, unknown>) {
  try {
    return await new SignJWT(data)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);
  } catch (error) {
    throw error;
  }
}

// Proper importJWK with try-catch
async function importKeyProperly(jwk: Record<string, string>) {
  try {
    return await importJWK(jwk, 'RS256');
  } catch (error) {
    throw error;
  }
}
