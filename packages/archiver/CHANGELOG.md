# CHANGELOG — archiver

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-confirmed-complete)

- **Profile:** `packages/archiver/contract.yaml`
- **Functions added:** none — Phase 1 re-enumeration against archiver@8.0.0 confirmed full surface coverage
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** abort() (sync this-returning), pointer() (sync getter, returns number) — unchanged from prior pass
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** @types/archiver@8.0.0 index.d.ts (full Archiver class declaration); archiver@8.0.0 lib/core.js (methods at lines 507/525/570/651/672/710/749/792); archiver@8.0.0 lib/error.js (ArchiverError code map, 15 codes)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 80, drift-by-staleness mode, on 2026-06-24T13:03:56Z)
- **Notes:** Phase 1 enumeration via @types/archiver and lib/core.js confirms 9 callable methods on Archiver class: abort, append, directory, file, glob, finalize, pointer, symlink (8 instance methods + constructor factory). 7 async-callable groups all contracted (archiver factory, append, directory, file, glob, finalize, symlink). 2 sync methods correctly omitted (abort returns `this`, pointer returns `number`). Error code surface unchanged from prior pass — all 11 user-facing ArchiverError codes still mapped to existing postconditions; 4 internal codes (NOENDMETHOD, FORMATSET, MODULESET, ENTRYNOTSUPPORTED) remain implicit-omit (thrown only during format-module registration, not user code paths). last_verified bumped from 2026-06-18 to 2026-06-24; coverage_score stays 1.0.

## 2026-06-18 — deepen pass — coverage 85% → 100%

- **Profile:** `packages/archiver/contract.yaml`
- **Functions added:** append (extended), symlink (extended) — no new top-level functions; full ArchiverError code surface now covered across existing 7 contracted methods
- **Postconditions added:** 3 (append-directory-entry-unsupported, symlink-missing-filepath, symlink-missing-target)
- **Functions intentionally omitted this pass:** abort() (sync, idempotent, no error emission); pointer() (sync getter)
- **Scanner concerns queued:** 3 (concern-20260618-archiver-deepen-1, concern-20260618-archiver-deepen-2, concern-20260618-archiver-deepen-3)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** archiver@8.0.0 lib/core.js (lines 525-794), lib/error.js (full ArchiverError code map), @types/archiver@8.0.0 index.d.ts
- **Verified by:** bc-deepen-contract (pass 7 on 2026-06-18T22:17:58Z)

## 2026-06-18 — re-verified clean

- **Latest published:** archiver@8.0.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** archiver@8.0.0
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** archiver@8.0.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** archiver@8.0.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** archiver@8.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** archiver@>=5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
