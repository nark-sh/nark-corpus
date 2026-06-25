# CHANGELOG — typeorm

## 2026-06-25 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:** >=0.3.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 92% -> 96%

- **Profile:** `packages/typeorm/contract.yaml`
- **Functions added:** synchronize, runMigrations, QueryRunner.startTransaction, QueryRunner.commitTransaction, QueryRunner.release (5 total)
- **Postconditions added:** 10
  - synchronize-query-failed-error, synchronize-not-connected
  - run-migrations-query-failed-error, run-migrations-not-connected
  - start-transaction-already-started, start-transaction-already-released
  - commit-transaction-not-started, commit-transaction-query-failed
  - release-already-released, release-not-called-connection-leak
- **Functions intentionally omitted this pass:** none new (kept previous omissions: deprecated aliases, thin aggregate methods)
- **Scanner concerns queued:** 10 (`concern-20260623-typeorm-deepen-1` .. `concern-20260623-typeorm-deepen-10`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/data-source/DataSource.ts
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/migration/MigrationExecutor.ts
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/error/TransactionAlreadyStartedError.ts
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/error/TransactionNotStartedError.ts
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/error/QueryRunnerAlreadyReleasedError.ts
  - https://raw.githubusercontent.com/typeorm/typeorm/master/src/error/CannotExecuteNotConnectedError.ts
  - https://typeorm.io/migrations
  - https://typeorm.io/transactions
  - https://typeorm.io/data-source-options
  - https://typeorm.io/query-runner
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T23:33:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:** `>=0.3.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:** >=0.3.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:** `>=0.3.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:** `>=0.3.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** typeorm@1.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** typeorm@1.0.0
- **Profile semver:** `>=0.3.0 <1.0.0` → `>=0.3.0 <2.0.0`
- **Verdict:** no error-handling-relevant changes — QueryFailedError and EntityNotFoundError classes verified unchanged in v1.0.0
- **Changelog evidence:** Extracted `package/error/QueryFailedError.d.ts` and `package/error/EntityNotFoundError.d.ts` from typeorm@1.0.0 tarball. Both inherit from `TypeORMError` with identical signatures to v0.3.x. v1.0 is primarily: dropped Node 16/18 support, security fixes (SQL injection parameterization), codemod tooling for migration, bug fixes. No new error class types, no changes to error-throwing behavior in `find()*`, `save()`, `delete()` etc. The `invalidWhereValuesBehavior` was scoped to high-level abstractions only in v0.3.30.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-03 — backfilled

- **Verified against:** typeorm@>=0.3.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
