# CHANGELOG — p-queue

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 78% → 100%

- **Profile:** `packages/p-queue/contract.yaml`
- **Functions added:** onRateLimit, onRateLimitCleared (2 total)
- **Postconditions added:** 4 (onratelimit-no-intervalcap-never-resolves, onratelimit-resolves-immediately-misses-transition, onratelimitcleared-paused-queue-hangs, onratelimitcleared-resolves-immediately-when-not-rate-limited)
- **Functions intentionally omitted this pass:** none — full async surface contracted (9/9)
- **Promoted from intentional-omission:** onRateLimit, onRateLimitCleared (pass 2 had marked these "narrow use case"; p-queue@9.3.0 readme now positions them as a documented backpressure pattern with intervalCap+interval drain/resume, crossing the contracting threshold)
- **Coverage before:** 78% (7/9 raw, 7/7 effective)
- **Coverage after:** 100% (9/9 raw, 9/9 effective)
- **Scanner concerns queued:** 2 (concern-20260623-p-queue-deepen-1, concern-20260623-p-queue-deepen-2)
- **Scanner version used:** nark@3.0.0 (declared baseline; latest dist is 3.1.x)
- **Package version verified:** p-queue@9.3.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/sindresorhus/p-queue/main/readme.md (lines 280-308)
  - https://raw.githubusercontent.com/sindresorhus/p-queue/main/source/index.ts
  - p-queue@9.3.0 dist/index.js lines 549-563 (onRateLimit + onRateLimitCleared implementation)
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 9, 2026-06-23T21:31:41Z)

## 2026-06-18 — re-verified clean

- **Latest published:** p-queue@9.3.0
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** p-queue@9.3.0
- **Profile semver:** >=7.0.0 <10.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** p-queue@9.3.0
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** p-queue@9.3.0
- **Profile semver:** `>=7.0.0 <10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** p-queue@9.3.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** p-queue@>=7.0.0 <10.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
