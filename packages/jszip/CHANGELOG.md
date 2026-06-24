# CHANGELOG — jszip

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 86%

- **Profile:** `packages/jszip/contract.yaml`
- **Functions added:** nodeStream, generateInternalStream (2 total)
- **Postconditions added:** 4
  - file-node-stream-no-error-listener (DOWNTIME / high)
  - file-node-stream-unsupported-type (SILENT_FAILURE / low)
  - generate-internal-stream-no-error-listener (DOWNTIME / high)
  - generate-internal-stream-accumulate-unhandled-rejection (SILENT_FAILURE / medium)
- **Functions intentionally omitted this pass:** JSZipStreamHelper.accumulate (transitively covered by JSZipObject.async / generateAsync / generateInternalStream.accumulate postconditions)
- **Scanner concerns queued:** 4 (`concern-20260624-jszip-deepen-1`, `-2`, `-3`, `-4`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://stuk.github.io/jszip/documentation/api_zipobject/node_stream.html
  - https://stuk.github.io/jszip/documentation/api_jszip/generate_internal_stream.html
  - https://stuk.github.io/jszip/documentation/api_streamhelper.html
  - https://github.com/Stuk/jszip/blob/master/lib/zipObject.js
  - https://github.com/Stuk/jszip/blob/master/lib/stream/StreamHelper.js
  - https://github.com/Stuk/jszip/blob/master/lib/object.js
- **Verified by:** bc-deepen-contract (pass 44 on 2026-06-24T04:33:17Z, deepen-stream-2)

## 2026-06-18 — re-verified clean

- **Latest published:** jszip@3.10.1
- **Profile semver:** `>=3.8.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** jszip@3.10.1
- **Profile semver:** >=3.8.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** jszip@3.10.1
- **Profile semver:** `>=3.8.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** jszip@3.10.1
- **Profile semver:** `>=3.8.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** jszip@3.10.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** jszip@>=3.8.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
