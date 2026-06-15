# CHANGELOG — typeorm

All notable verification, deepen, and fork events for this profile. Newest first.


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
