# CHANGELOG — validator

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — deepen pass — coverage 40% → 49% (deepen-stream-2 pass 4)

- **Profile:** `packages/validator/contract.yaml`
- **Functions added:** isNumeric, isInt, equals, contains, isAfter, isBefore, ltrim, rtrim (8 total)
- **Postconditions added:** 10
  - isNumeric: isnumeric-non-string-typeerror, isnumeric-invalid-locale-silent-mismatch
  - isInt: isint-non-string-typeerror, isint-range-returns-false-not-throw
  - equals: equals-non-string-typeerror
  - contains: contains-non-string-typeerror, contains-unchecked-return-security-bypass
  - isAfter: isafter-unparseable-date-returns-false
  - isBefore: isbefore-unparseable-date-returns-false
  - ltrim: ltrim-non-string-typeerror
  - rtrim: rtrim-non-string-typeerror
- **Functions intentionally omitted this pass:** isAbaRouting, isBIC, isBtcAddress, isDataURI, isDivisibleBy, isEAN, isEthereumAddress, isFQDN, isFullWidth, isHalfWidth, isHexadecimal, isHexColor, isHSL, isIMEI, isISBN, isISIN, isISO15924, isISO31661Alpha2, isISO31661Alpha3, isISO31661Numeric, isISO4217, isISO6346, isISO6391, isISRC, isISSN, isLatLong, isLocale, isLowercase, isLuhnNumber, isMACAddress, isMD5, isMagnetURI, isMailtoURI, isMimeType, isMongoId, isMultibyte, isOctal, isPassportNumber, isPort, isRFC3339, isRgbColor, isSemVer, isSlug, isSurrogatePair, isTime, isULID, isUppercase, isUUID, isVariableWidth, isIP, isIPRange, alpha — all pure boolean validators with no unique contracts beyond assertString TypeError
- **Scanner concerns queued:** 7 (`concern-20260611-validator-deepen-11` through `concern-20260611-validator-deepen-17`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isNumeric.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isInt.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/equals.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/contains.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isAfter.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/isBefore.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/ltrim.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/rtrim.js
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/alpha.js (decimal locale map)
  - https://github.com/validatorjs/validator.js/blob/master/src/lib/util/assertString.js
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T21:15:00Z)

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
