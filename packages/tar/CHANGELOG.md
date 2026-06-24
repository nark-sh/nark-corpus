# CHANGELOG — tar

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 86% → 86% (re-verify, no new surface)

- **Profile:** `packages/tar/contract.yaml`
- **Functions added:** none (0 total)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** streaming no-file mode (event-based Pack/Unpack/Parser stream classes — not Promise-returning, out of scope for async-await contract model)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Package version inspected:** tar@7.5.16
- **API surface re-enumerated from:** `node_modules/tar/dist/commonjs/index.d.ts` (re-exports create, extract, list, replace, update and aliases c, x, t, r, u) and node-tar README "Warnings and Errors" section
- **Verdict:** API surface unchanged since 2026-04-16 deepen pass. All 5 unique async file-mode functions (with 5 aliases) remain contracted. Coverage stable at 0.86 by design; streaming-mode remains the single intentional omission.
- **Sources fetched:** https://github.com/isaacs/node-tar#readme, node_modules/tar@7.5.16 dist d.ts files
- **Verified by:** bc-deepen-contract (pass 53 on 2026-06-24T06:18:45Z, deepen-stream-2)


## 2026-06-18 — re-verified clean

- **Latest published:** tar@7.5.16
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** tar@7.5.16
- **Profile semver:** >=6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** tar@7.5.16
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** tar@7.5.16
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** tar@7.5.16
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** tar@>=6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
