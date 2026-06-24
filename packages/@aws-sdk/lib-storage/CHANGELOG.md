# CHANGELOG — @aws-sdk/lib-storage

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100%

- **Profile:** `packages/@aws-sdk/lib-storage/contract.yaml`
- **Package version inspected:** @aws-sdk/lib-storage@3.1075.0
- **API surface re-verified:** unchanged from 3.x baseline — `Upload` class still exposes exactly two async-callable methods (`done()`, `abort()`); `on()` returns `this` (sync); constructor sync.
- **Functions added:** none (surface unchanged, all functions already contracted)
- **Postconditions added:** 2 (both attached to `done()`)
  - `upload-done-exceeds-max-parts` — `Error("Exceeded 10000 parts in multipart upload ...")` thrown when `fileSize / partSize > MAX_PARTS`. Default partSize=5MB caps file at ~48.8 GB without explicit tuning. (warning)
  - `upload-done-missing-etag-cors` — `Error("Part N is missing ETag in UploadPart response. Missing Bucket CORS configuration for ETag header?")` thrown when UploadPart response lacks ETag, almost always a browser-upload CORS misconfig. (error)
- **Fixtures added:** 4 cases (2 SHOULD_FIRE + 2 SHOULD_NOT_FIRE) covering the two new postconditions
- **Functions intentionally omitted this pass:** `on('httpUploadProgress')` — synchronous event registration returning `this`; no error contract (unchanged from prior passes)
- **Scanner concerns queued:** 2 (`concern-20260624-aws-sdk-lib-storage-deepen-1`, `concern-20260624-aws-sdk-lib-storage-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/aws/aws-sdk-js-v3/main/lib/lib-storage/src/Upload.ts
  - https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
  - https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html
  - Source inspection: `node_modules/@aws-sdk/lib-storage@3.1075.0/dist-cjs/index.js` (lines 330, 385)
- **Verified by:** bc-deepen-contract (drift-by-staleness re-verification, deepen-stream-2 pass 50 on 2026-06-24T05:43:32Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/lib-storage@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/lib-storage@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/lib-storage@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/lib-storage@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/lib-storage@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/lib-storage@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
