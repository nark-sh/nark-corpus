# CHANGELOG — sqlite3

All notable verification, deepen, and fork events for this profile. Newest first.

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
