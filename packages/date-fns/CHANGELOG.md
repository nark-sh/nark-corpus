# CHANGELOG — date-fns

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (no-action re-verify)

- **Profile:** `packages/date-fns/contract.yaml`
- **Functions added:** none (all 16 throwing functions already contracted at pass 2026-04-20)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** ~234 pure math/comparison/getter/setter utilities (unchanged from prior passes — return Invalid Date/NaN/boolean without throwing)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **API surface re-enumerated:** `grep -l "@throws" node_modules/date-fns/*.d.ts` against date-fns@4.4.0 returns the same 16 files as the 2026-04-20 4.1.0 verification (format, formatDistance, formatDistanceStrict, formatDistanceToNow, formatDistanceToNowStrict, formatISO, formatISO9075, formatRelative, formatRFC3339, formatRFC7231, interval, intlFormat, intlFormatDistance, isMatch, lightFormat, parse).
- **Sources fetched:** `https://registry.npmjs.org/date-fns` (resolved latest = 4.4.0); local install at `/private/tmp/claude/bc-deepen/date-fns/node_modules/date-fns@4.4.0` (.d.ts inspection of 16 @throws files).
- **Verdict:** no-action — contracted set still equals throwing-function set; effective coverage stays 1.0 (16/16); raw coverage stays 0.064 (16/250). Bumped `last_verified` 2026-04-20 → 2026-06-24.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 80, drift-by-staleness mode)


## 2026-06-18 — re-verified clean

- **Latest published:** date-fns@4.4.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** date-fns@4.4.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** date-fns@4.4.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** date-fns@4.4.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** date-fns@4.4.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** date-fns@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
