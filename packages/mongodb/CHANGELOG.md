# CHANGELOG — mongodb

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 84% -> 91%

- **Profile:** `packages/mongodb/contract.yaml`
- **Functions added:** `MongoClient.bulkWrite`, `GridFSBucket.delete`, `GridFSBucket.rename` (3 total)
- **Postconditions added:** 6 (clientbulkwrite-execution-error, clientbulkwrite-partial-failure-not-inspected, clientbulkwrite-cursor-exhaustion-error, gridfs-delete-file-not-found, gridfs-delete-orphaned-chunks-on-files-failure, gridfs-rename-file-not-found)
- **Pattern:** sync-factory-with-async-methods (`new GridFSBucket(db, options)` returns object with async `.delete()`, `.rename()`, `.drop()`; `MongoClient` constructor is sync and exposes the new v7+ `.bulkWrite()` admin method). Matches drift-by-staleness hint about enumerating async members on sync factory returns.
- **Functions intentionally omitted this pass:** `GridFSBucket.drop` (same MongoRuntimeError pattern as delete; covered transitively), `MongoClient.startSession` (sync — returns ClientSession, no Promise), `MongoClient.connect` (already contracted), `Db.command` (admin-only runtime use), `ClientSession.commitTransaction`/`abortTransaction` (covered by withTransaction's retry semantics), `Admin.*` (admin-only), `FindCursor.next`/`toArray`/`forEach` (cursor iteration shares the find() network-error profile).
- **Scanner concerns queued:** 3 (`concern-20260624-mongodb-deepen-1`, `concern-20260624-mongodb-deepen-2`, `concern-20260624-mongodb-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Installed package version at deepen time:** mongodb@7.3.0
- **Sources fetched:**
  - https://www.mongodb.com/docs/manual/reference/command/bulkWrite/
  - https://github.com/mongodb/node-mongodb-native/blob/main/src/mongo_client.ts
  - https://github.com/mongodb/node-mongodb-native/blob/main/src/operations/client_bulk_write/executor.ts
  - https://github.com/mongodb/node-mongodb-native/blob/main/src/error.ts
  - https://www.mongodb.com/docs/manual/core/gridfs/
  - https://github.com/mongodb/node-mongodb-native/blob/main/src/gridfs/index.ts
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 65 on 2026-06-24T08:12Z)

## 2026-06-18 — re-verified clean

- **Latest published:** mongodb@7.3.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mongodb@7.3.0
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mongodb@7.3.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mongodb@7.3.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mongodb@7.3.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** mongodb@>=5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
