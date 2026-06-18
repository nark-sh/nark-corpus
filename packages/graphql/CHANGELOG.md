# CHANGELOG — graphql

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-18 — deepen pass — coverage 75% → 80%

- **Profile:** `packages/graphql/contract.yaml`
- **Functions added:** experimentalExecuteIncrementally, legacyExecuteIncrementally (2 total)
- **Postconditions added:** 5
  - `execute()` +1: execute-abort-signal-rejection (v17 AbortedGraphQLExecutionError + abortSignal arg)
  - `experimentalExecuteIncrementally()` +2: experimental-incremental-result-not-discriminated, experimental-incremental-abort-signal-rejection
  - `legacyExecuteIncrementally()` +2: legacy-incremental-result-not-discriminated, legacy-incremental-abort-signal-rejection
- **Functions intentionally omitted this pass:** executeRootSelectionSet / experimentalExecuteRootSelectionSet / legacyExecuteRootSelectionSet (internal helpers for pre-validated args), mapSourceToResponseEvent (low-level subscription stream helper covered by subscribe), validateExecutionArgs / validateSubscriptionArgs (sync, only throw on invalid schema — startup-time deployment bugs not runtime errors)
- **Scanner concerns queued:** 4 (`concern-20260618-graphql-deepen-1` through `concern-20260618-graphql-deepen-4`) — execute-abort detection, experimental-incremental detection, legacy-incremental detection, cross-cutting discriminated-union pattern
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - node_modules/graphql@17.0.1/execution/execute.d.ts (lines 56-95 — execute + experimentalExecuteIncrementally signatures)
  - node_modules/graphql@17.0.1/execution/legacyIncremental/legacyExecuteIncrementally.d.ts (line 136 — return type)
  - node_modules/graphql@17.0.1/execution/AbortedGraphQLExecutionError.d.ts (lines 7-32 — class signature + abortedResult getter)
  - node_modules/graphql@17.0.1/execution/Executor.js (lines 159-168 — finish() throws AbortedGraphQLExecutionError)
  - node_modules/graphql@17.0.1/execution/ExecutionArgs.d.ts (line 34 — abortSignal field)
  - node_modules/graphql@17.0.1/execution/incremental/IncrementalPublisher.js (lines 14-25 — subsequentResults.throw on abort)
  - https://github.com/graphql/graphql-spec/pull/742 (incremental delivery RFC)
- **Verified by:** bc-deepen-contract (pass on 2026-06-18T21:25:00Z)

Closes the "Future deepen-pass candidate" callout left by the 2026-06-15 drift sweep ("add postconditions for partial-result-on-abort behavior in v17+").

## 2026-06-18 — re-verified clean

- **Latest published:** graphql@17.0.1
- **Profile semver:** `>=16.0.0 <18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** graphql@17.0.1
- **Profile semver:** >=16.0.0 <18.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** graphql@17.0.0
- **Profile semver:** `>=16.0.0 <18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — semver range extended

- **Latest published:** graphql@17.0.0
- **Profile semver:** `>=16.0.0 <17.0.0` → `>=16.0.0 <18.0.0`
- **Verdict:** no error-handling-relevant changes between v16 and v17 — extended range
- **Changelog evidence:** v17.0.0 (2026-06-15) is the first stable v17, accumulating changes from alphas (since 2022-05). Breaking changes are: ESM-only packaging, dropped Node 12/17 support, removed deprecated APIs (getOperationRootType, graphql/subscription module, *Enum types, positional GraphQLError args, printError/formatError). NEW features: tracing channels (PR #4670), partial-result-on-abort (PR #4674), Object.create(null) for prototype safety (PR #4634). All 10 documented postconditions still apply: graphql() still returns errors not throws; subscribe() still returns discriminated union; parse/buildSchema still throw GraphQLError/Error respectively. Future deepen-pass candidate: add postcondition for partial-result-on-abort behavior in v17+.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** graphql@16.14.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** graphql@>=16.0.0 <17.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
