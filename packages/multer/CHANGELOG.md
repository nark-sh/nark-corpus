# CHANGELOG — multer

## 2026-06-25 — re-verified clean

- **Latest published:** multer@2.2.0
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — drift-deepen pass — coverage 86% → 86%

- **Profile:** `packages/multer/contract.yaml`
- **Functions added:** none (re-enumerated multer@2.2.0; no new exports since 2026-04-16)
- **Postconditions added:** 1 (fields-throws-multer-error-field-limits — covers MISSING_FIELD_NAME, LIMIT_FIELD_KEY, LIMIT_FIELD_VALUE, LIMIT_FIELD_NESTING, LIMIT_PART_COUNT, LIMIT_FIELD_COUNT)
- **Edge cases added:** 1 (fields-nesting-depth-dos-prevention — DoS protection per README Security section)
- **Functions intentionally omitted this pass:** memoryStorage (re-confirmed: concat-stream callback in storage/memory.js has no error path; OOM is process-level, not catchable per-upload)
- **Scanner concerns queued:** 1 (`concern-20260624-multer-deepen-fields-limits-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/expressjs/multer/blob/master/lib/multer-error.js
  - https://github.com/expressjs/multer/blob/master/lib/make-middleware.js
  - https://github.com/expressjs/multer/blob/master/README.md#limits
  - https://github.com/expressjs/multer/blob/master/README.md#security
- **contract_version:** 1.1.0 → 1.2.0
- **Verified by:** bc-deepen-contract pass 46 (deepen-stream-3, 2026-06-24T06:26:28Z)

## 2026-06-18 — re-verified clean

- **Latest published:** multer@2.2.0
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** multer@2.2.0
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** multer@2.2.0
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** multer@2.2.0
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** multer@2.1.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** multer@>=2.0.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
