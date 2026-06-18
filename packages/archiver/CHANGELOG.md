# CHANGELOG — archiver

All notable verification, deepen, and fork events for this profile. Newest first.


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
