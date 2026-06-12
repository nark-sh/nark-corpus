# CHANGELOG — stripe

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — re-verified clean

- **Latest published:** stripe@22.2.0
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged — covered by stripe-v21 fork for v21+)
- **Verdict:** no action needed on parent profile — stripe-v21/contract.yaml (semver `>=21.0.0`) already covers v21 and v22 with open-ended range. v22 changelog reviewed: only new API resources added, no error-handling changes since v21. stripe-v21 profile covers the full current surface.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-18 — backfilled

- **Verified against:** stripe@>=8.0.0 <21.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
