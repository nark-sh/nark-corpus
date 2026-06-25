# CHANGELOG — node-fetch

## 2026-06-25 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 83% → 100%

- **Profile:** `packages/node-fetch/contract.yaml`
- **Functions added:** response.formData, blobFrom, fileFrom (3 total)
- **Postconditions added:** 5 (response-formdata-throws-on-missing-content-type, response-formdata-throws-on-stream-error, response-formdata-throws-on-body-used, blobfrom-rejects-on-fs-stat-failure, filefrom-rejects-on-fs-stat-failure)
- **Functions intentionally omitted this pass:** response.buffer() (deprecated alias for arrayBuffer); blobFromSync/fileFromSync (sync, no Promise); isRedirect / Response.error / Response.redirect / Response.json (sync static helpers); Headers/Request/Response constructors and methods (sync data-shape helpers)
- **Scanner concerns queued:** 3 (`concern-20260623-node-fetch-deepen-1`, `concern-20260623-node-fetch-deepen-2`, `concern-20260623-node-fetch-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/node-fetch@3.3.2/@types/index.d.ts, node_modules/node-fetch@3.3.2/src/body.js (formData impl + consumeBody), node_modules/fetch-blob/from.js (blobFrom/fileFrom impl), https://github.com/node-fetch/node-fetch/blob/main/docs/ERROR-HANDLING.md, https://github.com/node-fetch/node-fetch/blob/main/README.md
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T23:25:04Z)
- **Metadata bumps:** contract_version 1.2.0 → 1.3.0, last_verified 2026-04-03 → 2026-06-23, coverage_score 0.83 → 1.0

## 2026-06-18 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** node-fetch@3.3.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-03 — backfilled

- **Verified against:** node-fetch@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
