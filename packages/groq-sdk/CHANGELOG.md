# CHANGELOG — groq-sdk

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepened (pass 16, deepen-stream-2)

- **Latest published:** groq-sdk@1.3.0
- **Profile semver:** `>=0.3.0` (unchanged — v1.x is additive over v0.3.x for contracted functions)
- **Verdict:** API surface expanded; full v1.3.0 surface now covered
- **Functions added (+9):**
  - `batches.retrieve` — APIError surface; NotFoundError on expired batchID (7-day expiry); RateLimitError on tight poll loops
  - `batches.list` — APIError surface; AuthenticationError / RateLimitError dominant
  - `files.list` — APIError surface; cleanup/audit-job failure mode
  - `files.delete` — APIError surface incl. ConflictError (409) when file is still referenced by an active batch; DATA_LOSS impact
  - `files.content` — APIError surface PLUS Response-body-not-consumed silent-failure postcondition (DATA_LOSS, batch results lost if Response body never read)
  - `files.info` — APIError surface; race-condition NotFoundError pattern
  - `models.retrieve` — APIError surface; Groq deprecates models on rolling basis, NotFoundError dominant for long-lived deployments
  - `models.list` — APIError surface; startup-discovery fallback pattern recommended
  - `models.delete` — APIError surface incl. PermissionDeniedError when targeting built-in (non-fine-tuned) models
- **Postcondition count:** 13 → 21 (`files.content` and `files.delete` each carry a DATA_LOSS warning postcondition in addition to the primary error postcondition)
- **Coverage:** 13/17 covered postconditions → 21/21 (effective 1.0)
- **Scanner version used:** nark@3.1.0 (no scan run — proactive API-surface deepen, not reactive)
- **Sources:** package/resources/{batches,files,models,audio,chat,embeddings}.d.ts in groq-sdk@1.3.0 tarball; https://console.groq.com/docs/batch; https://console.groq.com/docs/models; https://console.groq.com/docs/deprecations; https://console.groq.com/docs/errors
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass=16)

## 2026-06-18 — re-verified clean

- **Latest published:** groq-sdk@1.2.1
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** groq-sdk@1.2.1
- **Profile semver:** >=0.3.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** groq-sdk@1.2.1
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** groq-sdk@1.2.1
- **Profile semver:** `>=0.3.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** groq-sdk@1.2.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-02 — backfilled

- **Verified against:** groq-sdk@>=0.3.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
