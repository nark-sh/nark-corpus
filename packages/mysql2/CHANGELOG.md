# CHANGELOG — mysql2

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verification pass — coverage 79% -> 79% (no new functions)

- **Profile:** `packages/mysql2/contract.yaml`
- **Verified against:** mysql2@3.22.5 (latest published; within profile semver `>=3.9.8`)
- **Functions added:** none — re-verification confirmed existing 15 contracted functions remain accurate
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** previously omitted (4) confirmed still valid:
  - `Connection.[Symbol.asyncDispose]()` — alias for `end()`, same error surface
  - `PoolCluster.end()` — multi-primary cluster, rarely used in SaaS apps
  - `PoolCluster.getConnection()` — multi-primary cluster, rarely used in SaaS apps
  - `Pool.releaseConnection()` — synchronous, returns void, no async error contract
- **Newly catalogued (not added to omitted-count to keep coverage stable):** `Pool[Symbol.asyncDispose]()` (alias for `Pool.end()`), `PoolNamespace.getConnection/query/execute` (returned by `cluster.of()` — same PoolCluster rationale: rarely used in SaaS). `PromisePoolCluster.query()/execute()` exist in `lib/promise/promise.js` but are NOT in `promise.d.ts` — untyped, unreachable from TypeScript callers, intentionally excluded from the contract surface.
- **Scanner concerns queued:** 0 (no new postconditions)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/mysql2@3.22.5/promise.d.ts` (TypeScript-typed async surface)
  - `node_modules/mysql2@3.22.5/lib/promise/connection.js`
  - `node_modules/mysql2@3.22.5/lib/promise/pool.js`
  - `node_modules/mysql2@3.22.5/lib/promise/pool_cluster.js`
  - `node_modules/mysql2@3.22.5/promise.js`
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 66, 2026-06-24T10:14:34Z)

## 2026-06-18 — re-verified clean

- **Latest published:** mysql2@3.22.5
- **Profile semver:** `>=3.9.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mysql2@3.22.5
- **Profile semver:** >=3.9.8 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mysql2@3.22.5
- **Profile semver:** `>=3.9.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mysql2@3.22.5
- **Profile semver:** `>=3.9.8` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mysql2@3.22.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** mysql2@>=3.9.8
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
