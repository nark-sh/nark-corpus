# CHANGELOG — @clerk/nextjs (v7+ extends-fork)

All notable verification, deepen, and fork events for this profile. Newest first.


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
