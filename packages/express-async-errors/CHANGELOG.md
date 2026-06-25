# CHANGELOG — express-async-errors

## 2026-06-25 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 82% → 92%

- **Profile:** `packages/express-async-errors/contract.yaml`
- **Functions added:** require (2 new postconditions on the side-effect require: callback-based-middleware-not-caught, noop-fallback-silent-swallow)
- **Postconditions added:** 2
- **Functions intentionally omitted this pass:** function.length preservation (impl detail, already correct in source); typescript-no-misused-promises lint (issue #35, not a runtime error-handling contract)
- **Scanner concerns queued:** 2 (`concern-20260624-express-async-errors-deepen-1`, `concern-20260624-express-async-errors-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/davidbanham/express-async-errors/issues/46 (multer callback)
  - https://github.com/davidbanham/express-async-errors/issues/35 (TS lint, intentionally omitted)
  - node_modules/express-async-errors@3.1.1/index.js (47-line source, noop fallback line 17)
- **Verified by:** bc-deepen-contract (pass 74 by deepen-stream-2 on 2026-06-24T09:44:14Z)

## 2026-06-18 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** express-async-errors@3.1.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** express-async-errors@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
