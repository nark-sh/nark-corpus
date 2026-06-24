# CHANGELOG — @pinecone-database/pinecone

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (drift-by-staleness)

- **Profile:** `packages/@pinecone-database/pinecone/contract.yaml`
- **Pass type:** drift-by-staleness re-verify (last deepened 2026-04-16)
- **SDK version inspected:** @pinecone-database/pinecone@8.0.0
- **Functions added:** `inference.rerank` (1 total)
- **Postconditions added:** 1 (`inference-rerank-no-error-handling`)
- **Promotion rationale:** Reranking was intentionally omitted on 2026-04-16 as "less adoption than embed". As of 2026, two-stage retrieve-and-rerank is a standard production RAG component. Promoted from intentionally-omitted to contracted with documented PineconeArgumentError (pre-network validation) + standard HTTP error contract.
- **Functions intentionally omitted this pass:** configureIndex / createCollection / deleteCollection / describeIndex / describeCollection (admin/config); createAssistant / deleteAssistant / describeAssistant / listAssistants / updateAssistant (assistant vertical, separate from core vector ops); inference.listModels / inference.getModel (read-only); describeIndexStats / describeImport / listNamespaces / describeNamespace (read-only listings); createBackup / createIndexFromBackup / describeBackup / deleteBackup / listBackups / describeRestoreJob / listRestoreJobs (admin/infra)
- **API surface coverage (v8.0.0):** 22 contracted / 58 total async-callable / 36 intentionally omitted. Total grew from 46 (2026-04-16 pass) to 58 because v8 added the Assistant vertical (12 methods) and 4 additional backup/restore methods. Coverage denominator semantics unchanged from prior passes (covered = contracted / non-omitted = 22/22 = 1.0).
- **Scanner concerns queued:** 1 (`concern-20260624-pinecone-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://docs.pinecone.io/guides/search/rerank-results
  - https://docs.pinecone.io/reference/api/inference/rerank
  - https://github.com/pinecone-io/pinecone-ts-client (dist/inference/rerank.js v8.0.0)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass-48 on 2026-06-24T06:51:52Z)


## 2026-06-18 — re-verified clean

- **Latest published:** @pinecone-database/pinecone@8.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @pinecone-database/pinecone@8.0.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @pinecone-database/pinecone@7.2.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @pinecone-database/pinecone@7.2.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @pinecone-database/pinecone@7.2.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @pinecone-database/pinecone@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
