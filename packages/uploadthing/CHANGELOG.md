# CHANGELOG — uploadthing

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass (re-verification) — coverage 80% -> 80% (no change)

- **Profile:** `packages/uploadthing/contract.yaml`
- **Mode:** drift-by-staleness re-verification (last_deepened 2026-04-17, 68 days old)
- **Package version inspected:** uploadthing@7.7.4
- **Functions added:** none (API surface unchanged since 2026-04-17 pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none new (still 2: `getFileUrls` deprecated, `getSignedURL` deprecated in favor of `generateSignedURL`)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** local `node_modules/uploadthing/server/index.d.ts` (UTApi class)
- **Verified by:** bc-deepen-contract via deepen-stream-2 pass 66 (2026-06-24T08:23:44Z)
- **Notes:** UTApi class still exposes the same 10 async methods recorded in the 2026-04-17 pass: `uploadFiles`, `uploadFilesFromUrl`, `deleteFiles`, `getFileUrls` (deprecated, omitted), `listFiles`, `renameFiles`, `getUsageInfo`, `generateSignedURL`, `getSignedURL` (deprecated, omitted), `updateACL`. 8 contracted, 2 omitted, effective coverage 8/8 = 1.0. Bumped `last_verified` to today.


## 2026-06-18 — re-verified clean

- **Latest published:** uploadthing@7.7.4
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** uploadthing@7.7.4
- **Profile semver:** >=6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** uploadthing@7.7.4
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** uploadthing@7.7.4
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** uploadthing@7.7.4
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** uploadthing@>=6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
