# CHANGELOG — firebase-admin

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — flagged for manual review

- **Latest published:** firebase-admin@14.0.0
- **Verdict:** manual review required — v14 ships "Error Handling Revamp" (PR #3140); error classes and/or patterns may have changed; also removed deprecated Instance ID service and legacy namespace support
- **Reason:** "Error Handling Revamp" in v14 is a red flag — exact changes to thrown error types, error codes, or error-handling APIs need investigation before extending the range
- **Queued in:** `work-packages/version-drift/needs-review.md` (sweep 2026-06-11)
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-13 — backfilled

- **Verified against:** firebase-admin@>=11.0.0 <14.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
