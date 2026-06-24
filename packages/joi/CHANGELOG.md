# CHANGELOG — joi

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 87.5%

- **Profile:** `packages/joi/contract.yaml`
- **Functions added:** extend, defaults (2 total)
- **Postconditions added:** 5
  - extend-empty-extensions-throws (warning)
  - extend-invalid-extension-shape-throws (error)
  - extend-override-existing-type-throws (warning)
  - defaults-non-function-modifier-throws (warning)
  - defaults-modifier-returns-non-schema-throws (error)
- **Functions intentionally omitted this pass:** none (checkPreferences remains omitted from prior pass — low-level utility with near-zero real-world usage)
- **Scanner concerns queued:** 0 (existing scanner detector already catches bare extend/defaults calls without try-catch)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/hapijs/joi/master/API.md
  - https://github.com/hapijs/joi/blob/master/lib/index.js
  - https://github.com/hapijs/joi/blob/master/lib/schemas.js
- **Verified by:** bc-deepen-contract pass=63 by deepen-stream-3 (2026-06-24T09:51:53Z)

## 2026-06-18 — re-verified clean

- **Latest published:** joi@18.2.3
- **Profile semver:** `>=17.0.0 <19.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** joi@18.2.3
- **Profile semver:** >=17.0.0 <19.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** joi@18.2.1
- **Profile semver:** `>=17.0.0 <19.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** joi@18.2.1
- **Profile semver:** `>=17.0.0 <19.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** joi@18.2.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** joi@>=17.0.0 <19.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
