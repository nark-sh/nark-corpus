# CHANGELOG — @vercel/postgres

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** @vercel/postgres@0.10.0
- **Profile semver:** `^0.10.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @vercel/postgres@0.10.0
- **Profile semver:** ^0.10.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @vercel/postgres@0.10.0
- **Profile semver:** `^0.10.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @vercel/postgres@0.10.0
- **Profile semver:** `^0.10.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @vercel/postgres@0.10.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 63% → 69%

- **Profile:** `packages/@vercel/postgres/contract.yaml`
- **Functions added:** `postgresConnectionString` (1 total)
- **Postconditions added:** 3 (`sql-incorrect-template-call`, `sql-missing-connection-string-on-first-use`, `postgresconnectionstring-invalid-type`)
- **Functions intentionally omitted this pass:** none (4 prior omissions unchanged: `db`, `pool.sql`, `client.sql`, `client.query` — aliases/duplicate error profiles)
- **Scanner concerns queued:** 3 (`concern-20260612-vercel-postgres-deepen-1`, `concern-20260612-vercel-postgres-deepen-2`, `concern-20260612-vercel-postgres-deepen-3`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `dist/chunk-BZ4XJVIW.cjs` (local package source — sqlTemplate(), createPool(), lazy Proxy)
  - `https://github.com/vercel/storage/blob/vercel-kv-vercel-postgres-archive/packages/postgres/src/error.ts` (4 error codes confirmed)
  - `https://github.com/vercel/storage/blob/vercel-kv-vercel-postgres-archive/packages/postgres/src/sql-template.ts` (incorrect_tagged_template_call confirmed)
  - `https://github.com/vercel/storage/blob/vercel-kv-vercel-postgres-archive/packages/postgres/src/index.ts` (lazy Proxy pattern confirmed)
  - `https://github.com/vercel/storage/blob/vercel-kv-vercel-postgres-archive/packages/postgres/src/postgres-connection-string.ts` (invalid_connection_type confirmed)
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T01:11:28Z)
- **Side effect:** Fixed duplicate `coverage_score` key in `packages/@libsql/client/contract.yaml` left by parallel deepen stream

## 2026-04-17 — backfilled

- **Verified against:** @vercel/postgres@^0.10.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
