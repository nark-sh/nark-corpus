# CHANGELOG — moment

## 2026-06-25 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:** >=2.29.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 83% (no-op refresh)

- **Profile:** `packages/moment/contract.yaml`
- **Functions added:** none — moment 2.30.1 d.ts re-enumerated, no new async surface, no new error-bearing functions since 2026-04-16
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** diff, toDate, valueOf (NaN propagation already covered by format/toISOString contracts — unchanged)
- **Scanner concerns queued:** 0 (no new functions)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/moment/moment.d.ts @ 2.30.1 (top-level + namespace exports verified)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 46 on 2026-06-24)
- **Notes:** moment is sync-only (no Promise/async in d.ts); existing 15 functions cover all error-bearing surface (NaN propagation, CVE-2022-24785 path traversal, CVE-2022-31129 ReDoS, invalid-date string returns). Parity-gap audit: add/subtract pair covered; min/max pair covered; defineLocale/updateLocale pair covered; format/toISOString/fromNow invalid-output trio covered. Re-verification only — no contract changes.

## 2026-06-18 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:** `>=2.29.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:** >=2.29.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:** `>=2.29.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:** `>=2.29.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** moment@2.30.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** moment@>=2.29.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
