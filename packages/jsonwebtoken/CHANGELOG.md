# CHANGELOG — jsonwebtoken

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (re-verification)

- **Profile:** `packages/jsonwebtoken/contract.yaml`
- **Functions added:** none (API surface unchanged at jsonwebtoken@9.0.3)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none — full surface already covered (`verify`, `sign`, `decode`)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/jsonwebtoken/index.js` (entry exports: `decode`, `verify`, `sign`, error classes only)
  - `node_modules/@types/jsonwebtoken/index.d.ts` (exported functions confirmed: `sign`, `verify`, `decode` — same 3 as contracted)
  - `node_modules/jsonwebtoken/README.md` "Errors & Codes" section (TokenExpiredError / JsonWebTokenError / NotBeforeError unchanged)
- **Verified by:** bc-deepen-contract pass 18 (deepen-stream-2, drift-by-staleness mode — entry was the oldest `last_deepened` 2026-04-02). API surface unchanged since previous deepen pass; no new async functions added. `last_verified` bumped 2026-04-02 → 2026-06-23.

## 2026-06-18 — re-verified clean

- **Latest published:** jsonwebtoken@9.0.3
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** jsonwebtoken@9.0.3
- **Profile semver:** >=9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** jsonwebtoken@9.0.3
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** jsonwebtoken@9.0.3
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** jsonwebtoken@9.0.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-02 — backfilled

- **Verified against:** jsonwebtoken@>=9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
