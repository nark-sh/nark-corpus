# CHANGELOG — @libsql/client

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** @libsql/client@0.17.4
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @libsql/client@0.17.4
- **Profile semver:** >=0.3.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @libsql/client@0.17.4
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @libsql/client@0.17.4
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @libsql/client@0.17.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — deepen pass — coverage 62% → 69%

- **Profile:** `packages/@libsql/client/contract.yaml`
- **Functions added:** `sync` (1 total)
- **Postconditions added:** 3 (`sync-wrong-client-type`, `sync-network-failure`, `sync-client-closed`)
- **Functions intentionally omitted this pass:** none newly omitted; `transaction.batch`, `transaction.executeMultiple`, `close`, `reconnect` remain omitted from prior passes (variant/sync behavior — unchanged rationale)
- **Scanner concerns queued:** 2 (`concern-20260611-libsql-client-deepen-10`, `concern-20260611-libsql-client-deepen-11`)
- **Scanner version used:** nark@1.5.2 (from `nark-dev/nark/package.json`)
- **Sources fetched:**
  - `@libsql/client v0.17.3` installed source — `lib-esm/http.js` and `lib-esm/ws.js` confirm `SYNC_NOT_SUPPORTED` throw, `lib-esm/sqlite3.js` confirm `CLIENT_CLOSED` guard in sync()
  - `https://github.com/tursodatabase/libsql-client-ts/compare/v0.17.2...v0.17.3` — patch release: only dependency updates, no new API surface
  - `https://docs.turso.tech/sdk/ts/reference` — sync() documented as embedded replica only
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 2 on 2026-06-11T23:45:00Z)
- **Key insight:** `sync()` was previously omitted as "niche embedded replica feature." Re-evaluated: `sync()` throws `LibsqlError(SYNC_NOT_SUPPORTED)` immediately on http/ws clients — the most common Turso connection type. Developers copying sync() from embedded-replica tutorials into cloud-connected codebases get a hard crash. Promoted from intentionally-omitted to contracted with 3 postconditions.

## 2026-04-17 — backfilled

- **Verified against:** @libsql/client@>=0.3.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
