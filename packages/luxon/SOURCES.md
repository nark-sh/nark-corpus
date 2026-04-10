# Sources: luxon

**Package:** luxon
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-27
**Status:** production
**Priority:** low

---

## Primary Sources

### Official Documentation
- **DateTime.fromISO**: https://moment.github.io/luxon/api-docs/index.html#datetimefromiso
  - Returns invalid DateTime on bad input
  - Does not throw exceptions

- **DateTime.fromFormat**: https://moment.github.io/luxon/api-docs/index.html#datetimefromformat
  - Returns invalid DateTime when format doesn't match
  - Provides invalidReason and invalidExplanation properties

- **DateTime.fromSQL**: https://moment.github.io/luxon/api-docs/index.html#datetimefromsql
  - Returns invalid DateTime for non-SQL formats

- **DateTime.fromHTTP**: https://moment.github.io/luxon/api-docs/index.html#datetimefromhttp
  - Returns invalid DateTime for non-HTTP date formats

- **DateTime.fromRFC2822**: https://moment.github.io/luxon/api-docs/index.html#datetimefromrfc2822
  - Returns invalid DateTime for non-RFC2822 formats

- **Validity Documentation**: https://moment.github.io/luxon/docs/manual/validity.html
  - Documents isValid property
  - Documents invalidReason and invalidExplanation
  - Invalid objects are created instead of throwing
  - Explains propagation of invalidity through operations

- **Validity Source Code**: https://github.com/moment/luxon/blob/master/docs/validity.md
  - Complete validity documentation with examples
  - Common reasons for invalidity (overflow, unsupported zones, contradictions)
  - Settings.throwOnInvalid opt-in exception mode

- **DateTime.fromObject**: https://moment.github.io/luxon/api-docs/index.html#datetimefromobject
  - Creates DateTime from object with year, month, day, etc.
  - Returns invalid DateTime for impossible calendar values

### NPM Package
- **Package Page**: https://www.npmjs.com/package/luxon
  - Installation and basic usage

### Repository
- **GitHub**: https://github.com/moment/luxon
  - Source code and documentation
  - Created by moment.js team

---

## Behavioral Claims

### Parse Methods Return Invalid Objects
**Claim:** All DateTime.from*() parsing methods return invalid DateTime objects instead of throwing exceptions.

**Evidence:**
- Documentation states all parsing methods return invalid objects on failure
- isValid property is false for invalid objects
- invalidReason and invalidExplanation provide error details
- Source: https://moment.github.io/luxon/docs/manual/validity.html

**Severity:** Warning (validation pattern - not as critical as exception-based errors)

**Rationale:** Luxon uses graceful degradation (like Day.js and Moment.js). Missing validation leads to subtle bugs rather than crashes. Severity downgraded from ERROR to WARNING based on:
- Library design pattern (intended validation-after-parsing)
- Non-fatal consequences (NaN values, degenerate objects)
- Opt-in exception mode available (Settings.throwOnInvalid)
- Similar to established date library patterns

---

## Security Vulnerabilities

### CVE-2023-22467: Regular Expression Denial of Service (ReDoS)

**Affected Method:** `DateTime.fromRFC2822()`

**Affected Versions:**
- luxon 1.0.0 through 1.28.0
- luxon 2.0.0 through 2.5.1
- luxon 3.0.0 through 3.2.0

**Patched Versions:**
- luxon >= 1.28.1 (1.x branch)
- luxon >= 2.5.2 (2.x branch)
- luxon >= 3.2.1 (3.x branch)

**Description:**
The `DateTime.fromRFC2822()` method has quadratic (N^2) complexity on specific inputs, causing severe slowdown for strings exceeding 10,000 characters. This makes applications vulnerable to Denial of Service attacks when processing untrusted input.

**Impact:** CVSS 7.5 (High)
- Attack Vector: Network
- Attack Complexity: Low
- Privileges Required: None
- User Interaction: None

**PoC Example:**
```javascript
DateTime.fromRFC2822("(".repeat(500000)); // Takes several minutes to complete
```

