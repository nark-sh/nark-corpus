# CHANGELOG — dayjs

## 2026-06-25 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:** >=1.10.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 86% -> 100%

- **Profile:** `packages/dayjs/contract.yaml`
- **Functions added:** humanize (1 total)
- **Postconditions added:** 1 (`humanize-missing-relativetime-plugin`)
- **Functions intentionally omitted this pass:** diff (NaN propagation already covered by `dayjs-invalid-date`)
- **Scanner concerns queued:** 1 (`concern-20260624-dayjs-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://day.js.org/docs/en/durations/humanize, https://day.js.org/docs/en/plugin/relative-time
- **Verified by:** bc-deepen-contract (pass 38 on 2026-06-24T04:26Z)
- **Empirical:** reproduced TypeError "fromNow is not a function" against dayjs@1.11.21 via `dayjs.duration(60000).humanize()` with only duration plugin extended


## 2026-06-18 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:** `>=1.10.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:** >=1.10.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:** `>=1.10.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:** `>=1.10.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** dayjs@1.11.21
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** dayjs@>=1.10.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
