# CHANGELOG — @aws-sdk/client-sqs

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (depth, not breadth)

- **Profile:** `packages/@aws-sdk/client-sqs/contract.yaml`
- **Pass:** deepen-stream-2 pass 48 (drift-by-staleness mode)
- **Latest published:** @aws-sdk/client-sqs@3.1075.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Surface re-enumeration:** 24 commands, 28 error classes — unchanged since 2026-04-16; no new exceptions introduced
- **Functions added:** none (already at 9/9 contractable coverage; this pass deepened an existing function)
- **Postconditions added:** 1
  - `sqs-send-batch-invalid-entry-id` on `send (SendMessageBatchCommand)` — covers the previously-uncovered `InvalidBatchEntryId` throw path when `entry.Id` doesn't match `[A-Za-z0-9_-]{1,80}`. Distinct from the already-covered `BatchEntryIdsNotDistinct` (duplicates). Common bug: callers leak database UUIDs or upstream message IDs containing `.` / `/` / `:` into `entry.Id`, rejecting the ENTIRE batch with zero partial success.
- **Functions intentionally omitted this pass:** unchanged from prior pass (15 admin/list ops)
- **Scanner concerns queued:** 1 (`concern-20260624-aws-sqs-deepen-invalid-entry-id`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatch.html`
  - `https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatchRequestEntry.html`
  - Installed dist-types: `node_modules/@aws-sdk/client-sqs/dist-types/commands/SendMessageBatchCommand.d.ts` (confirmed `@throws {@link InvalidBatchEntryId}` annotation)
- **Verified by:** bc-deepen-contract (pass at 2026-06-24T05:24:24Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-sqs@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-sqs@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-sqs@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-sqs@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-sqs@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-sqs@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
