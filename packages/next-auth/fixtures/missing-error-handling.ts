/**
 * Fixtures demonstrating MISSING error handling for next-auth/jwt.
 * These patterns SHOULD trigger contract violations.
 */
import { encode, decode } from "next-auth/jwt";

// ❌ MISSING: encode() without try/catch
// Throws TypeError if NEXTAUTH_SECRET is undefined
async function createTokenMissingErrorHandling(userId: string): Promise<string> {
  const token = await encode({
    token: { sub: userId },
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return token;
}

// ❌ MISSING: decode() without try/catch
// Throws JWEDecryptionFailed if token is malformed or wrong secret
async function verifyTokenMissingErrorHandling(tokenString: string) {
  const payload = await decode({
    token: tokenString,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return payload;
}

// ❌ MISSING: encode() in async arrow function without try/catch
const generateToken = async (data: Record<string, unknown>) => {
  const jwt = await encode({
    token: data,
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 3600,
  });
  return jwt;
};

// ❌ MISSING: decode() in middleware without try/catch
async function validateRequestToken(token: string) {
  const decoded = await decode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!decoded) return null;
  return decoded.sub;
}
