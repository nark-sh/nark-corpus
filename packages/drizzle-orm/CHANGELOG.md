# CHANGELOG — drizzle-orm

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** drizzle-orm@0.45.2
- **Profile semver:** `>=0.45.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** drizzle-orm@0.45.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 46% → 69%

- **Profile:** `packages/drizzle-orm/contract.yaml`
- **Functions added:** findFirst, findMany, batch (3 total)
- **Postconditions added:** 6
  - findfirst-undefined-on-missing-row, findfirst-driver-error
  - findmany-driver-error, findmany-empty-array-on-stale-filter
  - batch-statement-failure-rolls-back-all, batch-unsupported-on-non-batchable-driver
- **Functions intentionally omitted this pass:** selectDistinct (same error profile as select), selectDistinctOn (same), refreshMaterializedView (rare maintenance op), $count (read-only, returns 0)
- **Also covered by existing postconditions:** db.run/db.all/db.get/db.values (sqlite-core variants — same error profile as execute)
- **Scanner concerns queued:** 3 (`concern-20260612-drizzle-orm-deepen-1`, `concern-20260612-drizzle-orm-deepen-2`, `concern-20260612-drizzle-orm-deepen-3`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://orm.drizzle.team/docs/rqb (findFirst / findMany behavior)
  - https://orm.drizzle.team/docs/batch-api (batch atomicity + driver support)
  - https://raw.githubusercontent.com/drizzle-team/drizzle-orm/main/drizzle-orm/src/pg-core/query-builders/query.ts (implementation: rows[0] returns undefined)
  - Local node_modules inspection of drizzle-orm@0.45.2 (pg-core/query-builders/query.d.ts, d1/driver.d.ts, d1/session.js, errors.js)
- **Notes:** Also fixed stale coverage_score in contract.yaml (was 0.60 calculated as 6/10; corrected formula now reads 9/13 raw = 0.69, with effective contracted/non-omitted = 9/9 = 1.0). last_verified bumped from 2026-04-02 to 2026-06-12. contract_version bumped 1.0.0 → 1.2.0.
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T18:05:00Z)

## 2026-04-02 — backfilled

- **Verified against:** drizzle-orm@>=0.45.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
