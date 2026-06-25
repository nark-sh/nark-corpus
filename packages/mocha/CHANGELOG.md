# CHANGELOG — mocha

## 2026-06-25 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:** >=8.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100%

- **Profile:** `packages/mocha/contract.yaml`
- **Functions added:** Mocha.runGlobalSetup, Mocha.runGlobalTeardown (2 total)
- **Postconditions added:** 2 (run-global-setup-fixture-rejects, run-global-teardown-fixture-rejects)
- **Functions intentionally omitted this pass:** TDD aliases (suiteSetup/suiteTeardown/setup/teardown) — identical contracts to before/after/beforeEach/afterEach
- **Scanner concerns queued:** 2 (`concern-20260624-mocha-deepen-1`, `concern-20260624-mocha-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Verified against:** mocha@11.7.6
- **Sources fetched:** https://legacy.mochajs.org/api/mocha, https://mochajs.org/features/global-fixtures/
- **Source evidence:** node_modules/mocha/lib/mocha.js lines 1161-1208 (runGlobalSetup/runGlobalTeardown/_runGlobalFixtures), 1004-1024 (runAsync no-catch pattern)
- **Coverage accounting:** contract had 9 contracted / 10 total / 1 omitted = 9/9 = 100%; this pass surfaced 2 previously-missed async methods (globalSetup/globalTeardown auto-invoked by run()), bringing totals to 11 contracted / 12 total / 1 omitted = 11/11 = 100%. The 100->100 reflects denominator + numerator both growing.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T10:57:46Z, deepen-stream-2 pass 81)

## 2026-06-18 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:** `>=8.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:** >=8.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:** `>=8.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:** `>=8.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mocha@11.7.6
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** mocha@>=8.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
