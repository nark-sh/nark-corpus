# CHANGELOG — dotenv

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verification pass (coverage 100% -> 100%)

- **Latest published:** dotenv@17.4.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **API surface re-enumerated:** 5 exported functions (config, configDotenv, parse, populate, decrypt)
- **Verdict:** no API drift — all 5 functions still contracted; all 5 thrown error codes (MISSING_DATA, INVALID_DOTENV_KEY, NOT_FOUND_DOTENV_ENVIRONMENT, DECRYPTION_FAILED, OBJECT_REQUIRED) still match source in lib/main.js
- **Evidence:** packed dotenv@17.4.2 tarball; diffed lib/main.d.ts exports against contract.yaml function list (identical); confirmed throw codes in lib/main.js lines 87, 157-186, 357-378
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass=60, drift-by-staleness mode)
- **Reason:** oldest unclaimed `last_deepened` in public-tier index (2026-04-17)

## 2026-06-18 — re-verified clean

- **Latest published:** dotenv@17.4.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** dotenv@17.4.2
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** dotenv@17.4.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** dotenv@17.4.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** dotenv@17.4.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** dotenv@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
