# CHANGELOG — validator

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — deepen pass — coverage 35% → 40%

- **Profile:** `packages/validator/contract.yaml`
- **Functions added:** isEmpty, isFloat, isHash, isIn, isBoolean (5 total)
- **Postconditions added:** 7
  - isEmpty: isempty-whitespace-not-empty-by-default
  - isFloat: isfloat-invalid-locale-silent-false, isfloat-locale-comma-replace-asymmetry
  - isHash: ishash-unknown-algorithm-silent-false
  - isIn: isin-undefined-values-silent-false
  - isBoolean: isboolean-strict-accepts-zero-one
- **Functions intentionally omitted this pass:** isAscii (pure boolean), isLowercase (pure boolean), isUppercase (pure boolean), isMD5 (pure boolean), isFreightContainerID (alias for isISO6346), contains (pure boolean + toString coercion covered by isWhitelisted), toString (Object.prototype)
- **Scanner concerns queued:** 5 (`concern-20260611-validator-deepen-6` through `concern-20260611-validator-deepen-10`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isEmpty.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isFloat.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isHash.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isIn.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isBoolean.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/alpha.js (decimal locale map)
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T20:45:00Z)

## 2026-04-20 — backfilled

- **Verified against:** validator@>=13.15.20
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
