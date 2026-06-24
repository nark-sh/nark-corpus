# CHANGELOG — fs-extra

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (re-verification)

- **Profile:** `packages/fs-extra/contract.yaml`
- **Functions added:** none (re-verification pass against fs-extra@11.3.5)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** pathExists (never throws — catches internally, returns false), emptyDir (self-handles readdir errors), ensureLink (niche filesystem op, rare in SaaS), ensureSymlink (niche filesystem op, rare in SaaS)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** https://github.com/jprichardson/node-fs-extra/blob/HEAD/CHANGELOG.md (11.0.0 → 11.3.5 review); @types/fs-extra@11.0.4 `index.d.ts` full surface walk; fs-extra@11.3.5 `lib/index.js`, `lib/fs/index.js`, `lib/ensure/index.js`, `lib/json/index.js` exports
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T00:10Z, deepen-stream-2 pass 22)
- **Notes:** API surface against fs-extra's "extra" namespace (copy/move/json/ensure/output/mkdirs/remove/path-exists/empty) is unchanged since the 2026-04-03 deepen pass. fs-extra 11.3.0 (Jan 2025) added promise wrappers for newer Node fs methods (`cp`, `glob`, `statfs`, `lutimes`) — these are Node fs promisifications, not fs-extra extras, and stay out of scope under the established convention that fs-extra's contract covers the "extra" surface only. The 11.3.1 → 11.3.5 bugfixes are internal race-condition / Windows-detection / file-descriptor-leak fixes that do not introduce new documented error contracts. Coverage stays 12/12 = 1.0 on the 16-function denominator (12 contracted + 4 intentionally omitted).

## 2026-06-18 — re-verified clean

- **Latest published:** fs-extra@11.3.5
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** fs-extra@11.3.5
- **Profile semver:** >=9.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** fs-extra@11.3.5
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** fs-extra@11.3.5
- **Profile semver:** `>=9.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** fs-extra@11.3.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-06 — backfilled

- **Verified against:** fs-extra@>=9.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
