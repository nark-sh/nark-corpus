# CHANGELOG — knex

## 2026-06-26 — deepen pass — coverage 82.8% → 86.2%

- **Profile:** `packages/knex/contract.yaml`
- **Functions added:** upsert (1 total)
- **Postconditions added:** 3
  - `upsert-unsupported-dialect` — synchronous Error thrown on PostgreSQL/MSSQL/Oracle/SQLite/Redshift
  - `upsert-mysql-replace-into-data-loss` — REPLACE INTO deletes+inserts row, silently changing AUTO_INCREMENT ID and resetting unspecified columns
  - `upsert-mysql-returning-ignored` — .returning() silently no-ops on MySQL upsert
- **Functions intentionally omitted this pass:** none (omit list unchanged from prior pass)
- **Scanner concerns queued:** 1 (`concern-20260626-knex-deepen-upsert-1` — add detection for upsert() without try-catch)
- **Scanner version used:** nark@3.2.10
- **Sources fetched:**
    - https://knexjs.org/guide/query-builder.html#upsert
    - https://knexjs.org/guide/query-builder.html#on-conflict
    - knex@3.2.10 lib/query/querybuilder.js (base upsert() throws synchronously)
    - knex@3.2.10 lib/dialects/mysql/query/mysql-querycompiler.js (REPLACE INTO + returning warning)
- **Verified by:** bc-deepen-contract (pass 26 on 2026-06-26, deepen-stream-5)

## 2026-06-25 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 1.0 (legacy) → 0.83 effective

- **Profile:** `packages/knex/contract.yaml`
- **Functions added:** schema.dropTable, schema.alterTable, schema.hasTable, schema.hasColumn, migrate.up, migrate.down, migrate.forceFreeMigrationsLock, seed.run, stream (9 total)
- **Postconditions added:** 11
- **Functions intentionally omitted this pass:** count/sum/avg/min/max (share select error surface), pluck (same as select), columnInfo (read-only metadata), migrate.status/currentVersion/list (read-only), migrate.make/seed.make (filesystem-only), trx.commit/rollback (covered transitively by transactionProvider lifecycle), trx.savepoint (advanced TXN, low adoption), createView/dropView/createSchema/dropSchema (covered transitively by createTable family), renameTable (rare), forUpdate/forShare (modifiers), truncate (lower priority), asCallback (deprecated promise/callback bridge)
- **Scanner concerns queued:** 7 (`concern-20260623-knex-deepen-1` through `concern-20260623-knex-deepen-7`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
    - https://knexjs.org/guide/schema-builder.html (dropTable, alterTable, hasTable, hasColumn)
    - https://knexjs.org/guide/migrations.html (migrate.up, migrate.down, forceFreeMigrationsLock, lock contract)
    - https://knexjs.org/guide/interfaces.html (stream error events, abort cleanup)
    - https://knexjs.org/guide/transactions.html (transaction lifecycle baseline)
    - https://github.com/knex/knex/blob/master/lib/migrations/seed/Seeder.js (seed.run wrapping behavior)
    - knex@3.2.10 types/index.d.ts (full async surface enumeration)
- **Verified by:** bc-deepen-contract (pass 25 on 2026-06-23T01:19:58Z, deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** knex@3.2.10
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-11 — backfilled

- **Verified against:** knex@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
