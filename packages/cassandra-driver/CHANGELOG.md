# CHANGELOG — cassandra-driver

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 50% -> 63%

- **Profile:** `packages/cassandra-driver/contract.yaml`
- **Functions added:** mapping.Mapper.batch, metadata.Metadata.getTable, metadata.Metadata.refreshKeyspaces (3 total)
- **Postconditions added:** 5 (mapper-batch-no-try-catch, mapper-batch-lwt-not-checked, metadata-gettable-no-try-catch, metadata-gettable-null-not-checked, metadata-refreshkeyspaces-no-try-catch)
- **Functions intentionally omitted this pass:** Mapper.forModel (sync factory), Metadata.getAggregate/getAggregates/getFunction/getFunctions/getMaterializedView/getTrace/getUdt/refreshKeyspace (identical error profile to getTable/refreshKeyspaces, narrow adoption)
- **Scanner concerns queued:** 4 (`concern-20260623-cassandra-driver-deepen-1` namespace disambiguation for Mapper.batch vs Client.batch, `concern-20260623-cassandra-driver-deepen-2` mapper-batch LWT detector, `concern-20260623-cassandra-driver-deepen-3` metadata.getTable detector, `concern-20260623-cassandra-driver-deepen-4` metadata.refreshKeyspaces detector)
- **Scanner version used:** nark@3.2.0
- **API surface:** 24 Promise-returning methods total — 15 contracted (62.5%), 8 intentionally omitted, 1 functional gap (the Mapper.batch fires as Client.batch). Effective contracted-of-non-omitted ratio = 15/16 = 0.94 (matches the coverage_score the prior pass used for its denominator-of-in-scope count).
- **Sources fetched:** https://docs.datastax.com/en/developer/nodejs-driver/4.6/features/mapper/, https://docs.datastax.com/en/developer/nodejs-driver/4.6/features/batch/, https://docs.datastax.com/en/developer/nodejs-driver/4.6/api/module.metadata/class.Metadata/ (Errors sections empty — supplemented with source inspection of node_modules/cassandra-driver@4.9.0/lib/mapping/mapper.js and lib/metadata/index.js)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 21 on 2026-06-23T20:00:00.000Z)


## 2026-06-18 — re-verified clean

- **Latest published:** cassandra-driver@4.9.0
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** cassandra-driver@4.9.0
- **Profile semver:** >=4.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** cassandra-driver@4.9.0
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** cassandra-driver@4.9.0
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** cassandra-driver@4.9.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-14 — backfilled

- **Verified against:** cassandra-driver@>=4.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
