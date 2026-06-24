# CHANGELOG — passport-jwt

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-verification)

- **Profile:** `packages/passport-jwt/contract.yaml`
- **Latest published:** passport-jwt@4.0.1 (unchanged since 2022-12-24)
- **API surface:** 8 (1 Strategy class + 7 ExtractJwt factories) — unchanged from pass 6
- **Contracted:** 2 (Strategy, ExtractJwt.fromExtractors) — unchanged
- **Omitted:** 6 (sync factories with no throw paths) — unchanged
- **Functions added:** none
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** fromHeader, fromBodyField, fromUrlQueryParameter, fromAuthHeaderWithScheme, fromAuthHeaderAsBearerToken, versionOneCompatibility (all sync, verified no throw paths in source)
- **Scanner concerns queued:** 0 (no new postconditions => no detection gaps to queue)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/passport-jwt/lib/strategy.js, node_modules/passport-jwt/lib/extract_jwt.js, node_modules/passport-jwt/lib/index.js (installed v4.0.1 in /tmp/claude/bc-deepen/passport-jwt)
- **Verdict:** re-verified. All 5 throw sites from pass 6 still match the installed source; no API drift; no postcondition rewrites needed.
- **Verified by:** bc-deepen-contract (pass 71 on 2026-06-24, deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** passport-jwt@4.0.1
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** passport-jwt@4.0.1
- **Profile semver:** >=4.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** passport-jwt@4.0.1
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** passport-jwt@4.0.1
- **Profile semver:** `>=4.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** passport-jwt@4.0.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** passport-jwt@>=4.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
