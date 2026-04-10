/**
 * Demonstrates PROPER error handling for jwt-decode.
 * Should NOT trigger any violations.
 */
import { jwtDecode, InvalidTokenError } from 'jwt-decode';

/**
 * ✅ Correctly wraps jwtDecode in try-catch.
 * Handles InvalidTokenError from malformed tokens.
 */
function decodeTokenSafely(token: string): Record<string, unknown> | null {
  try {
    return jwtDecode(token) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      console.error('Malformed JWT token:', error.message);
      return null;
    }
    throw error;
  }
}

/**
 * ✅ isJwtExpired pattern — correctly handles error with generic catch.
 * This pattern is found in Bluesky and Activepieces.
 */
function isJwtExpired(token: string): boolean {
  if (!token) {
    return true;
  }
  try {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      return Date.now() / 1000 >= decoded.exp;
    }
    return true;
  } catch (e) {
    return true;
  }
}

/**
 * ✅ Generic try-catch that re-throws on unknown errors.
 */
function getUserIdFromToken(token: string): string | null {
  try {
    const payload = jwtDecode(token) as { sub?: string };
    return payload.sub ?? null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export { decodeTokenSafely, isJwtExpired, getUserIdFromToken };
