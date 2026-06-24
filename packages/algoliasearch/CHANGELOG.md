# CHANGELOG — algoliasearch

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 87% → 89% (effective 100% → 100%)

- **Profile:** `packages/algoliasearch/contract.yaml`
- **Functions added:** batch, multipleBatch, browse, browseObjects, operationIndex (5 total)
- **Postconditions added:** 5 (batch-no-try-catch, multiplebatch-no-try-catch, browse-no-try-catch, browseobjects-no-try-catch, operationindex-no-try-catch)
- **Functions intentionally omitted this pass:** ~48 admin-surface methods (API key CRUD, user-ID mapping, cluster mgmt, dictionary entries, IP source allowlist, rules/synonyms admin, customGet/Post/Put/Delete passthrough, accountCopyIndex Node-helper, clearCache) — out-of-scope for the data-path error contract; documented in the bottom `notes:` block of contract.yaml for traceability
- **Scanner concerns queued:** 5 (`concern-20260624-algoliasearch-deepen-1` through `concern-20260624-algoliasearch-deepen-5`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://www.algolia.com/doc/rest-api/search/batch
  - https://www.algolia.com/doc/rest-api/search/multiple-batch
  - https://www.algolia.com/doc/rest-api/search/browse
  - https://www.algolia.com/doc/api-reference/api-methods/copy-index/
  - @algolia/client-search@5.55.1/dist/node.d.ts (full Promise method enumeration)
- **API surface re-enumeration:** Phase 1 enumerated the actual @algolia/client-search@5.55.1 declaration file. The full SearchClient exposes ~76 Promise-returning methods; the data-path subset (the methods a typical SaaS request handler calls) is 28. Previous deepen pass (9, 2026-04-18) was scoped against a smaller historical count of 23, undercounting the admin/control-plane surface. Pass 76 holds the data-path framing and explicitly documents the ~48 admin methods as out-of-scope for the error contract — they belong to devops tooling, not app code paths.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T10:06Z)

## 2026-06-18 — re-verified clean

- **Latest published:** algoliasearch@5.55.0
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** algoliasearch@5.55.0
- **Profile semver:** >=4.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** algoliasearch@5.55.0
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** algoliasearch@5.54.1
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** algoliasearch@5.54.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** algoliasearch@>=4.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
