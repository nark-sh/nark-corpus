# CHANGELOG — zod

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 75% → 100%

- **Profile:** `packages/zod/contract.yaml`
- **Functions added:** safeEncodeAsync, safeDecodeAsync (2 total)
- **Postconditions added:** 4 (safe-parse-async-refinement-throw, safe-encode-async-unidirectional-transform, safe-encode-async-refinement-throw, safe-decode-async-refinement-throw)
- **Functions intentionally omitted this pass:** none — prior YAML marked safeEncodeAsync/safeDecodeAsync as intentionally-omitted with reason "no-throw discriminated union", but empirical verification against zod@4.4.3 showed both DO reject with non-ZodError exceptions ($ZodEncodeError on unidirectional transforms, original Error on async-refinement throws). Reclassified as covered.
- **Scanner concerns queued:** 3 (concern-20260624-zod-deepen-1, concern-20260624-zod-deepen-2, concern-20260624-zod-deepen-3)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://raw.githubusercontent.com/colinhacks/zod/main/packages/zod/src/v4/core/parse.ts, https://raw.githubusercontent.com/colinhacks/zod/main/packages/zod/src/v4/core/schemas.ts
- **Verified by:** bc-deepen-contract (pass on 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** zod@4.4.3
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** zod@4.4.3
- **Profile semver:** >=3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** zod@4.4.3
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** zod@4.4.3
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** zod@4.4.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** zod@>=3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
