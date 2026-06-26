# CHANGELOG — @clerk/nextjs

## 2026-06-26 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.9 (patch bump from 7.5.8)
- **Profile semver:** >=5.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — v7+ covered by @clerk/nextjs-v7 (>=7.0.0); patch bump only, no error-handling changes
- **Verified by:** bc-version-drift (sweep 2026-06-26)
## 2026-06-25 — re-verified clean

- **Latest published:** @clerk/nextjs@7.5.8
- **Profile semver:** >=5.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-23 — deepen pass — coverage 95% → 100%

- **Profile:** `packages/@clerk/nextjs/contract.yaml`
- **Functions added:** verifyToken, useReverification (2 total)
- **Postconditions added:** 2 (verify-token-no-error-handling, use-reverification-cancel-not-handled)
- **Functions intentionally omitted this pass:** getAuth (sync), buildClerkProps (sync), createRouteMatcher (sync), createClerkClient / createClerkClientWithOptions (factories — covered via clerkClient instance methods), reverificationErrorResponse / reverificationError (sync builders), keyless server-actions (dev-only ergonomics), invalidateCacheAction (internal), useSession / useOrganization / useEmailLink (resource-handle hooks — async methods on returned resources covered via clerkClient flows), React components (no async I/O surface).
- **Scanner concerns queued:** 2 (`concern-20260623-clerk-nextjs-deepen-1` for verifyToken, `concern-20260623-clerk-nextjs-deepen-2` for useReverification)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://clerk.com/docs/references/backend/verify-token ; @clerk/backend@2.x dist/chunk-I4B6KCGC.mjs (TokenVerificationErrorReason enum) ; @clerk/backend@2.x dist/chunk-KDNHJOF3.mjs (throw sites) ; @clerk/shared dist/runtime/error-Dl9xmUf3.mjs (isReverificationCancelledError predicate) ; https://clerk.com/docs/guides/secure/reverification ; https://clerk.com/docs/references/react/use-reverification
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T00:23Z, deepen-stream-3 pass 21)
- **Multi-version note:** parent profile only. The extending fork `@clerk/nextjs-v7` inherits both new postconditions automatically via `mergeContracts()`. No edit to the fork's contract.yaml required.

## 2026-06-18 — re-verified (no action; sibling fork covers latest)

- **Latest published:** @clerk/nextjs@7.5.5
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged — this profile is the parent)
- **Verdict:** major drift on parent, but sibling version-fork already covers @clerk/nextjs@7.5.5; no action on parent
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified (fork already current)

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged; parent profile)
- **Verdict:** latest is outside parent range but covered by version fork `@clerk/nextjs-v7` — no action required on this profile
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified (fork already current)

- **Latest published:** @clerk/nextjs@7.5.3
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged; parent profile)
- **Verdict:** latest is outside parent range but covered by version fork — no action required on this profile
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


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
