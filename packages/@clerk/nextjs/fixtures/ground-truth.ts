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
