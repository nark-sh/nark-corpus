# CHANGELOG — @aws-sdk/client-s3

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 88% → 100%

- **Profile:** `packages/@aws-sdk/client-s3/contract.yaml`
- **Functions added:** waitUntilObjectNotExists, waitUntilBucketNotExists (2 total)
- **Postconditions added:** 3 (s3-object-not-exists-waiter-timeout-not-handled, s3-object-not-exists-waiter-abort-not-handled, s3-bucket-not-exists-waiter-timeout-not-handled)
- **Functions intentionally omitted this pass:** RenameObjectCommand (S3 Express One Zone — same rationale as already-omitted CreateSessionCommand)
- **Scanner concerns queued:** 2 (`concern-20260623-aws-sdk-client-s3-deepen-1`, `concern-20260623-aws-sdk-client-s3-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `@smithy/core/dist-types/submodules/client/util-waiter/waiter.d.ts` (WaiterState enum)
  - `@smithy/core/dist-es/submodules/client/util-waiter/waiter.js` (checkExceptions throws TimeoutError / AbortError by `error.name`)
  - `node_modules/@aws-sdk/client-s3/dist-types/waiters/waitForObjectNotExists.d.ts` (waitUntilObjectNotExists signature)
  - `node_modules/@aws-sdk/client-s3/dist-types/waiters/waitForBucketNotExists.d.ts` (waitUntilBucketNotExists signature)
- **Verified by:** bc-deepen-contract (pass 23, deepen-stream-3, 2026-06-23T00:50:Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-s3@3.1072.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-s3@3.1070.0
- **Profile semver:** ^3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-s3@3.1069.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-s3@3.1069.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-s3@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-06 — backfilled

- **Verified against:** @aws-sdk/client-s3@^3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
