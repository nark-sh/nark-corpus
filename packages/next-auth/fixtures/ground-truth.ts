/**
 * next-auth Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the next-auth contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - encode() without try-catch → SHOULD_FIRE: encode-no-try-catch
 *   - decode() without try-catch → SHOULD_FIRE: decode-no-try-catch
 *   - encode() inside try-catch → SHOULD_NOT_FIRE
 *   - decode() inside try-catch → SHOULD_NOT_FIRE
 *   - getToken() → SHOULD_NOT_FIRE (wraps decode() internally with try-catch)
 *
 * Contracted postconditions:
 *   encode-no-try-catch: encode() throws TypeError/Error when secret missing or encryption fails
 *   decode-no-try-catch: decode() throws JWEDecryptionFailed/JWEInvalid on wrong secret/malformed token
 *   getserversession-null-not-checked: getServerSession() returns null without null guard
 *   gettoken-null-not-checked: getToken() returns null without null guard
 *   gettoken-missing-req: getToken() throws TypeError when req is missing
 *   getsession-null-not-checked: getSession() returns null without null guard
 *
 * Coverage:
 *   - Section 1: bare encode() → SHOULD_FIRE
 *   - Section 2: encode() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare decode() → SHOULD_FIRE
 *   - Section 4: decode() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 5: getServerSession() without null check → SHOULD_FIRE
 *   - Section 6: getServerSession() with null check → SHOULD_NOT_FIRE
 *   - Section 7: getToken() without null check → SHOULD_FIRE
 *   - Section 8: getToken() with null check → SHOULD_NOT_FIRE
 *   - Section 9: getSession() without null check → SHOULD_FIRE
 *   - Section 10: getSession() with null check → SHOULD_NOT_FIRE
 */

import { encode, decode, getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { signIn, signOut, getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import type { AuthOptions } from "next-auth";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare encode() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function encodeTokenNoCatch(userId: string) {
  // SHOULD_FIRE: encode-no-try-catch — encode() without try-catch, TypeError if secret missing
  const token = await encode({
    token: { sub: userId, email: "user@example.com" },
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return token;
}

export async function encodeCustomTokenNoCatch(
  payload: Record<string, unknown>,
) {
  // SHOULD_FIRE: encode-no-try-catch — encode() without try-catch, encryption failure unhandled
  return await encode({
    token: payload,
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 3600,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. encode() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function encodeTokenWithCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: encode() inside try-catch satisfies the encode-no-try-catch requirement
    const token = await encode({
      token: { sub: userId, email: "user@example.com" },
      secret: process.env.NEXTAUTH_SECRET!,
    });
    return token;
  } catch (error) {
    console.error("Failed to encode token:", error);
    throw error;
  }
}

export async function encodeCustomTokenWithCatch(
  payload: Record<string, unknown>,
) {
  try {
    // SHOULD_NOT_FIRE: encode() wrapped in try-catch
    return await encode({
      token: payload,
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 3600,
    });
  } catch (error) {
    console.error("Token encoding failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare decode() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function decodeTokenNoCatch(token: string) {
  // SHOULD_FIRE: decode-no-try-catch — decode() without try-catch, JWEDecryptionFailed unhandled
  const payload = await decode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. decode() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function decodeTokenWithCatch(token: string) {
  try {
    // SHOULD_NOT_FIRE: decode() inside try-catch satisfies the decode-no-try-catch requirement
    const payload = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    return payload;
  } catch (error) {
    console.error("Failed to decode token (secret may have rotated):", error);
    return null;
  }
}

export async function decodeTokenFromRequestWithCatch(
  rawToken: string | undefined,
) {
  if (!rawToken) return null;
  try {
    // SHOULD_NOT_FIRE: decode() wrapped in try-catch with null return on failure
    return await decode({
      token: rawToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. getServerSession() without null check → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

const authOptions: AuthOptions = { providers: [] };

export async function getSessionAndAccessUser() {
  // SHOULD_FIRE: getserversession-null-not-checked — accessing .user without null check
  const session = await getServerSession(authOptions);
  return session.user;
}

export async function getSessionDirectReturn() {
  // SHOULD_FIRE: getserversession-null-not-checked — returning session without null check on await
  return await getServerSession(authOptions);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. getServerSession() with null check → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getSessionWithNullCheck() {
  // SHOULD_NOT_FIRE: getServerSession() with explicit null guard
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session.user;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. getToken() without null check → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getTokenAndAccessSub(req: NextApiRequest) {
  // SHOULD_FIRE: gettoken-null-not-checked — accessing .sub without null check
  const token = await getToken({ req });
  return token.sub;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. getToken() with null check → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getTokenWithNullCheck(req: NextApiRequest) {
  // SHOULD_NOT_FIRE: getToken() with explicit null guard
  const token = await getToken({ req });
  if (!token) {
    return null;
  }
  return token.sub;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. getSession() without null check → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getClientSessionAndAccessUser() {
  // SHOULD_FIRE: getsession-null-not-checked — accessing .user without null check
  const session = await getSession();
  return session.user;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. getSession() with null check → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function getClientSessionWithNullCheck() {
  // SHOULD_NOT_FIRE: getSession() with explicit null guard
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session.user;
}
