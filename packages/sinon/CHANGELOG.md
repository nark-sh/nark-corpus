# CHANGELOG — sinon

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 73% → 80%

- **Profile semver:** `>=1.0.0` (unchanged)
- **Package version verified against:** sinon@22.0.0
- **Scanner version used:** nark@3.1.0
- **Performed by:** bc-deepen-contract (deepen-stream-3 pass 10)
- **Functions added (4):** `define`, `verify`, `verifyAndRestore`, `restoreObject`
- **New postconditions (4):**
  - `define-existing-property-throws` — sandbox.define on already-defined property → TypeError
  - `verify-unmet-expectation-throws` — bare sandbox.verify() without try/finally skips restore on failure (SILENT_FAILURE for subsequent tests)
  - `verify-and-restore-expectation-throws` — verifyAndRestore() ExpectationError swallowed in catch block (SILENT_FAILURE — failing mocks pass CI)
  - `restore-object-falsy-input-throws` — sinon.restoreObject(undefined|null|...) → Error
- **Coverage:** 8 → 12 contracted functions; raw 8/11 = 0.73 → 12/15 = 0.80; effective 12/12 = 1.0
- **Source verification:** sinon@22.0.0 `src/create-sinon-api.js`, `src/sinon/sandbox.js` lines 403-432 (define), `src/sinon/sandbox.js` sandbox.verify/verifyAndRestore implementation, `src/sinon/restore-object.js` line 5 (falsy throw)
- **Scanner concerns queued:** concern-20260623-sinon-deepen-stream3-pass10-1 through -4 (upgrade-concerns.json #3079-3082)
- **Fixtures added:** 13 new test cases in `fixtures/ground-truth.ts` (5 violations, 8 clean)
- **Note:** Existing 8-function contract (stub, spy, mock, useFakeTimers, createSandbox, createStubInstance, fake, replace) re-verified against v22.0.0 source — no changes needed. v22 introduced sandbox isolation fix (#2704) and __proto__ walk exclusion (#2699), neither affecting the user-facing throw contracts. 3 intentional omissions retained: `promise` (testing utility, throws only on double-resolve), `replaceGetter`/`replaceSetter` (narrow accessor variants, same throw shape as replace).

## 2026-06-18 — re-verified clean

- **Latest published:** sinon@22.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** sinon@22.0.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** sinon@22.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** sinon@22.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** sinon@22.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** sinon@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
