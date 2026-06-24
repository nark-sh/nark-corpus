# CHANGELOG — @planetscale/database

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verify pass — coverage 100% (unchanged)

- **Profile:** `packages/@planetscale/database/contract.yaml`
- **Latest published:** @planetscale/database@1.20.1 (unchanged since 2026-04-17 deepen)
- **API surface re-enumerated from:** `node_modules/@planetscale/database@1.20.1/dist/index.d.ts`
- **Async-callable methods (3, all contracted):** `Connection.execute`, `Connection.transaction`, `Connection.refresh` — also covers `Client.execute`, `Client.transaction`, `Tx.execute` via shared postconditions matched on method name.
- **Sync utilities (5, intentionally omitted):** `connect` (factory), `Client.connection` (factory), `cast`, `format`, `hex`
- **Functions added:** none
- **Postconditions added:** 0
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** `dist/index.d.ts` (local); prior deepen evidence URLs still valid (https://github.com/planetscale/database-js/blob/main/src/index.ts).
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 61, 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** @planetscale/database@1.20.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @planetscale/database@1.20.1
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @planetscale/database@1.20.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @planetscale/database@1.20.1
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @planetscale/database@1.20.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** @planetscale/database@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
