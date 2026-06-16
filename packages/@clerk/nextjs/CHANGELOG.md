# CHANGELOG — @clerk/nextjs

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-15 — re-verified clean (fork @clerk/nextjs-v7 confirmed current)

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged — v7 fork exists)
- **Verdict:** no action — @clerk/nextjs-v7 (`>=7.0.0`, extends-fork) covers v7.5.3. v7.5.2→7.5.3 is a patch release, no error-handling changes.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean (fork @clerk/nextjs-v7 confirmed current)

- **Latest published:** @clerk/nextjs@7.5.2
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged — v7 fork exists)
- **Verdict:** no action — @clerk/nextjs-v7/contract.yaml (semver `>=7.0.0`, extends-fork) already covers v7+. v7.5.2 changelog reviewed (v7.3–v7.5): only patch/minor changes (middleware debug hardening, `<ConfigureSSO>` removal from experimental). No new error-handling postconditions needed. @clerk/nextjs-v7 profile is current.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — extends-fork created for v7+

- **Latest published:** @clerk/nextjs@7.5.2
- **New profile:** `packages/@clerk/nextjs-v7/contract.yaml` (extends `../nextjs/contract.yaml`)
- **Parent narrowed to:** `<7.0.0` (already at this bound; no change needed)
- **Diverged postconditions overridden:** `getToken` (added `get-token-ssr-not-handled`), `clerkMiddleware` (added `middleware-missing-encryption-key`)
- **New postconditions added:** `get-token-ssr-not-handled`, `middleware-missing-encryption-key`
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-06-11 — flagged for extends-fork

- **Latest published:** @clerk/nextjs@7.5.2
- **Verdict:** extends-fork recommended — v7 introduces error-relevant behavioral change: `useAuth().getToken` now throws `ClerkRuntimeError` with code `clerk_runtime_not_browser` during SSR (previously returned `undefined`). Also: `clerkMiddleware()` now throws if `CLERK_ENCRYPTION_KEY` is missing when `secretKey` is set at runtime. `auth.protect()` returns 401 (not 404) for unauthenticated server actions.
- **Reason:** at least 2 new postconditions needed for v7; parent postconditions (e.g. getAuth() auth checks) still apply in v7 — extends-fork qualifies (≥50% parent postconditions reusable)
- **Queued in:** `work-packages/version-drift/needs-review.md` (sweep 2026-06-11)
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-11 — backfilled

- **Verified against:** @clerk/nextjs@>=5.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
