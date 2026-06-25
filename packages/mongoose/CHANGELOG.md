# CHANGELOG — mongoose

## 2026-06-25 — re-verified clean

- **Latest published:** mongoose@9.7.2
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 81% → 100% (effective)

- **Profile:** `packages/mongoose/contract.yaml`
- **Functions added:** Connection.bulkWrite, Connection.destroy, Connection.createCollections, Document.deleteOne, Model.createSearchIndexes, Query.cursor.eachAsync (6 total)
- **Postconditions added:** 11
- **Functions intentionally omitted this pass:** Connection.listCollections (read-only metadata), Connection.listDatabases (read-only admin metadata), Connection.asPromise (identity helper, no new error surface)
- **Scanner concerns queued:** 4 (`concern-20260623-mongoose-deepen-1` Connection-instance tracking for bulkWrite, `-2` Connection.destroy detection, `-3` Connection.createCollections detection, `-4` Document.deleteOne vs Model.deleteOne discrimination)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://mongoosejs.com/docs/api/connection.html#Connection.prototype.bulkWrite(), https://mongoosejs.com/docs/api/connection.html#Connection.prototype.destroy(), https://mongoosejs.com/docs/api/connection.html#Connection.prototype.createCollections(), https://mongoosejs.com/docs/api/document.html#Document.prototype.deleteOne(), https://mongoosejs.com/docs/api/model.html#Model.createSearchIndexes(), https://mongoosejs.com/docs/api/query.html#Query.prototype.cursor(), https://github.com/Automattic/mongoose/blob/master/lib/error/bulkWriteError.js, https://github.com/Automattic/mongoose/blob/master/lib/error/createCollectionsError.js, https://github.com/Automattic/mongoose/blob/master/lib/error/eachAsyncMultiError.js, https://www.mongodb.com/docs/atlas/atlas-search/manage-indexes/
- **Verified by:** bc-deepen-contract (pass 17 on 2026-06-23T22:47:45Z, drift-by-staleness mode — last_deepened was 2026-04-06 = ~12 weeks stale; re-enumeration against mongoose@9.7.2 surface)

## 2026-06-18 — re-verified clean

- **Latest published:** mongoose@9.7.1
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mongoose@9.7.0
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mongoose@9.7.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mongoose@9.7.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mongoose@9.7.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-06 — backfilled

- **Verified against:** mongoose@>=5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
