# Sources: jsonschema

**Package:** jsonschema
**Category:** JSON Schema Validation Library
**Research Date:** 2026-03-05
**Status:** DRAFT - Testing for production promotion

---

## Official Documentation

### Primary Sources
- **GitHub Repository:** https://github.com/tdegrunt/jsonschema
- **README:** https://github.com/tdegrunt/jsonschema/blob/master/README.md
- **npm Package:** https://www.npmjs.com/package/jsonschema
- **Examples:** https://github.com/tdegrunt/jsonschema/blob/master/examples/all.js
- **Snyk Package Health:** https://snyk.io/advisor/npm-package/jsonschema

---

## Error Handling Behavior

### Two Modes of Operation

The jsonschema package has **dual error handling behavior**:

#### 1. Default Mode (Return Value) - MOST COMMON
**Behavior:** Returns `ValidatorResult` object
**Detection:** ❌ Analyzer CANNOT detect missing result checks
**Usage:** ~70-90% of developers use this pattern

```javascript
var result = v.validate(instance, schema);
if (!result.valid) {
  // Handle errors via result.errors array
}
```

**Source:** https://github.com/tdegrunt/jsonschema/blob/master/README.md#usage

#### 2. Throwing Mode (Optional) - LESS COMMON
**Behavior:** Throws exceptions when options are set
**Detection:** ✅ Analyzer CAN detect missing try-catch
**Usage:** ~10-30% of developers use throw options

**Options:**
- `throwFirst` - Throws `ValidatorResultError` at first error
- `throwAll` - Throws `ValidatorResultError` after full validation
- `throwError` - Throws `ValidationError` at first error

```javascript
try {
  var result = v.validate(instance, schema, { throwFirst: true });
} catch (error) {
  // Handle ValidatorResultError
}
```

**Source:** https://github.com/tdegrunt/jsonschema/blob/master/README.md

---

## Error Types

### ValidatorResult Object
Returned in default mode:
- **valid** (boolean) - Whether validation passed
- **errors** (ValidationError[]) - Array of validation errors
- **instance** - The value being validated
- **schema** - The schema used

**Source:** https://github.com/tdegrunt/jsonschema/blob/master/README.md

### ValidationError Object
Each error contains:
- **path** - Array showing location in nested structures
- **property** - Dot-delimited path string (e.g., "instance.address.zip")
- **message** - Human-readable failure description
- **schema** - The specific schema keyword that failed
- **name** - Keyword identifier (for localization)
- **argument** - Additional context

**Source:** https://github.com/tdegrunt/jsonschema/blob/master/README.md

### ValidatorResultError
Thrown when `throwFirst` or `throwAll` options are set:
- Inherits from Error
- Contains all ValidatorResult properties
- Includes stack trace

### SchemaError
Thrown by `addSchema()` when schema is invalid or undefined:
- Common when loading schemas from external sources
- TypeError: Cannot read property 'id' of undefined

**Source:** https://github.com/tdegrunt/jsonschema/issues/290

---

## Common Mistakes & GitHub Issues

### 1. Undefined Schema Properties
**Issue:** Setting schema property to `undefined` causes TypeError
**Impact:** Unhandled exception during validation
**Source:** https://github.com/tdegrunt/jsonschema/issues/60

### 2. Missing Result Validation Check
**Issue:** Not checking `result.valid` allows invalid data to pass
**Impact:** Silent validation failures, data corruption
**Pattern:** Most common mistake with default mode

### 3. Nested Error Handling
**Issue:** `oneOf`/`anyOf` failures return binary state without root causes
**Limitation:** Cannot determine which sub-schema failed
**Source:** https://github.com/tdegrunt/jsonschema/issues/189

### 4. Schema Split Across Files
**Issue:** Multi-file schemas that work on jsonschemavalidator.net fail in npm module
**Source:** https://github.com/tdegrunt/jsonschema/issues/175

---

## Security & CVEs

### No Direct CVEs Found
**Finding:** The `jsonschema` package (by tdegrunt) has NO known CVEs in Snyk database
**Note:** Different from `json-schema` package (with hyphen) which has CVE-2021-3918
**Source:** https://snyk.io/advisor/npm-package/jsonschema

