# CHANGELOG — ajv

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 86% → 89%

- **Profile:** `packages/ajv/contract.yaml`
- **Functions added:** removeSchema, addMetaSchema (2 total)
- **Postconditions added:** 4
  - `removeschema-invalid-parameter` (new fn) — source: ajv/dist/core.js:291-324 (v8.20.0)
  - `addmetaschema-duplicate-key` (new fn) — source: ajv/dist/core.js:240-245 (delegates to addSchema)
  - `addmetaschema-invalid-schema` (new fn) — source: ajv/dist/core.js:240-245 (delegates to addSchema)
  - `validateschema-invalid-dollar-schema` (existing fn) — source: ajv/dist/core.js:253-254 throw of `Error("$schema must be a string")`
- **Functions intentionally omitted this pass:** errorsText (pure string-formatting utility, no documented throw behavior)
- **Scanner concerns queued:** 3 (`concern-20260624-ajv-deepen-1`, `concern-20260624-ajv-deepen-2`, `concern-20260624-ajv-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://ajv.js.org/api.html (light on throw-level detail; source-level evidence from ajv@8.20.0 dist/core.js is canonical)
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 62)

## 2026-06-18 — re-verified clean

- **Latest published:** ajv@8.20.0
- **Profile semver:** `>=8.18.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ajv@8.20.0
- **Profile semver:** >=8.18.0 <10.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ajv@8.20.0
- **Profile semver:** `>=8.18.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ajv@8.20.0
- **Profile semver:** `>=8.18.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ajv@8.20.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** ajv@>=8.18.0 <10.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
