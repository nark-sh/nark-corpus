# CHANGELOG — @trigger.dev/sdk

## 2026-06-25 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 57% → 82% raw (effective 100%, +12 functions)

- **Profile:** `packages/@trigger.dev/sdk/contract.yaml`
- **Functions added:** envvars-upload, envvars-create, envvars-update, envvars-del, prompts-resolve, prompts-promote, prompts-create-override, idempotency-keys-create, streams-read, streams-append, batch-retrieve, usage-measure (12 total)
- **Postconditions added:** 12 (one per function)
- **Pattern applied:** composable-middleware-misclassified-as-sync-factory — prior passes treated envvars/prompts/idempotencyKeys/streams/batch/usage as "namespace factories" and omitted their methods as sync. These namespaces are actually sync OBJECTS whose METHODS are async and throw the full ApiError hierarchy. Each method is now a first-class contracted function.
- **Functions intentionally omitted this pass:** models.list/models.retrieve (read-only GETs); configure/logger/tracer/locals/heartbeats (sync helpers or internal OTEL shims); waitUntil (returns void, no error contract).
- **Scanner concerns queued:** 12 (`concern-20260624-trigger-dev-sdk-deepen-12` through `-23`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://trigger.dev/docs/management/envvars/import
  - https://trigger.dev/docs/management/envvars/create
  - https://trigger.dev/docs/management/envvars/update
  - https://trigger.dev/docs/management/envvars/delete
  - https://trigger.dev/docs/realtime/streams
  - https://trigger.dev/docs/idempotency
  - https://trigger.dev/docs/management/batch/retrieve
  - https://trigger.dev/docs/run-usage
  - Source inspection of `@trigger.dev/sdk@4.4.6` dist files:
    - `dist/commonjs/v3/envvars.js` (sync arg-validation throws + async ApiError hierarchy)
    - `dist/commonjs/v3/promptManagement.js` (apiClient.zodFetch wrappers)
    - `dist/commonjs/v3/streams.js` (sync target-run-id throw + async stream-write apiClient)
    - `dist/commonjs/v3/batch.js` (apiClient.retrieveBatch wrapper)
    - `@trigger.dev/core/dist/commonjs/v3/idempotencyKeys.js` (Promise<IdempotencyKey>)
- **Verified by:** bc-deepen-contract (pass 82 by deepen-stream-3, 2026-06-24)


## 2026-06-18 — deepen pass — coverage 79% → 100% effective (raw 22/44 → 25/44)

- **Profile:** `packages/@trigger.dev/sdk/contract.yaml`
- **Functions added:** webhooks.constructEvent, wait.forToken, query.execute (3 new high-impact APIs from 4.x surface re-enumeration)
- **Postconditions added:** 5 (constructevent-no-try-catch, constructevent-swallowed-returns-200, fortoken-called-outside-task, fortoken-unwrap-timeout-unhandled, query-execute-no-try-catch)
- **Functions intentionally omitted this pass:** schedules.timezones (read-only static data); wait.listTokens/retrieveToken (read-only inherit from wait.createToken); promptManagement.* (preview API, low adoption); ai.tool / hooks.* / cache.createCache (registration/factory APIs, not async-callable); envvars.* (admin/CI ops, prior omission preserved); usage.measure (utility wrapper).
- **Scanner concerns queued:** 5 (`concern-20260618-trigger-dev-sdk-deepen-1` through `-5`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://trigger.dev/docs/wait-for-token
  - Source inspection of `@trigger.dev/sdk@4.4.6` dist files:
    - `dist/commonjs/v3/webhooks.js` (WebhookError class + constructEvent throws)
    - `dist/commonjs/v3/wait.js` (forToken sync-throw outside task, .unwrap() throws on timeout)
    - `dist/commonjs/v3/query.js` (apiClientManager.clientOrThrow() + executeQuery())
- **Verified by:** bc-deepen-contract (pass 4 by deepen-stream-1, 2026-06-18T21:31:22Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @trigger.dev/sdk@4.4.6
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @trigger.dev/sdk@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
