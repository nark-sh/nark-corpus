# CHANGELOG — mammoth

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 78% (surface expansion)

- **Profile:** `packages/mammoth/contract.yaml`
- **Functions added:** readAsArrayBuffer, readAsBase64String, readAsBuffer (3 total)
- **Postconditions added:** 4 (readasarraybuffer-image-missing-from-zip, readasbase64string-image-missing-from-zip, readasbuffer-image-missing-from-zip, readasbuffer-browser-no-buffer-polyfill)
- **Functions intentionally omitted this pass:** readEmbeddedStyleMap (undocumented internal helper, same error profile already covered by siblings); image.read (deprecated per README L503, replaced by readAs* methods)
- **Note on coverage delta:** raw score dropped 0.80 → 0.78 because total async-callable surface grew from 5 to 9 (the Image-element methods were misclassified as "internal" in the 2026-04-17 pass — they are documented public API consumed inside user-supplied imgElement callbacks). Effective coverage over the non-omitted, public-documented surface is 7/7 = 1.0. The default `mammoth.images.dataUri` converter exercises readAsBase64String on every document containing images, so this surface is on the hot path for the most common usage.
- **Scanner concerns queued:** 3 (`concern-20260624-mammoth-deepen-1`, `concern-20260624-mammoth-deepen-2`, `concern-20260624-mammoth-deepen-3`) — scanner does not yet detect bare await inside imgElement callbacks; queued for bc-scanner-upgrade
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** mammoth@1.12.0 locally installed (README.md, lib/index.js, lib/index.d.ts, lib/documents.js, lib/images.js, lib/zipfile.js, lib/unzip.js, lib/docx/body-reader.js); https://raw.githubusercontent.com/mwilliamson/mammoth.js/master/README.md
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 72, 2026-06-24T09:22:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** mammoth@1.12.0
- **Profile semver:** `>=1.11.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mammoth@1.12.0
- **Profile semver:** >=1.11.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mammoth@1.12.0
- **Profile semver:** `>=1.11.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mammoth@1.12.0
- **Profile semver:** `>=1.11.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mammoth@1.12.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** mammoth@>=1.11.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
