# CHANGELOG — typeorm

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — flagged for manual review

- **Latest published:** typeorm@1.0.0
- **Verdict:** manual review required — v1.0.0 removed error handling code in createPropertyPath, restructured SQL injection parameterization, and made `invalidWhereValuesBehavior` default to "throw"
- **Reason:** removal of error handling in createPropertyPath and query parameterization changes could affect what errors are thrown; postconditions need re-validation against v1.0
- **Queued in:** `work-packages/version-drift/needs-review.md` (sweep 2026-06-11)
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-03 — backfilled

- **Verified against:** typeorm@>=0.3.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