### Deprecation Warning
**Issue:** Uses `url.parse()` which has security implications
**Recommendation:** Should migrate to WHATWG URL API
**Note:** No CVEs issued for url.parse() vulnerabilities
**Source:** https://github.com/tdegrunt/jsonschema/issues/393

---

## Package Maintenance

- **Downloads:** 5,035,848 per week (influential project)
- **Maintenance:** Sustainable but slow (no releases in 12 months as of Feb 2026)
- **Stability:** Mature, stable API
- **Alternatives:** ajv, joi, yup (all have similar analyzer limitations)

**Source:** https://snyk.io/advisor/npm-package/jsonschema

---

## Analyzer Capability

### Detection Rate: ~10-30% (Throwing mode only)

**Why Low Detection:**
- Default behavior is return-value based (70-90% usage)
- Analyzer only detects try-catch patterns (throwing mode)
- Analyzer cannot detect missing `result.valid` checks

**What Analyzer CAN Detect:**
- ✅ Missing try-catch when `throwFirst`/`throwAll`/`throwError` options used
- ✅ Missing try-catch around `addSchema()` calls

**What Analyzer CANNOT Detect:**
- ❌ Missing `result.valid` checks (default mode - most common)
- ❌ Ignoring `result.errors` array
- ❌ Silent validation failures

---

## Contract Design Rationale

This contract focuses on the **throwing mode** because:
1. Analyzer can only detect try-catch patterns (throwing mode)
2. Default mode (return-value) requires analyzer enhancement
3. Better to document partial coverage than no coverage

**Trade-off:** Contract will have low detection rate for default mode but provides value for throwing mode usage.

**Future Enhancement:** When analyzer supports return-value checking:
- Add postconditions for missing `result.valid` checks
- Increase detection rate to 80-90%
- Cover the majority usage pattern

---

## Testing Methodology

### Test Fixtures Created

1. **proper-error-handling.ts**
   - Throwing mode with try-catch (SHOULD PASS)
   - Default mode with result checking (SHOULD PASS)

2. **missing-error-handling.ts**
   - Throwing mode without try-catch (SHOULD FAIL)
   - Default mode without checking (analyzer cannot detect)

3. **instance-usage.ts**
   - Validator class usage patterns
   - Both proper and improper patterns

4. **edge-cases.ts**
   - Mixed mode usage
   - Complex scenarios

### Expected Results

**For throwing mode usage (throwFirst/throwAll/throwError):**
- Analyzer SHOULD detect missing try-catch
- Expected violations: 5-9 (one per unprotected throw call)

**For default mode usage:**
- Analyzer CANNOT detect missing result checks
- No violations expected (limitation documented)

---

## Real-World Usage Patterns

Based on GitHub code search and npm registry analysis:

### Common Pattern 1: Default Mode (70%+)
```javascript
function validateUser(data) {
  const result = validator.validate(data, userSchema);
  if (!result.valid) {
    return { error: result.errors };
  }
  return { data };
}
```

### Common Pattern 2: Throwing Mode (10-20%)
```javascript
function validateUser(data) {
  try {
    validator.validate(data, userSchema, { throwFirst: true });
    return { data };
  } catch (error) {
    return { error: error.message };
  }
}
```

### Common Mistake (10%+)
```javascript
// Missing result check - silent failure
function validateUser(data) {
  const result = validator.validate(data, userSchema);
  return { data }; // Assumes validation passed!
}
```

---

## Promotion Criteria

### For PRODUCTION Status

Contract can be promoted to production if:
- ✅ Analyzer successfully tests on fixtures
- ✅ Throwing mode violations detected correctly
- ✅ Real-world validation shows consistent behavior
- ✅ Detection rate for throwing mode >80%
- ⚠️  Default mode limitations clearly documented

### Current Status

- **Phase 1-5:** ✅ Complete
- **Phase 6:** ⏳ Testing now
- **Phase 7:** ⏳ Pending
- **Phase 8:** ✅ Documentation complete

---

## References

- JSON Schema Specification: https://json-schema.org/
- JSON Schema Validator Comparison: https://json-schema.org/implementations#validators
- Package Documentation: https://github.com/tdegrunt/jsonschema/blob/master/README.md
- Issue Tracker: https://github.com/tdegrunt/jsonschema/issues
- npm Registry: https://www.npmjs.com/package/jsonschema
- Security Analysis: https://snyk.io/advisor/npm-package/jsonschema
