# CHANGELOG — jwt-decode

## 2026-06-25 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (drift-by-staleness re-verify)

- **Profile:** `packages/jwt-decode/contract.yaml`
- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged — 4.0.0 satisfies)
- **API surface re-enumerated:** 1 callable function (`jwtDecode`) — synchronous, no async surface; types/interfaces (`InvalidTokenError`, `JwtHeader`, `JwtPayload`, `JwtDecodeOptions`) are non-callable.
- **Functions added:** none (API surface unchanged since 2026-04-16 pass)
- **Postconditions added:** 0 (`invalid-token` + `no-signature-validation` both still cover the full surface)
- **Functions intentionally omitted this pass:** none
- **Scanner concerns queued:** 0 (`concern-20260416-jwt-decode-deepen-1` already `implemented`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** built declarations at `node_modules/jwt-decode/build/esm/index.d.ts` (jwt-decode@4.0.0)
- **Ground-truth tests:** 9/9 passed (`src/v2/fixtures/jwt-decode.ground-truth.test.ts`)
- **Verified by:** bc-deepen-contract pass 53 deepen-stream-3 (2026-06-24T07:56:40Z)

## 2026-06-18 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** jwt-decode@4.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** jwt-decode@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
