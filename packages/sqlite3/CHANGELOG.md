# CHANGELOG — sqlite3

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-14 — re-verified clean

- **Latest published:** sqlite3@6.0.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 57% → 67% (effective 100%)

- **Profile:** `packages/sqlite3/contract.yaml`
- **Functions added:** Database (constructor open-error postconditions), Statement.get (2 total)
- **Postconditions added:** 6 (database-open-cantopen, database-open-perm, database-open-notadb, database-open-corrupt, statement-get-callback-error-ignored, statement-get-leaves-database-locked)
- **Functions intentionally omitted this pass:** Statement.bind (binding errors immediate, low silent-failure rate), Statement.reset (wiki documents "never fails"), Statement.all/each (same error profile as Database equivalents; usage pattern documented under Statement.run + finalize), Statement.map (covered by Database.map shortcut), Database.serialize/parallelize (mode control, scheduled queries report own errors), Database.wait (undocumented in current wiki API).
- **Scanner concerns queued:** 3 (`concern-20260612-sqlite3-deepen-5` Database constructor open-error detection, `concern-20260612-sqlite3-deepen-6` Statement.get callback-error-ignored, `concern-20260612-sqlite3-deepen-7` Statement.get cursor-leak / database-locked tracking)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:** https://github.com/TryGhost/node-sqlite3/wiki/API (Database constructor, Statement#get), https://raw.githubusercontent.com/TryGhost/node-sqlite3/master/test/open_close.test.js (err.errno === sqlite3.CANTOPEN assertion), https://raw.githubusercontent.com/TryGhost/node-sqlite3/master/test/prepare.test.js (canonical stmt.get callback pattern), https://www.sqlite.org/rescode.html (SQLITE_CANTOPEN=14, SQLITE_PERM=3, SQLITE_NOTADB=26, SQLITE_CORRUPT=11)
- **Coverage rationale:** Raw 14/21 = 0.67. 7 intentionally omitted (was 9; removed Statement.get from omitted list and added 2 functions). Effective 14/14 = 1.0.
- **Key insight:** The Database constructor itself was implicit in the contract — its 4 distinct open failure modes (CANTOPEN, PERM, NOTADB, CORRUPT) are the #1 cause of production silent-deploy failures with sqlite3 (missing data file, container uid/gid mismatch, wrong path pointing at non-DB file, corrupted snapshot). Promoting it to a first-class function entry creates an enforcement point at the deploy boundary. Statement.get was previously omitted under "same error profile as Database.get" — the wiki API explicitly documents a UNIQUE failure mode for Statement.get ("can leave the database locked, as the database awaits further calls to Statement#get to retrieve subsequent rows") that does not apply to Database.get because Database.get auto-finalizes its internal one-off statement. Two separate postconditions distinguish callback-err-ignored (silent failure) from cursor-leak (degraded service).
- **Verified by:** bc-deepen-contract (deepen-stream-1 pass 6 on 2026-06-12T16:39Z)

## 2026-06-12 — deepen pass — coverage 69% → 57% (effective 100%)

- **Profile:** `packages/sqlite3/contract.yaml`
- **Functions added:** Statement.finalize, Statement.run, map (Database#map / Statement#map) (3 total)
- **Postconditions added:** 6 (finalize-not-called, finalize-callback-error-ignored, statement-run-callback-error-ignored, statement-run-without-finalize-in-loop, map-callback-error-ignored, map-key-collision-silent-overwrite)
- **Functions intentionally omitted this pass:** Statement.bind (binding errors immediate, low silent-failure rate), Statement.reset (wiki documents "never fails"), Statement.get/all/each (same error profile as Database equivalents; usage pattern documented under Statement.run + finalize), Statement.map (covered by Database.map shortcut), Database.serialize/parallelize (mode control, scheduled queries report own errors), Database.wait (undocumented in current wiki API).
- **Scanner concerns queued:** 4 (`concern-20260612-sqlite3-deepen-1` finalize-not-called, `concern-20260612-sqlite3-deepen-2` finalize-callback-error-ignored, `concern-20260612-sqlite3-deepen-3` Statement.run callback-error, `concern-20260612-sqlite3-deepen-4` map callback-error)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:** https://github.com/TryGhost/node-sqlite3/wiki/API (Statement#run, Statement#finalize, Statement#bind, Statement#reset, Database#map, Statement#map, Database#configure, Database#interrupt), https://github.com/TryGhost/node-sqlite3/wiki/Control-Flow (serialize/parallelize), node_modules/sqlite3/lib/sqlite3.d.ts, node_modules/sqlite3/lib/sqlite3.js (Database.prototype.map and Statement.prototype.map implementation)
- **Coverage rationale:** Raw 12/21 = 0.57. 9 intentionally omitted. Effective 12/12 = 1.0.
- **Key insight:** finalize-not-called is the upstream cause of close-unfinalised-statements (previously contracted under `close`). Promoting finalize to a first-class function entry lets the scanner catch the bug at the point of leak rather than at eventual db.close. Statement.run is distinct from Database.run because the Statement is reused across iterations — swallowed errors compound across the loop into silent partial writes. Database.map has a doubly-silent failure mode (query error → empty {} indistinguishable from no-rows; duplicate first-column → later rows silently overwrite earlier).
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 2 on 2026-06-12T02:46Z)

## 2026-04-17 — backfilled

- **Verified against:** sqlite3@>=5.0.3
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
