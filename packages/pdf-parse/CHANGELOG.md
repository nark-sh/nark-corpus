# CHANGELOG — pdf-parse

## 2026-06-25 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 88% -> 88% (re-verification, no new functions)

- **Profile:** `packages/pdf-parse/contract.yaml`
- **API surface re-enumerated against:** pdf-parse@2.4.5
- **Functions added:** none (re-verification pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `PDFParse.destroy` (cleanup-only, no throw path), `PDFParse.setWorker` (sync static), `PDFParse.isNodeJS` (sync getter), `getException` (sync error normalizer), `setDefaultParseParameters` (sync utility)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** declaration files in `node_modules/pdf-parse/dist/pdf-parse/esm/PDFParse.d.ts`, `dist/pdf-parse/cjs/index.d.cts`, `dist/node/cjs/index.d.cts`, `dist/worker/esm/index.d.ts`, and `README.md`
- **Notes:** v1 `pdf()` default export confirmed gone in v2.x (Object.keys(require('pdf-parse')) returned 16 class/utility exports, none is a callable default). v1 function entry retained in contract for historical clarity but is unreachable under declared semver. The 7 contracted async methods (getInfo / getText / getImage / getScreenshot / getTable / getHeader / destroy-omitted) all still exist with same Promise return shapes. No new async APIs introduced through 2.4.5.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 57 on 2026-06-24T07:01:25Z)

## 2026-06-18 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** pdf-parse@2.4.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** pdf-parse@>=2.0.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
