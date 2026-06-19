/**
 * @clerk/nextjs v7+ Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @clerk/nextjs-v7 contract spec (contract.yaml),
 * NOT from scanner behavior.
 *
 * v7-specific postcondition IDs covered:
 *   - get-token-ssr-not-handled                       (useAuth().getToken() called server-side)
 *   - get-token-offline-not-handled                   (getToken() result null-checked without try-catch)
 *   - middleware-missing-encryption-key               (clerkMiddleware with secretKey, no CLERK_ENCRYPTION_KEY)
 *   - protect-server-action-status-code-changed       (auth.protect() in server action, 404 status hard-coded downstream)
 *   - use-user-initial-auth-state-removed             (useUser/useAuth with deprecated initialAuthState option)
 *   - current-user-pending-session-default-changed    (currentUser() with downstream pending-state branch)
 *
 * Design: spec-driven, NOT based on V1 behavior.
 */

import { clerkMiddleware, currentUser, auth } from '@clerk/nextjs/server';
import { useAuth, useUser } from '@clerk/nextjs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. get-token-ssr-not-handled — getToken() called top-level in Server Component
// ─────────────────────────────────────────────────────────────────────────────

export async function ServerComponentUsingGetToken() {
  const { getToken } = useAuth();
  // SHOULD_FIRE: get-token-ssr-not-handled — v7 throws ClerkRuntimeError when called SSR
  const token = await getToken();
  if (token === undefined) return null;
  return { token };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. get-token-ssr-not-handled — getToken() inside useEffect → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export function ClientComponentGetToken() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // SHOULD_NOT_FIRE: get-token-ssr-not-handled — runs browser-side via useEffect
    getToken().then((t) => setToken(t ?? null)).catch(() => setToken(null));
  }, [getToken]);

  return token;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. get-token-offline-not-handled — null-check pattern without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function RefreshTokenLoop() {
  const { getToken } = useAuth();
  // SHOULD_FIRE: get-token-offline-not-handled — v7 throws ClerkOfflineError instead of null
  const token = await getToken();
  if (token === null) {
    // legacy v6 guard path — silently breaks in v7 when offline
    return { offline: true };
  }
  return { token };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. get-token-offline-not-handled — proper try-catch handles ClerkOfflineError
// ─────────────────────────────────────────────────────────────────────────────

export async function RefreshTokenLoopWithCatch() {
  const { getToken } = useAuth();
  try {
    // SHOULD_NOT_FIRE: get-token-offline-not-handled — wrapped in try-catch
    const token = await getToken();
    if (token === null) {
      return { offline: true };
    }
    return { token };
  } catch (err) {
    // Caller distinguishes ClerkOfflineError via err.name in real code
    return { error: err };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. middleware-missing-encryption-key — runtime secretKey, no encryption key
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: middleware-missing-encryption-key — secretKey passed without CLERK_ENCRYPTION_KEY assert
export default clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. middleware-missing-encryption-key — bare clerkMiddleware, no secretKey
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: middleware-missing-encryption-key — uses default key resolution
export const safeMiddleware = clerkMiddleware();

// ─────────────────────────────────────────────────────────────────────────────
// 7. protect-server-action-status-code-changed — server action with 404 branch
// ─────────────────────────────────────────────────────────────────────────────

// File-top server-action directive simulated via inline comment
// In a real codebase this would be 'use server' at module top.
export async function signOutFlow(response: Response) {
  // SHOULD_FIRE: protect-server-action-status-code-changed — 404 check is now stale
  if (response.status === 404) {
    return { signOut: true };
  }
  return { signOut: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. protect-server-action-status-code-changed — migrated to 401 check
// ─────────────────────────────────────────────────────────────────────────────

export async function signOutFlowV7(response: Response) {
  // SHOULD_NOT_FIRE: protect-server-action-status-code-changed — correct 401 branch
  if (response.status === 401) {
    return { signOut: true };
  }
  return { signOut: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. use-user-initial-auth-state-removed — legacy option passed to hook
// ─────────────────────────────────────────────────────────────────────────────

export function ComponentWithLegacyInitialState() {
  // SHOULD_FIRE: use-user-initial-auth-state-removed — option removed in v7
  const { user, isLoaded } = useUser({ initialAuthState: { userId: 'cached_user_xyz' } } as any);
  if (!isLoaded) return null;
  return user?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. use-user-initial-auth-state-removed — no legacy option → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function ComponentWithoutLegacyOption() {
  // SHOULD_NOT_FIRE: use-user-initial-auth-state-removed — no removed option
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  return user?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. current-user-pending-session-default-changed — pending-verification branch
// ─────────────────────────────────────────────────────────────────────────────

export async function PendingVerificationFlow() {
  // SHOULD_FIRE: current-user-pending-session-default-changed — pending users now null
  const user = await currentUser();
  if (user) {
    // legacy v6 branch — user object would be present for pending verification
    const primaryEmail = user.emailAddresses[0];
    if (primaryEmail.verification.status === 'unverified') {
      return { redirect: '/verify-email' };
    }
  }
  return { redirect: '/sign-in' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. current-user-pending-session-default-changed — explicit opt-out
// ─────────────────────────────────────────────────────────────────────────────

export async function PendingVerificationFlowV7() {
  // SHOULD_NOT_FIRE: current-user-pending-session-default-changed — explicit option restores v6 behavior
  const user = await currentUser({ treatPendingAsSignedOut: false } as any);
  if (user) {
    const primaryEmail = user.emailAddresses[0];
    if (primaryEmail.verification.status === 'unverified') {
      return { redirect: '/verify-email' };
    }
  }
  return { redirect: '/sign-in' };
}
