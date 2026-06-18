# CHANGELOG — @trigger.dev/sdk

All notable verification, deepen, and fork events for this profile. Newest first.


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
