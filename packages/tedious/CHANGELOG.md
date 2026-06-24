# CHANGELOG — tedious

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-confirmation)

- **Profile:** `packages/tedious/contract.yaml`
- **Latest published:** tedious@19.2.1 (semver `>=18.0.0` still satisfies; v20.0.0 also published 2026-06-21 but only bumps Node engine to >=22, no API surface changes)
- **Functions added:** none — full Connection async surface re-confirmed identical to v18.x baseline
- **Postconditions added:** 0
- **API surface walked:** node_modules/tedious/lib/connection.d.ts, bulk-load.d.ts, tedious.d.ts (installed tedious@19.2.1 via npm)
- **Verdict:** RE-CONFIRMED-COMPLETE. 13 contracted async functions (connect, execSql, execSqlBatch, callProcedure, beginTransaction, commitTransaction, rollbackTransaction, prepare, unprepare, execute, execBulkLoad, saveTransaction, transaction) cover the full Connection async surface. The 5 omitted methods (close, cancel, reset, newBulkLoad, connect-factory) remain correctly omitted: close()/cancel() are sync void/boolean, reset() and newBulkLoad() inherit error contracts from execSql/execBulkLoad respectively, and the top-level `connect(config, listener)` factory exported from tedious.d.ts is a thin wrapper around Connection.connect() with the identical callback-error contract.
- **Release-note review:** v19.0.0 (2024-08-22) refactored AbortSignal handling and bumped Node min to 18.17 (no error-contract change). v19.1.0 added Azure Microsoft Fabric support. v19.2.0 added `databaseMirroringPartner` event handler (an InfoMessage routing surface — not a new method). v20.0.0 (2026-06-21) bumps Node min to 22 (engine-only). No new async methods, no error class additions in lib/errors.d.ts (ConnectionError + RequestError unchanged).
- **Scanner concerns queued:** 0 (no new postconditions written)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/tediousjs/tedious/releases/tag/v19.0.0, https://github.com/tediousjs/tedious/releases/tag/v19.1.0, https://github.com/tediousjs/tedious/releases/tag/v19.2.0, https://github.com/tediousjs/tedious/releases/tag/v20.0.0
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T09:16:28Z, deepen-stream-2 pass=71)

## 2026-06-18 — re-verified clean

- **Latest published:** tedious@19.2.1
- **Profile semver:** `>=18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** tedious@19.2.1
- **Profile semver:** >=18.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** tedious@19.2.1
- **Profile semver:** `>=18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** tedious@19.2.1
- **Profile semver:** `>=18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** tedious@19.2.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** tedious@>=18.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
