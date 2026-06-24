# CHANGELOG — body-parser

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 95% → 98%

- **Profile:** `packages/body-parser/contract.yaml`
- **Pass mode:** drift-by-staleness (last_deepened was 2026-04-15, oldest public-tier entry)
- **Verified against:** body-parser@2.3.0 installed locally (within profile semver `>=1.20.0 <3.0.0`)
- **Functions enumerated:** 4 (`json`, `urlencoded`, `raw`, `text`) — all already contracted; no new surface
- **Postconditions added (3):**
  - `json.json-strict-violation` (warning, SILENT_FAILURE) — v2.x default strict:true rejects bare JSON primitives at the `firstchar !== '{' && '['` guard before JSON.parse runs; common client integration friction not previously called out
  - `urlencoded.urlencoded-config-type-error` (warning, DOWNTIME) — three sync TypeError throw sites in urlencoded.js at lines 38/72/76 fire at middleware-construction time, NOT request time; Express error middleware cannot catch them; crashes Node at boot
  - (Encoding-unsupported postconditions updated, not added) — see "Postconditions amended" below
- **Postconditions amended (4):** `json-encoding-unsupported`, `urlencoded-encoding-unsupported`, `raw-encoding-unsupported`, `text-encoding-unsupported` — all four previously listed only gzip/deflate/identity; updated to also list `br` (Brotli decompression was added as a supported encoding in body-parser v2.0.0 per node_modules/body-parser/lib/read.js createDecompressionStream switch). Drift item — applications upgrading from v1.x now implicitly accept Brotli-encoded bodies.
- **Coverage:** 95% → 98% (no new functions, ~3 new postconditions and 4 corrected drift entries on existing functions)
- **Functions intentionally omitted:** none — the deprecated `bodyParser()` generic just throws an Error unconditionally and is not an async API; the 4 named middleware factories ARE the full public surface.
- **Scanner concerns queued:** 0 — the new postconditions describe options-validation behavior and a SyntaxError variant that the existing scanner rules already detect at the bare-await/missing-error-middleware level.
- **Fixtures added:** 0 — existing ground-truth.ts / missing-error-handling.ts cover the dominant violation type (registering body-parser without an Express error-handling middleware downstream). The new postconditions target boot-time TypeErrors and a strict-mode SyntaxError variant whose dedicated fixtures would warrant a separate pass.
- **Scanner version used:** nark@3.1.0 (per `nark-dev/nark/package.json`)
- **Sources fetched:** `node_modules/body-parser/lib/types/json.js` (v2.3.0 lines 73-120), `node_modules/body-parser/lib/types/urlencoded.js` (lines 38-90), `node_modules/body-parser/lib/read.js` (lines 188-230), https://github.com/expressjs/body-parser/blob/master/README.md#strict, https://github.com/expressjs/body-parser/blob/master/README.md#unsupported-content-encoding-bogus
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 29 on 2026-06-23T22:27Z)


## 2026-06-18 — re-verified clean

- **Latest published:** body-parser@2.3.0
- **Profile semver:** `>=1.20.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** body-parser@2.3.0
- **Profile semver:** >=1.20.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** body-parser@2.3.0
- **Profile semver:** `>=1.20.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** body-parser@2.3.0
- **Profile semver:** `>=1.20.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** body-parser@2.2.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** body-parser@>=1.20.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
