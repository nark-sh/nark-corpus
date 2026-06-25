# CHANGELOG — supertest

## 2026-06-25 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:** >=4.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verify, no surface change)

- **Profile:** `packages/supertest/contract.yaml`
- **Installed version inspected:** supertest@7.2.2 (within `>=4.0.0 <8.0.0`)
- **Functions added:** none (0 total) — API surface unchanged from 2026-04-18 pass
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** unchanged from prior pass (HTTP verb aliases on Test/TestAgent, synchronous cookies assertion helpers, TestAgent.host/del aliases, bearer header setter)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/supertest/index.js, node_modules/supertest/lib/agent.js, node_modules/supertest/lib/test.js, node_modules/supertest/lib/cookies/{index,assertion}.js
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T10:43:42Z, deepen-stream-3 pass 69)

## 2026-06-18 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:** >=4.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** supertest@7.2.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** supertest@>=4.0.0 <8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
