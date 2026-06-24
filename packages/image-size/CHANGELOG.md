# CHANGELOG — image-size

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verification)

- **Profile:** `packages/image-size/contract.yaml`
- **Latest published:** image-size@2.0.2 (unchanged since 2026-04-17 deepen)
- **API surface:** 4 exported functions (`imageSize`, `imageSizeFromFile`, `disableTypes`, `setConcurrency`)
- **Async-callable surface:** 2 functions (`imageSize` sync but throws, `imageSizeFromFile` async)
- **Contracted:** 2/2 (100%) — 6 postconditions across both functions
- **Functions added this pass:** 0 (re-verification only)
- **Postconditions added this pass:** 0 (all existing postconditions re-confirmed from source)
- **Functions intentionally omitted this pass:** `disableTypes` (config-only, no throws), `setConcurrency` (config-only, no throws)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched (re-confirmed):**
  - node_modules/image-size@2.0.2/dist/lookup.cjs — `throw new TypeError("unsupported file type")` (line 1013), `throw new TypeError("disabled file type")` (line 998), per-format `throw new TypeError("Invalid X")` and `throw new TypeError("Corrupt JPG, exceeded buffer limits")` for corrupt data
  - node_modules/image-size@2.0.2/dist/fromFile.cjs — `throw new Error("Empty file")` when `size <= 0`, `fs.promises.open()` rejects on ENOENT/EACCES, `imageSize(input)` re-thrown into Promise rejection for corrupt data
- **Verdict:** API surface unchanged since prior deepen. All 6 postconditions remain accurate. `last_verified` rolled forward.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 75 on 2026-06-24T10:01Z)

## 2026-06-18 — re-verified clean

- **Latest published:** image-size@2.0.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** image-size@2.0.2
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** image-size@2.0.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** image-size@2.0.2
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** image-size@2.0.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** image-size@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
