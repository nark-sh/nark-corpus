# CHANGELOG — @clerk/nextjs (v7+ extends-fork)

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — extends-fork created for v7+

- **Latest published:** @clerk/nextjs@7.5.2
- **New profile:** `packages/@clerk/nextjs-v7/contract.yaml` (extends `../nextjs/contract.yaml`)
- **Parent narrowed to:** `<7.0.0` (already at this bound; no change needed)
- **Diverged postconditions overridden:** `getToken` (added `get-token-ssr-not-handled`), `clerkMiddleware` (added `middleware-missing-encryption-key`)
- **New postconditions added:** `get-token-ssr-not-handled`, `middleware-missing-encryption-key`
- **Inherited unchanged:** all sign-in/sign-up flows, webhook verification (svix + verifyWebhook), currentUser caching/null checks, clerkClient user CRUD (createUser/deleteUser/banUser), useUser isLoaded checks, useSignIn error state, useClerk provider checks, clerkFrontendApiProxy env-var checks, attemptFirstFactor error codes, missing-clerk-middleware, protect-not-in-try-catch.
- **Verified by:** bc-version-drift (sweep 2026-06-11)
