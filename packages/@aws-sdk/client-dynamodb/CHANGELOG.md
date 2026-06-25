# CHANGELOG — @aws-sdk/client-dynamodb

## 2026-06-25 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1075.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 78% → 100%

- **Profile:** `packages/@aws-sdk/client-dynamodb/contract.yaml`
- **Functions added:** waitUntilTableExists (covers the entire waitUntil* family — 6 helpers: Table[Not]Exists, ContributorInsightsEnabled, Export/Import Completed, KinesisStreamingDestinationActive)
- **Postconditions added:** 2 (aws-dynamodb-wait-until-table-exists-no-try-catch, aws-dynamodb-wait-until-abort-not-distinguished)
- **Functions intentionally omitted this pass:** the 6 deprecated waitFor* siblings — AWS marks them `@deprecated` with rationale "does not throw error in non-success cases"; they return `WaiterResult.state` instead of throwing, requiring a different (caller-inspects-state) contract that AWS itself recommends migrating away from.
- **Scanner concerns queued:** 2 (`concern-20260623-aws-sdk-client-dynamodb-deepen-7`, `concern-20260623-aws-sdk-client-dynamodb-deepen-8`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `@smithy/core/dist-es/submodules/client/util-waiter/waiter.js` (checkExceptions lines 14-35 — source of truth for AbortError / TimeoutError throw)
  - `@aws-sdk/client-dynamodb@3.1075.0/dist-types/waiters/*.d.ts` (6 waitUntil* + 6 deprecated waitFor* enumerated)
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-dynamodb/Class/DynamoDB/
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-waiter/
- **Rationale for revisit:** the 2026-04-16 pass omitted `waitUntilTableExists` / `waitUntilTableNotExists` as "infrastructure waiter — not called in SaaS app runtime code." That classification was incomplete: serverless tenant-provisioning paths (Lambda cold-start awaiting per-tenant table ACTIVE) and runtime Export/Import workflows triggered from API endpoints both call waitUntil* in production code paths. The pattern is the same as `@aws-sdk/client-s3` (deepened pass 23, 2026-06-23) where waitUntilBucketExists / waitUntilBucketNotExists got the same treatment.
- **Verified by:** bc-deepen-contract (pass 24 on 2026-06-23T20:00:00Z, deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-dynamodb@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-dynamodb@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
