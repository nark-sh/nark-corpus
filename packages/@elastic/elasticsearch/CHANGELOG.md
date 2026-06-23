# CHANGELOG — @elastic/elasticsearch

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (re-confirmed complete)

- **Profile:** `packages/@elastic/elasticsearch/contract.yaml`
- **Functions added:** none (full re-enumeration of API surface against @elastic/elasticsearch@9.4.2 confirmed existing 22 contracted methods cover the production-async-callable surface)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `helpers.search` (thin wrapper over `client.search()` — identical throws: ResponseError, ConnectionError, TimeoutError, NoLivingConnectionsError; covered by the `search` contract's `import_source` matching the same Client instance; documenting omission for parity with `helpers.scrollDocuments` / `helpers.msearch` / `helpers.esql` which were omitted on the same identical-error-profile reasoning in the 2026-04-03 pass). All other 9.4.x additions (esql.query, helpers.scrollSearch, msearch, reindex, closePointInTime, clearScroll) remain contracted from the 2026-04-03 deepen pass.
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** none (re-confirm pass — verified against locally installed @elastic/elasticsearch@9.4.2 dist files: `lib/api/index.d.ts`, `lib/helpers.d.ts`, `lib/client.d.ts`; no doc URLs re-fetched because no new postconditions written)
- **Verified by:** bc-deepen-contract (pass 16, deepen-stream-3, 2026-06-23T23:27:46Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** >=7.0.0 <10.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** `>=7.0.0 <9.0.0` → `>=7.0.0 <10.0.0`
- **Verdict:** no error-handling-relevant changes between v8 and v9 — extended range
- **Changelog evidence:** `@elastic/transport` error classes (ResponseError, ConnectionError, TimeoutError, NoLivingConnectionsError, SerializationError, DeserializationError, ConfigurationError, RequestAbortedError) are byte-for-byte identical between transport@8.10.0 and transport@9.3.7 (verified by diffing extracted d.ts); only `cause?: unknown` added to ErrorOptions interface (non-breaking). elasticsearch v9.0.0 re-exports everything from `@elastic/transport` unchanged.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-11 — backfilled

- **Verified against:** @elastic/elasticsearch@>=7.0.0 <9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
