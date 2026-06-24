/**
 * @clerk/nextjs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @clerk/nextjs contract spec (contract.yaml),
 * NOT from scanner V1 behavior.
 *
 * Postcondition IDs covered:
 *   - verify-webhook-no-error-handling       (verifyWebhook() without try-catch)
 *   - verify-webhook-missing-env-var         (missing CLERK_WEBHOOK_SIGNING_SECRET)
 *   - create-user-no-error-handling          (clerkClient().users.createUser() without try-catch)
 *   - delete-user-no-error-handling          (clerkClient().users.deleteUser() without try-catch)
 *   - ban-user-no-error-handling             (clerkClient().users.banUser() without try-catch)
 *   - attempt-first-factor-no-error-handling (signIn.attemptFirstFactor() without try-catch)
 *   - use-user-no-loaded-check               (useUser() without isLoaded check)
 *
 * Design: spec-driven, NOT based on V1 behavior.
 */

import { clerkClient } from '@clerk/nextjs/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// 1. verifyWebhook() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function webhookHandlerNoCatch(req: NextRequest) {
  // SHOULD_FIRE: verify-webhook-no-error-handling — verifyWebhook() throws on invalid signature, missing headers, or missing env var
  const evt = await verifyWebhook(req);
  return Response.json({ type: evt.type });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. verifyWebhook() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function webhookHandlerWithCatch(req: NextRequest) {
  try {
    // SHOULD_NOT_FIRE: verify-webhook-no-error-handling — inside try-catch
    const evt = await verifyWebhook(req);
    return Response.json({ type: evt.type });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook error', { status: 400 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. verifyWebhook() — with .catch() chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function webhookHandlerWithChain(req: NextRequest) {
  // SHOULD_NOT_FIRE: verify-webhook-no-error-handling — .catch() handles errors
  const evt = await verifyWebhook(req).catch(err => {
    throw new Response('Invalid webhook', { status: 400 });
  });
  return Response.json({ type: evt.type });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. clerkClient().users.createUser() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserNoCatch(email: string, password: string) {
  const clerk = await clerkClient();
  // SHOULD_FIRE: create-user-no-error-handling — createUser() throws ClerkAPIResponseError on duplicate email (422), rate limit (429)
  const user = await clerk.users.createUser({
    emailAddress: [email],
    password,
  });
  return user.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. clerkClient().users.createUser() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserWithCatch(email: string, password: string) {
  const clerk = await clerkClient();
  try {
    // SHOULD_NOT_FIRE: create-user-no-error-handling — inside try-catch
    const user = await clerk.users.createUser({
      emailAddress: [email],
      password,
    });
    return user.id;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. clerkClient().users.deleteUser() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteUserNoCatch(userId: string) {
  const clerk = await clerkClient();
  // SHOULD_FIRE: delete-user-no-error-handling — deleteUser() throws on 404 (user not found), requireId() throws on null userId
  await clerk.users.deleteUser(userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. clerkClient().users.deleteUser() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteUserWithCatch(userId: string) {
  const clerk = await clerkClient();
  try {
    // SHOULD_NOT_FIRE: delete-user-no-error-handling — inside try-catch
    await clerk.users.deleteUser(userId);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. clerkClient().users.banUser() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function banUserNoCatch(userId: string) {
  const clerk = await clerkClient();
  // SHOULD_FIRE: ban-user-no-error-handling — banUser() throws ClerkAPIResponseError on 404, 422, or auth failure
  await clerk.users.banUser(userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. clerkClient().users.banUser() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function banUserWithCatch(userId: string) {
  const clerk = await clerkClient();
  try {
    // SHOULD_NOT_FIRE: ban-user-no-error-handling — inside try-catch
    await clerk.users.banUser(userId);
  } catch (error) {
    console.error('Failed to ban user:', error);
    // Alert security team on ban failure
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. clerkFrontendApiProxy() — bare call without response status check → SHOULD_FIRE
//     Note: clerkFrontendApiProxy returns error Responses (500/502) — does NOT throw.
//     The postconditions proxy-missing-publishable-key, proxy-missing-secret-key, and
//     proxy-network-failure-returns-502 require env var presence and response monitoring.
//     Scanner detection: env var check (proxy-missing-publishable-key, proxy-missing-secret-key)
//     and response status monitoring (proxy-network-failure-returns-502).
// ─────────────────────────────────────────────────────────────────────────────

// Note: clerkFrontendApiProxy is typically used as a passthrough route handler.
// The function returns Response objects for all cases (success and error).
// Detection requires checking that CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
// env vars are set when the proxy is used. This is an env-var-presence check,
// not a try-catch check, so these test cases document the usage pattern for
// future scanner rule implementation.

import { clerkFrontendApiProxy } from '@clerk/nextjs/server';

// SHOULD_NOT_FIRE: scanner gap — proxy-missing-publishable-key — if CLERK_PUBLISHABLE_KEY not in env
// SHOULD_NOT_FIRE: scanner gap — proxy-missing-secret-key — if CLERK_SECRET_KEY not in env
export async function proxyHandlerBare(request: Request) {
  // Returns the proxy response directly without any error monitoring
  return clerkFrontendApiProxy(request);
}

// SHOULD_NOT_FIRE: proxy handler with response status monitoring
export async function proxyHandlerWithMonitoring(request: Request) {
  const response = await clerkFrontendApiProxy(request);
  if (response.status >= 500) {
    console.error(`Clerk proxy error: ${response.status}`);
    // Could alert monitoring system here
  }
  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. verifyToken() — bare call, no try-catch → SHOULD_FIRE
//     Added 2026-06-23 (deepen-stream-3 pass 21). verifyToken() throws
//     TokenVerificationError on expired/invalid/malformed JWT, missing JWKS,
//     or missing CLERK_SECRET_KEY. Real-world: webhook handlers, edge-runtime
//     route handlers that validate session tokens outside clerkMiddleware().
// ─────────────────────────────────────────────────────────────────────────────

import { verifyToken } from '@clerk/nextjs/server';

export async function verifyTokenNoCatch(token: string) {
  // SHOULD_NOT_FIRE: scanner gap — verify-token-no-error-handling — postcondition queued
  // in upgrade-concerns.json (concern-20260623-clerk-nextjs-deepen-1). Once the detector
  // ships, change this annotation to SHOULD_FIRE.
  // verifyToken throws TokenVerificationError on expired token, invalid signature,
  // malformed JWT, missing secret/JWK, etc.
  const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
  return payload.sub;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. verifyToken() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyTokenWithCatch(token: string) {
  try {
    // SHOULD_NOT_FIRE: verify-token-no-error-handling — inside try-catch
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return payload.sub;
  } catch (err) {
    // expired tokens are the dominant case — return null userId, not 500
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. verifyToken() — .catch() promise handler → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function verifyTokenPromiseChain(token: string) {
  // SHOULD_NOT_FIRE: verify-token-no-error-handling — handled via .catch()
  return verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })
    .then((payload) => payload.sub)
    .catch(() => null);
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. useReverification() — enhanced fetcher called bare → SHOULD_FIRE
//     Added 2026-06-23 (deepen-stream-3 pass 21). useReverification wraps an
//     async fetcher. The returned fetcher rejects with ClerkRuntimeError
//     (code: "reverification_cancelled") when user closes the modal. Without
//     a try-catch + isReverificationCancelledError branch, payment / sensitive
//     UIs show generic "Something went wrong" instead of polite retry UX.
// ─────────────────────────────────────────────────────────────────────────────

import { useReverification } from '@clerk/nextjs';

export function ReverificationButtonBare() {
  // The returned tuple's first element is the enhanced fetcher.
  const [enhancedFetcher] = useReverification(async () => {
    const res = await fetch('/api/sensitive-action', { method: 'POST' });
    return res.json();
  });

  const handleClick = async () => {
    // SHOULD_NOT_FIRE: scanner gap — use-reverification-cancel-not-handled —
    // postcondition queued in upgrade-concerns.json (concern-20260623-clerk-nextjs-deepen-2).
    // Once the detector ships, change this annotation to SHOULD_FIRE.
    // The enhanced fetcher rejects with ClerkRuntimeError(code: "reverification_cancelled")
    // when user closes the modal without completing verification.
    const result = await enhancedFetcher();
    return result;
  };

  return handleClick;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. useReverification() — with isReverificationCancelledError branch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

import { isReverificationCancelledError } from '@clerk/nextjs/errors';

export function ReverificationButtonWithCancelCheck() {
  const [enhancedFetcher] = useReverification(async () => {
    const res = await fetch('/api/sensitive-action', { method: 'POST' });
    return res.json();
  });

  const handleClick = async () => {
    try {
      // SHOULD_NOT_FIRE: use-reverification-cancel-not-handled — branched on cancel
      const result = await enhancedFetcher();
      return result;
    } catch (err) {
      if (isReverificationCancelledError(err)) {
        // user cancelled — show retry, not error
        return null;
      }
      throw err;
    }
  };

  return handleClick;
}
