# CHANGELOG — @neondatabase/serverless

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 5/5 (1.0) → 6/6 (1.0)

- **Profile:** `packages/@neondatabase/serverless/contract.yaml`
- **Functions added:** sql_query (1 total)
- **Postconditions added:** 1 (`neon-db-error` on sqlFn.query())
- **Functions intentionally omitted this pass:** sqlFn.unsafe (sync, returns wrapper), escapeIdentifier/Literal (sync helpers), warnIfBrowser (sync void), Cert/TrustedCert/startTls (internal TLS plumbing — error surface already covered by Pool.connect/Client.connect contract)
- **Scanner concerns queued:** 0 (existing `await_patterns: ['.query(']` + `factory_methods: ['neon']` already detect sql.query() call shape)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://neon.tech/docs/serverless/serverless-driver, upstream CHANGELOG.md 1.0.0 (2025-03-25), node_modules/@neondatabase/serverless@1.1.0 index.d.ts (line 837) and index.js (lines 1290-1300)
- **Verified by:** bc-deepen-contract (pass 26, deepen-stream-2, 2026-06-23T00:57:18Z)
- **Notes:** drift-by-staleness re-verification of an entry last_deepened 2026-04-11 with reconstructed-from-contract.yaml metadata. Phase 1 surface enumeration against v1.1.0 found one genuine gap: sql.query() — the explicit-parameterized-query method on the function returned by neon(), introduced in v1.0.0 as the security-hardening escape hatch after v1.0 made `neon()(rawString)` a type+runtime error. Distinct shape from Pool.query/Client.query (different receiver and HTTP transport). Added 5 new ground-truth fixture annotations (3 SHOULD_FIRE / 2 SHOULD_NOT_FIRE); all 26 neon tests pass.

## 2026-06-18 — re-verified clean

- **Latest published:** @neondatabase/serverless@1.1.0
- **Profile semver:** `>=0.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @neondatabase/serverless@1.1.0
- **Profile semver:** >=0.7.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @neondatabase/serverless@1.1.0
- **Profile semver:** `>=0.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @neondatabase/serverless@1.1.0
- **Profile semver:** `>=0.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @neondatabase/serverless@1.1.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-11 — backfilled

- **Verified against:** @neondatabase/serverless@>=0.7.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
