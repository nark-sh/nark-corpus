# CHANGELOG — @clerk/nextjs (v7+ extends-fork)

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-18 — deepen pass — coverage 95% → 100%

- **Profile:** `packages/@clerk/nextjs-v7/contract.yaml`
- **Functions added:** protect (auth.protect), useUser, currentUser (3 new function overrides)
- **Postconditions added:** 4 new
  - `get-token-offline-not-handled` (added to existing getToken function)
  - `protect-server-action-status-code-changed` (new protect override)
  - `use-user-initial-auth-state-removed` (new useUser override)
  - `current-user-pending-session-default-changed` (new currentUser override)
- **Functions intentionally omitted this pass:** none — v7-fork delta surface is now fully covered (5/5)
- **Scanner concerns queued:** 5 (`concern-20260618-clerk-nextjs-v7-deepen-1` through `-5`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/clerk/javascript/main/packages/nextjs/CHANGELOG.md (v7.0.0 entry)
  - https://clerk.com/docs/reference/nextjs/app-router/auth (auth.protect status codes)
- **Verified by:** bc-deepen-contract (pass 14, deepen-stream-1, 2026-06-18T23:46Z)
- **Notes:** This v7 fork's API surface is the v7.0.0 BREAKING-CHANGE delta versus the parent profile, not the full @clerk/nextjs surface. Five v7 changes documented in the v7.0.0 changelog are now all contracted. The two previously-contracted functions (getToken SSR throw, clerkMiddleware encryption-key) were preserved unchanged; one new postcondition was added to getToken for the ClerkOfflineError case that the original fork missed. Top-level coverage_score promoted from 0.95 to 1.0.

## 2026-06-18 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.5
- **Profile semver:** `>=7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** >=7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** `>=7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** `>=7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.2
- **Profile semver:** `>=7.0.0` (unchanged)
- **Verdict:** no changes — v7.3–v7.5 changelog reviewed. Only patch/minor changes: middleware debug log hardening (credential key truncation), `<ConfigureSSO>` removal from experimental path (not a public API change). No new error-handling postconditions needed. Profile is current for v7.5.2.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — extends-fork created for v7+

- **Latest published:** @clerk/nextjs@7.5.2
- **New profile:** `packages/@clerk/nextjs-v7/contract.yaml` (extends `../nextjs/contract.yaml`)
- **Parent narrowed to:** `<7.0.0` (already at this bound; no change needed)
- **Diverged postconditions overridden:** `getToken` (added `get-token-ssr-not-handled`), `clerkMiddleware` (added `middleware-missing-encryption-key`)
- **New postconditions added:** `get-token-ssr-not-handled`, `middleware-missing-encryption-key`
- **Inherited unchanged:** all sign-in/sign-up flows, webhook verification (svix + verifyWebhook), currentUser caching/null checks, clerkClient user CRUD (createUser/deleteUser/banUser), useUser isLoaded checks, useSignIn error state, useClerk provider checks, clerkFrontendApiProxy env-var checks, attemptFirstFactor error codes, missing-clerk-middleware, protect-not-in-try-catch.
- **Verified by:** bc-version-drift (sweep 2026-06-11)
