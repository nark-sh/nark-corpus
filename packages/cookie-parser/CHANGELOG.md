# CHANGELOG — cookie-parser

## 2026-06-25 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:** >=1.4.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verification, no new functions)

- **Profile:** `packages/cookie-parser/contract.yaml`
- **Functions added:** none — API surface unchanged since 2026-04-16 baseline
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none (all 5 exported functions are contracted)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/expressjs/cookie-parser (HISTORY.md, index.js — no changes since v1.4.7 / 2024-10-08)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24, deepen-stream-2 pass=63)
- **Notes:** cookie-parser@1.4.7 remains the latest published version. Public exports confirmed: `cookieParser` (default), `JSONCookie`, `JSONCookies`, `signedCookie`, `signedCookies`. All 5 already contracted with full postcondition coverage. Bumped `last_verified` to 2026-06-24 to reflect current re-verification.

## 2026-06-18 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:** `>=1.4.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:** >=1.4.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:** `>=1.4.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:** `>=1.4.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** cookie-parser@1.4.7
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** cookie-parser@>=1.4.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
