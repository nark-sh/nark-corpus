# CHANGELOG — yup

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 71% → 78%

- **Profile:** `packages/yup/contract.yaml`
- **Functions added:** `~standard.validate` (1 total)
- **Postconditions added:** 1 (`standard-validate-infrastructure-error-rethrows`)
- **Functions intentionally omitted this pass:** `isValidSync` (sync equivalent of isValid; same re-throw caveat); `reach` (sync schema-path utility; throws Error for invalid paths but is a developer-time build helper, no async error contract)
- **Scanner concerns queued:** 1 (`concern-20260623-yup-deepen-stream2-1`)
- **Scanner version used:** nark@3.1.0
- **Package version verified:** yup@1.7.1
- **Contract version bump:** 1.1.0 → 1.2.0
- **Effective coverage:** 7/7 non-omitted = 100% (raw: 7/9 = 78%)
- **Sources fetched:**
  - node_modules/yup/index.js lines 1189-1213 (Schema.~standard getter — try/catch re-throw)
  - node_modules/yup/index.js lines 2566-2585 (Lazy.~standard getter — same try/catch re-throw)
  - node_modules/yup/README.md lines 476-478 (Standard Schema Support)
  - https://github.com/standard-schema/standard-schema
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T20:51:39Z by deepen-stream-2 pass 8)

## 2026-06-18 — re-verified clean

- **Latest published:** yup@1.7.1
- **Profile semver:** `>=0.32.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** yup@1.7.1
- **Profile semver:** >=0.32.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** yup@1.7.1
- **Profile semver:** `>=0.32.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** yup@1.7.1
- **Profile semver:** `>=0.32.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** yup@1.7.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** yup@>=0.32.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
