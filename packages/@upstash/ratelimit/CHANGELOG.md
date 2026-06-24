# CHANGELOG — @upstash/ratelimit

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 89% → 89% (re-confirmed-complete)

- **Profile:** `packages/@upstash/ratelimit/contract.yaml`
- **Functions added:** none (all user-callable async methods already contracted; surface unchanged from 2026-06-18 pass — `node_modules/@upstash/ratelimit/dist/index.d.ts` md5 `f498a3bc6908b566ce4b538f9fe2bf23`, 840 lines, identical to last pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** Analytics.record / .series / .getUsage / .getUsageOverTime / .getMostAllowedBlocked — Analytics is still documented "experimental and can change at any time" in `dist/index.d.ts` line 135 (unchanged); fresh corpus grep across 6200+ active repos confirmed zero `import { Analytics } from '@upstash/ratelimit'` adoption (only upstash's own test suite uses it).
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** `node_modules/@upstash/ratelimit/dist/index.d.ts` (840 lines, full Phase 1 re-enumeration); `node_modules/@upstash/ratelimit/package.json` (confirms version 2.0.8 unchanged); corpus-builder grep for Analytics imports.
- **Effective coverage:** 8/8 user-callable non-experimental async functions = 100% (raw coverage_score 0.89 reflects 8 contracted / 9 total counted; the 1-unit gap remains the rounding artifact from the original 2026-04-13 reconstruction).
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T13:45:23Z)

## 2026-06-18 — deepen pass — coverage 89% → 89% (re-confirmed-complete)

- **Profile:** `packages/@upstash/ratelimit/contract.yaml`
- **Functions added:** none (all user-callable async methods already contracted)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** Analytics.record / .series / .getUsage / .getUsageOverTime / .getMostAllowedBlocked — Analytics is documented "experimental and can change at any time" in `node_modules/@upstash/ratelimit/dist/index.d.ts` (line 135), and zero `import { Analytics } from '@upstash/ratelimit'` occurrences observed across the 6200+ active repo corpus. MultiRegionRatelimit inherits all 6 Ratelimit methods → covered by inherited postconditions, no separate entries needed.
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** node_modules/@upstash/ratelimit/dist/index.d.ts (840 lines, full Phase 1 enumeration); node_modules/@upstash/ratelimit/dist/index.js (lines 50-160 — Analytics class impl); node_modules/@upstash/core-analytics/dist/index.js (ingest impl confirms Redis zincrby call)
- **Effective coverage:** 8/8 user-callable non-experimental async functions = 100% (raw coverage_score 0.89 reflects 8 contracted / 9 total counted; the 1-unit gap is the rounding artifact from the original 2026-04-13 reconstruction).
- **Verified by:** bc-deepen-contract (pass on 2026-06-18T22:32:42Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @upstash/ratelimit@2.0.8
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @upstash/ratelimit@2.0.8
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @upstash/ratelimit@2.0.8
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @upstash/ratelimit@2.0.8
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @upstash/ratelimit@2.0.8
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @upstash/ratelimit@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