**Mitigation:**
1. Upgrade to patched version (1.28.1+, 2.5.2+, or 3.2.1+)
2. Limit input length before parsing (max 10k characters)
3. Validate and sanitize user input

**References:**
- CVE: https://nvd.nist.gov/vuln/detail/CVE-2023-22467
- GHSA: https://github.com/advisories/GHSA-3xq5-wjfh-ppjc
- CWE-1333: Inefficient Regular Expression Complexity
- Published: 2023-01-04

---

## Invalid Object Properties

When a DateTime is invalid:
- `dt.isValid` → false
- `dt.invalidReason` → string describing why (e.g., "unparsable")
- `dt.invalidExplanation` → more detailed explanation

---

## Additional Context

### Validation Pattern Design

Luxon follows a **graceful degradation** error handling pattern:

1. **No Exceptions by Default**: Parsing methods return invalid DateTime objects instead of throwing
2. **Explicit Validation Required**: Developers must check `.isValid` property
3. **Error Details Available**: `invalidReason` and `invalidExplanation` provide diagnostic information
4. **Opt-in Exceptions**: `Settings.throwOnInvalid = true` enables exception-based error handling

**Example - Proper Validation:**
```javascript
const dt = DateTime.fromISO(userInput);
if (!dt.isValid) {
  console.error('Parse error:', dt.invalidReason, dt.invalidExplanation);
  // Handle error appropriately
  return null;
}
// Safe to use dt here
return dt.toFormat('yyyy-MM-dd');
```

**Example - Missing Validation (Violation):**
```javascript
const dt = DateTime.fromISO(userInput);
return dt.toFormat('yyyy-MM-dd'); // Returns "Invalid DateTime" if input was bad
```

### Invalid DateTime Propagation

Operations on invalid DateTimes return invalid DateTimes:
```javascript
const dt = DateTime.fromISO('invalid');
dt.isValid; // false
dt.plus({ days: 4 }).isValid; // false (invalidity propagates)
dt.year; // NaN
dt.toString(); // "Invalid DateTime"
dt.toObject(); // {}
```

### Common Invalid Reasons

- `"unparsable"` - Input doesn't match expected format
- `"month out of range"` - Month value < 1 or > 12
- `"day out of range"` - Day value invalid for month (e.g., Feb 30)
- `"hour out of range"` - Hour < 0 or > 23
- `"unsupported zone"` - Invalid timezone identifier
- `"conflicting weekday"` - Date doesn't match specified weekday

### Real-World Issues

Based on GitHub issues and discussions:

1. **fromISO() Too Loose** ([#1628](https://github.com/moment/luxon/issues/1628))
   - `DateTime.fromISO('02/01/2020')` returns invalid but doesn't throw
   - Developers may not realize parsing failed without checking isValid

2. **throwOnInvalid Inconsistent** ([#1420](https://github.com/moment/luxon/issues/1420))
   - `Settings.throwOnInvalid` behavior has edge cases
   - Not all invalid scenarios trigger exceptions even with setting enabled

3. **Format Validation Challenge** ([#1479](https://github.com/moment/luxon/issues/1479))
   - No built-in way to validate format before parsing
   - Must parse then check isValid (post-validation, not pre-validation)

## Notes

- Luxon is the modern successor to moment.js (by same team)
- Immutable objects prevent accidental mutations
- Built on native Intl API for internationalization
- Better timezone support than moment.js
- Does NOT throw on invalid input by default - returns invalid object with error properties
- More explicit error handling than moment/dayjs (invalidReason, invalidExplanation)
- Active maintenance with prompt security patches (CVE-2023-22467 patched across all versions)
- Weekly downloads: ~17.5 million (as of 2026-02)

## Research Notes

- Documentation research: 2026-02-27
- CVE analysis: 1 CVE found (CVE-2023-22467, patched)
- Usage analysis: Validation pattern similar to Day.js and Moment.js
- Contract design: WARNING severity, low priority (validation pattern library)
- Expected detection rate: 70-80% (static analysis limitation for validation patterns)
