# CHANGELOG — @clerk/nextjs

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — flagged for manual review

- **Latest published:** @clerk/nextjs@7.5.2
- **Verdict:** manual review required — v7 changes `useAuth().getToken` from returning `undefined` during SSR to throwing with `clerk_runtime_not_browser` error code; semantic error-handling change
- **Reason:** profile postconditions may need validation against v7 SSR throw behavior; range can extend to `>=5.0.0 <8.0.0` but new postcondition may be needed
- **Queued in:** `work-packages/version-drift/needs-review.md` (sweep 2026-06-11)
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-11 — backfilled

- **Verified against:** @clerk/nextjs@>=5.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
