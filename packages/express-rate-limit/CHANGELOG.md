# CHANGELOG — express-rate-limit

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (depth +3)

- **Profile:** `packages/express-rate-limit/contract.yaml`
- **Functions added:** none (no new public async surface vs the v8.5.2 .d.ts re-enumeration)
- **Postconditions added:** 3 (store-init-failure-silently-logged, limit-zero-blocks-all-on-major-upgrade, ipv6-subnet-mask-changes-key-shape-on-upgrade)
- **Functions intentionally omitted this pass:** MemoryStore class methods (init/get/increment/decrement/resetKey/resetAll/shutdown) — exported but used only via the rateLimit factory; per-instance MemoryStore access is internal-only; ipKeyGenerator (sync pure utility, unchanged)
- **Scanner concerns queued:** 0 (new postconditions are configuration/upgrade-path hazards; static detection requires options-flow analysis that the current rule families do not yet implement — left for a future bc-fp-harvester pass to surface concrete violation evidence before queueing scanner work)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://express-rate-limit.mintlify.app/reference/changelog, node_modules/express-rate-limit@8.5.2/dist/index.cjs (lines 466-473, 628-657, 845-881), https://github.com/express-rate-limit/express-rate-limit/security/advisories/GHSA-46wh-pxpv-q5gq
- **contract_version:** 1.3.0 -> 1.4.0
- **last_verified:** 2026-04-15 -> 2026-06-24
- **Verified by:** bc-deepen-contract (pass 30, deepen-stream-3, drift-by-staleness mode, 2026-06-24T02:35Z)

## 2026-06-18 — re-verified clean

- **Latest published:** express-rate-limit@8.5.2
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** express-rate-limit@8.5.2
- **Profile semver:** >=6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** express-rate-limit@8.5.2
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** express-rate-limit@8.5.2
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** express-rate-limit@8.5.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** express-rate-limit@>=6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
