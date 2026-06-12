# CHANGELOG — @clerk/nextjs

All notable verification, deepen, and fork events for this profile. Newest first.

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
