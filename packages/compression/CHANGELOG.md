# CHANGELOG — compression

## 2026-06-25 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:** >=1.7.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verification, drift-by-staleness)

- **Profile:** `packages/compression/contract.yaml`
- **Functions added:** none (API surface unchanged at 2 callable exports)
- **Postconditions added:** 0
- **Edge cases added:** 1 (`brotli-encoding-fallback`)
- **Functions intentionally omitted this pass:** `compression.filter` (pure sync boolean utility, unchanged from prior pass)
- **Scanner concerns queued:** 0 (silent Node-version fallback is documentation-only — no error to detect)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/expressjs/compression/blob/master/HISTORY.md (1.8.0 changelog)
  - https://github.com/expressjs/compression/blob/master/index.js (hasBrotliSupport check, line 37; stream factory dispatch line 215-218)
  - @types/compression/index.d.ts (CompressionOptions interface)
- **Verified by:** bc-deepen-contract (re-verification pass on 2026-06-24T07:40:10Z)
- **Notes:** Since 1.8.0 (2025-02-10) brotli and enforceEncoding options were added to the existing factory; no new callable functions. The existing `zlib-stream-unhandled-error` postcondition covers the brotli code path because `zlib.createBrotliCompress()` emits errors through the same uncaught channel as `createGzip`/`createDeflate`. Added `brotli-encoding-fallback` edge_case to document that Brotli silently falls back to gzip/deflate on Node runtimes lacking `zlib.createBrotliCompress` (Node <11.7.0). Bumped contract_version 1.1.0 -> 1.2.0; last_verified 2026-04-16 -> 2026-06-24.

## 2026-06-18 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:** `>=1.7.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:** >=1.7.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:** `>=1.7.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:** `>=1.7.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** compression@1.8.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** compression@>=1.7.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
