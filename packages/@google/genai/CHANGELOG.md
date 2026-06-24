# CHANGELOG — @google/genai

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 93%

- **Profile:** `packages/@google/genai/contract.yaml`
- **Functions added:** fileSearchStores.uploadToFileSearchStore, fileSearchStores.importFile, tunings.tune, batches.createEmbeddings (4 total)
- **Postconditions added:** 4
- **Functions intentionally omitted this pass:**
  - fileSearchStores.create/get/list/delete — RAG store CRUD with identical ApiError surface to write paths
  - fileSearchStores.documents.* — nested document CRUD inside RAG stores
  - tunings.list/get/cancel — read/cancel paths, same ApiError surface as tune()
  - batches.create/get/list/cancel/delete — pre-existing batch CRUD; createEmbeddings is the runtime-distinct addition
  - tokens.create — auth token creation, admin-tier setup not runtime
  - FileSearchStores.downloadMedia (new in v2.x) — pure URI read, same ApiError surface
- **Scanner concerns queued:** 3 (`concern-20260624-google-genai-deepen-1`, `concern-20260624-google-genai-deepen-2`, `concern-20260624-google-genai-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Package version inspected:** @google/genai@2.10.0 (latest on npm)
- **Sources fetched:**
  - dist/genai.d.ts (local node_modules at @google/genai@2.10.0)
  - https://raw.githubusercontent.com/googleapis/js-genai/v2.10.0/src/file_search_stores.ts
  - https://raw.githubusercontent.com/googleapis/js-genai/v2.10.0/src/tunings.ts
  - https://raw.githubusercontent.com/googleapis/js-genai/v2.10.0/src/batches.ts
  - https://ai.google.dev/gemini-api/docs/file-search
  - https://ai.google.dev/gemini-api/docs/model-tuning
  - https://ai.google.dev/gemini-api/docs/batch-mode
  - https://google.aip.dev/151
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 47, drift-by-staleness mode)
- **Notes:** Coverage drop from 100% → 93% is denominator growth, not regression. SDK grew from 18 async methods (v0.x baseline 2026-04-16) to 52 (v2.10.0). Added 4 runtime-distinct write methods covering new RAG ingestion, fine-tuning, and batch embedding workflows. Variant methods (read/list/delete on the same resources) explicitly omitted because they share the ApiError surface of the contracted write paths.

## 2026-06-18 — re-verified clean

- **Latest published:** @google/genai@2.8.0
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @google/genai@2.8.0
- **Profile semver:** >=0.1.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @google/genai@2.8.0
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @google/genai@2.8.0
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @google/genai@2.8.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @google/genai@>=0.1.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
