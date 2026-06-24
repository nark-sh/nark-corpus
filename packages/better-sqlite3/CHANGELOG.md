# CHANGELOG — better-sqlite3

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 89% -> 89% (re-verification)

- **Profile:** `packages/better-sqlite3/contract.yaml`
- **Functions added:** none (API surface unchanged through v12.11.1)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** unchanged — same 16 read-only/config/registration/lifecycle methods documented in 2026-04-16 pass (pragma, pluck, expand, raw, bind, columns, safeIntegers, defaultSafeIntegers, unsafeMode, table, function, aggregate, prepare, close, serialize, loadExtension)
- **Scanner concerns queued:** 0 (no new gaps; existing `transaction-inner-exception-rollback` detection gap from 2026-04-16 still open in scanner upgrade-concerns)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/WiseLibs/better-sqlite3/releases (verified no new async APIs since v12.6.2 baseline); installed `node_modules/better-sqlite3/lib/database.js` + `lib/methods/*.js` source inspection; `@types/better-sqlite3` index.d.ts surface enumeration
- **API surface verification:** 25 callable methods total (Database + Statement). 1 async (`backup`) — already contracted. 8 sync-with-error-contract — all contracted (run, get, all, iterate, exec, transaction, Database ctor, backup). 16 omitted — unchanged from prior pass. Releases v12.7.0 through v12.11.1 (Mar-Jun 2026) were SQLite version bumps + Electron/Node.js compatibility — no new error-throwing APIs.
- **Tests:** 24 ground-truth tests pass (`src/v2/fixtures/better-sqlite3.ground-truth.test.ts`).
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 61, drift-by-staleness; pass on 2026-06-24T07:42 UTC)


## 2026-06-18 — re-verified clean

- **Latest published:** better-sqlite3@12.11.1
- **Profile semver:** `>=7.0.0 <13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** better-sqlite3@12.11.1
- **Profile semver:** >=7.0.0 <13.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** better-sqlite3@12.11.1
- **Profile semver:** `>=7.0.0 <13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** better-sqlite3@12.11.1
- **Profile semver:** `>=7.0.0 <13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** better-sqlite3@12.10.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** better-sqlite3@>=7.0.0 <13.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
