# CHANGELOG — @hubspot/api-client

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <12.0.0` → `>=1.0.0 <14.0.0`
- **Verdict:** no error-handling-relevant changes in v12 or v13 — API method renames and structural reorganization only; ApiException error-handling patterns unchanged
- **Changelog evidence:** v13.0.0: moved/renamed methods across API classes, renamed archiveGDPR() to _delete() — no changes to error types, ApiException behavior, or HTTP error surfacing
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-16 — backfilled

- **Verified against:** @hubspot/api-client@>=1.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
