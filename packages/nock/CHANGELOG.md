# CHANGELOG — nock

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 89% → 91%

- **Profile:** `packages/nock/contract.yaml`
- **Functions added:** define, recorder.rec (2 total)
- **Postconditions added:** 4 (define-method-required, define-reply-not-numeric, define-mismatched-port, rec-already-in-progress)
- **Functions intentionally omitted this pass:** isActive / isDone (top-level) / pendingMocks / activeMocks (sync read accessors, no throws); enableNetConnect (defaults to /.*/ for invalid args); removeInterceptor (sync boolean, no throws); abortPendingRequests (sync void, no throws); recorder.clear / recorder.play (sync, no throws); Scope.persist / Scope.filteringPath / Scope.filteringRequestBody (arg-validation throws at builder level)
- **Scanner concerns queued:** 2 (`concern-20260624-nock-deepen-1`, `concern-20260624-nock-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/nock/nock#saving-and-loading-interceptors, https://github.com/nock/nock#recording, https://github.com/nock/nock/blob/main/lib/recorder.js (cross-referenced against installed nock@14.0.15 source: lib/scope.js define() and lib/recorder.js record())
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 68 on 2026-06-24T10:26Z)

## 2026-06-18 — re-verified clean

- **Latest published:** nock@14.0.15
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** nock@14.0.15
- **Profile semver:** >=9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** nock@14.0.15
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** nock@14.0.15
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** nock@14.0.15
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** nock@>=9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
