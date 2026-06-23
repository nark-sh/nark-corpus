# CHANGELOG — luxon

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass 10 (contract_version 1.4.0)

- **API surface (corrected):** 37 callable methods (was 30 — Interval and Duration surfaces under-counted in pass 2)
- **Contracted before this pass:** 20
- **Contracted after this pass:** 27 (+7)
- **Effective coverage:** 27/27 error-contractable = 100%
- **coverage_score:** 0.67 → 0.73 (denominator grew)
- **Pass author:** deepen-stream-2
- **Scanner version used:** nark@3.1.0 (corpus validate only)
- **New postconditions added (all throw-bearing, all verified empirically on luxon@3.7.2):**
  - `DateTime.hasSame(other, unit)` — `hassame-invalid-unit` — throws `InvalidUnitError` via `startOf() -> normalizeUnit()` when unit is not a recognized luxon unit string
  - `Duration.plus(duration)` — `duration-plus-non-duration-throws` — throws `InvalidArgumentError` via `fromDurationLike()` when arg is a string/null/undefined/non-object
  - `Duration.minus(duration)` — `duration-minus-non-duration-throws` — same throw profile as Duration.plus (delegates to fromDurationLike then plus(negate))
  - `Duration.set(values)` — `duration-set-invalid-unit` — throws `InvalidUnitError` via `normalizeObject() -> normalizeUnit()` when values object contains an unrecognized unit key
  - `Interval.length(unit)` — `interval-length-invalid-unit` — throws `InvalidUnitError` via `toDuration().get(unit)` when unit is not recognized (invalid Interval returns NaN, no throw)
  - `Interval.count(unit)` — `interval-count-invalid-unit` — throws `InvalidUnitError` via `startOf(unit)` when unit is not recognized (invalid Interval returns NaN, no throw)
  - `Interval.toDuration(unit)` — `interval-toduration-invalid-unit` — throws `InvalidUnitError` via `e.diff(s, unit)` when unit is not recognized (invalid Interval returns Invalid Duration, no throw)
- **Evidence:** node_modules/luxon@3.7.2/src/{datetime,duration,interval}.js — line numbers cited in contract.yaml header block. Empirical verification harness at `/tmp/claude/test_luxon.mjs`.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 10)

## 2026-06-18 — re-verified clean

- **Latest published:** luxon@3.7.2
- **Profile semver:** `>=3.2.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** luxon@3.7.2
- **Profile semver:** >=3.2.1 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** luxon@3.7.2
- **Profile semver:** `>=3.2.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** luxon@3.7.2
- **Profile semver:** `>=3.2.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** luxon@3.7.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 52% → 67%

- **Profile:** `packages/luxon/contract.yaml`
- **Functions added:** DateTime.plus, DateTime.minus, Duration.shiftTo, Duration.as, Duration.get (5 total)
- **Postconditions added:** 5 (plus-non-duration-throws, minus-non-duration-throws, shiftto-invalid-unit, duration-as-invalid-unit, duration-get-invalid-unit)
- **Functions intentionally omitted this pass:** none new this pass — prior omission list (fromJSDate, local, utc, now, fromString, fromFormatParser, buildFormatParser, toISO, toISODate, toRelative, toRelativeCalendar, Duration.fromISO, Duration.fromISOTime, Interval.fromDateTimes, Interval.fromISO) unchanged
- **Scanner concerns queued:** 5 (`concern-20260612-luxon-deepen-1` through `-5`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://moment.github.io/luxon/api-docs/index.html#datetimeplus
  - https://moment.github.io/luxon/api-docs/index.html#datetimeminus
  - https://moment.github.io/luxon/api-docs/index.html#durationshiftto
  - https://moment.github.io/luxon/api-docs/index.html#durationas
  - https://moment.github.io/luxon/api-docs/index.html#durationget
  - https://github.com/moment/luxon/blob/master/src/datetime.js#L1675 (plus → Duration.fromDurationLike)
  - https://github.com/moment/luxon/blob/master/src/datetime.js#L1687 (minus → Duration.fromDurationLike)
  - https://github.com/moment/luxon/blob/master/src/duration.js#L314 (fromDurationLike — throws for string/null/undefined)
  - https://github.com/moment/luxon/blob/master/src/duration.js#L421 (normalizeUnit — throws InvalidUnitError)
  - https://github.com/moment/luxon/blob/master/src/duration.js#L705 (get)
  - https://github.com/moment/luxon/blob/master/src/duration.js#L742 (as)
  - https://github.com/moment/luxon/blob/master/src/duration.js#L784 (shiftTo)
- **Empirical verification (luxon@3.7.2 installed in tmp):**
  - `DateTime.now().plus('1d')` → `Error: Unknown duration argument 1d of type string`
  - `DateTime.now().minus('foo')` → `Error: Unknown duration argument foo of type string`
  - `Duration.fromObject({hours:2}).shiftTo('garbage')` → `Error: Invalid unit garbage`
  - `Duration.fromObject({hours:2}).as('garbage')` → `Error: Invalid unit garbage`
  - `Duration.fromObject({hours:2}).get('garbage')` → `Error: Invalid unit garbage`
- **Notes:** Previous pass underestimated the API surface — these 5 throw-bearing methods were not counted in either contracted (13) or omitted (12). Re-enumerated total surface to 30 (was 25). 20 contracted / 30 total = 0.67; effective = 20/20 error-contractable = 1.0.
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T02:33:19Z)

## 2026-04-20 — backfilled

- **Verified against:** luxon@>=3.2.1
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
