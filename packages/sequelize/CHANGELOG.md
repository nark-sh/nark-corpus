# CHANGELOG — sequelize

## 2026-06-25 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:** >=6.28.1 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (+1 function)

- **Profile:** `packages/sequelize/contract.yaml`
- **Functions added:** instance.decrement (1 total)
- **Postconditions added:** 1 (`instance-decrement-db-error`) + 1 edge_case (`instance-decrement-no-floor-check`)
- **Functions intentionally omitted this pass:** none new this pass; pre-existing omissions retained (databaseVersion, set, createSchema, showAllSchemas, dropSchema, dropAllSchemas, Sequelize.truncate, Sequelize.drop, Sequelize.validate, Model.drop, Model.sync)
- **Scanner concerns queued:** 1 (`concern-20260624-sequelize-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://sequelize.org/docs/v6/core-concepts/model-instances/#incrementing-and-decrementing-integer-values, sequelize@6.37.8 type definitions (types/model.d.ts line 3260)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T08:28:46Z)
- **Note:** instance.decrement was the natural twin gap to instance.increment (added in pass 65). Static Model.decrement is covered; the instance-method variant was missing. Added instance-decrement-no-floor-check edge_case for the common production bug of decrementing past zero on credit/inventory/quota counters.

## 2026-06-18 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:** `>=6.28.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:** >=6.28.1 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:** `>=6.28.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:** `>=6.28.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** sequelize@6.37.8
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** sequelize@>=6.28.1
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
