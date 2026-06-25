# CHANGELOG — pg

## 2026-06-25 — re-verified clean

- **Latest published:** pg@8.22.0
- **Profile semver:** >=8.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 83% → 83% (postcondition depth +9)

- **Profile:** `packages/pg/contract.yaml`
- **Latest published:** pg@8.22.0 (verified from npm 2026-06-23)
- **Profile semver:** `>=8.0.0` (unchanged)
- **Functions added:** none (function-level coverage unchanged at 5/6 — copyFrom/copyTo remain intentionally omitted as narrow-adoption ETL streams)
- **Postconditions added:** 9
  - `query.null-undefined-query-throws` (pg/lib/client.js:632 — sync TypeError on null query)
  - `query.pool-query-function-arg-rejects` (pg-pool/index.js:436)
  - `query.query-read-timeout` (pg/lib/client.js:665 — per-query timeout API added in pg@8.13.0)
  - `query.database-error-canonical-type` (best-practice DatabaseError instanceof check, re-exported from pg-protocol)
  - `connect.client-reuse-after-connect` (pg/lib/client.js:154)
  - `connect.pool-connect-after-end` (pg-pool/index.js:192 — distinct from pool-query-after-end)
  - `connect.pool-onconnect-hook-fails` (pg-pool/index.js:288-303 — onConnect lifecycle hook added in pg@8.20.0)
  - `connect.connection-terminated-during-timeout` (pg-pool/index.js:276 — distinct TCP/TLS-handshake timeout class)
  - `connect.sslnegotiation-direct-requires-ssl` (pg/lib/connection-parameters.js:111 — added in pg@8.22.0 for PG 17+ direct TLS negotiation)
- **Functions intentionally omitted this pass:** copyFrom, copyTo (streaming bulk COPY operations for ETL — narrow adoption in SaaS code)
- **Scanner concerns queued:** 0 (all new postconditions are missing-try-catch variants of already-detected functions; no novel detector patterns required)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://node-postgres.com/announcements (changelog for 8.13/8.20/8.22)
  - https://github.com/brianc/node-postgres/blob/master/lib/client.js (verified locally against installed pg@8.22.0)
  - https://github.com/brianc/node-postgres/blob/master/packages/pg-pool/index.js (verified locally against installed pg-pool@latest)
  - https://github.com/brianc/node-postgres/blob/master/lib/connection-parameters.js
  - https://github.com/brianc/node-postgres/blob/master/packages/pg-protocol/src/messages.ts (DatabaseError re-export)
- **Version drift covered:**
  - pg@8.20.0: onConnect callback hook in PoolConfig (new error-propagation path)
  - pg@8.22.0: sslnegotiation=direct config (configuration-time throw)
  - pg@8.13.0: per-query query_timeout option (Query read timeout error)
- **Verified by:** bc-deepen-contract (pass 15, deepen-stream-2, 2026-06-23T22:25Z)

## 2026-06-18 — re-verified clean

- **Latest published:** pg@8.21.0
- **Profile semver:** `>=8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** pg@8.21.0
- **Profile semver:** >=8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** pg@8.21.0
- **Profile semver:** `>=8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** pg@8.21.0
- **Profile semver:** `>=8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** pg@8.21.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-03 — backfilled

- **Verified against:** pg@>=8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
