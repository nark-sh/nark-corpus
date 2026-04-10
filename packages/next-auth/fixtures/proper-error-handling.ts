/**
 * Fixtures demonstrating PROPER error handling for next-auth/jwt.
 * These patterns should NOT trigger contract violations.
 */
import { encode, decode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

// ✅ CORRECT: encode() wrapped in try/catch
async function createSessionToken(userId: string): Promise<string | null> {
  try {
    const token = await encode({
      token: { sub: userId, email: "user@example.com" },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60,
    });
    return token;
  } catch (error) {
    console.error("Failed to encode session token:", error);
    return null;
  }
}

// ✅ CORRECT: decode() wrapped in try/catch
async function verifyCustomToken(tokenString: string): Promise<JWT | null> {
  try {
    const payload = await decode({
      token: tokenString,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    return payload;
  } catch (error) {
    // JWEDecryptionFailed, JWTInvalid, or TypeError from missing secret
    console.error("Token decode failed (possibly expired or wrong secret):", error);
    return null;
  }
}

// ✅ CORRECT: encode() in try/catch with error classification
async function encodeAdminToken(payload: Record<string, unknown>): Promise<string> {
  try {
    return await encode({
      token: payload,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("NEXTAUTH_SECRET is not configured. Cannot encode token.");
    }
    throw new Error(`Token encoding failed: ${(error as Error).message}`);
  }
}

// ✅ CORRECT: decode() in try/catch for secret rotation handling
async function decodeWithFallback(
  tokenString: string,
  currentSecret: string,
  oldSecret?: string
): Promise<JWT | null> {
  try {
    return await decode({ token: tokenString, secret: currentSecret });
  } catch (error) {
    // Handle secret rotation: try old secret as fallback
    if (oldSecret) {
      try {
        return await decode({ token: tokenString, secret: oldSecret });
      } catch {
        return null;
      }
    }
    return null;
  }
}
