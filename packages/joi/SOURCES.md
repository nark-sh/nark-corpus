# Sources: joi

**Package:** joi
**Version:** 17.x - 18.x
**Category:** validation
**Last Updated:** 2026-02-26
**Status:** ✅ COMPLETE

---

## Official Documentation

### Primary Source
- **API Reference:** https://joi.dev/api
  - Comprehensive documentation of all validation methods
  - Error handling patterns and best practices
  - ValidationError structure and properties

### Repository
- **GitHub:** https://github.com/hapijs/joi
  - Official repository under hapijs organization
  - 21.2k+ stars, actively maintained
  - No active security advisories

---

## Key Behavioral Requirements

### 1. schema.validate() - Synchronous Validation

**Documentation:** https://joi.dev/api/?v=17.13.3#anyvalidatevalue-options

**Behavior:**
- Returns `{ error, value, warning, artifacts }`
- Does NOT throw errors (returns error object instead)
- Must check `.error` property before using `.value`

**Quote from Docs:**
> "Returns an object with the following keys: `value` - the validated and normalized value, `error` - the validation errors if found."

**Risk:** Invalid data passes through silently if error is not checked

---

### 2. schema.validateAsync() - Asynchronous Validation

**Documentation:** https://joi.dev/api/?v=17.13.3#anyvalidateasyncvalue-options

**Behavior:**
- Returns a Promise
- Rejects promise on validation failure
- Must use try-catch or .catch() handler

**Quote from Docs:**
> "Returns a Promise that resolves to the validated value or rejects with validation errors."

**Risk:** Unhandled promise rejection crashes application

---

### 3. Joi.assert() - Assertion-Based Validation

**Documentation:** https://joi.dev/api/?v=17.13.3#assertvalue-schema-message-options

**Behavior:**
- Throws ValidationError on failure
- No return value (void)
- Must wrap in try-catch

**Quote from Docs:**
> "Throws on validation failure."

**Risk:** Application crash on invalid input if not caught

---

### 4. Joi.attempt() - Throwing Validation

**Documentation:** https://joi.dev/api/?v=17.13.3#attemptvalue-schema-message-options

**Behavior:**
- Returns validated value on success
- Throws ValidationError on failure
- Must wrap in try-catch

**Quote from Docs:**
> "Returns the validated value or throws."

**Risk:** Application crash on invalid input if not caught

---

## Real-World Usage Examples

### Example 1: Docusaurus
**Repository:** https://github.com/facebook/docusaurus
**Usage:** Configuration and front-matter validation
**Pattern:** Proper error checking with `const { error, value } = schema.validate()`

**File:** `packages/docusaurus-utils-validation/src/validationUtils.ts`
```typescript
const {error, warning, value} = finalSchema.validate(options, {
  convert: false,
});

printWarning(warning);

if (error) {
  throw error;  // ✅ Properly checks and throws
}

return value;
```

### Example 2: Next.js with-joi Example
**Repository:** https://github.com/vercel/next.js/tree/canary/examples/with-joi
**Usage:** API request body validation
**Pattern:** Middleware wrapper for validation

**File:** `examples/with-joi/pages/api/people.js`
```typescript
const personSchema = Joi.object({
  age: Joi.number().required(),
  name: Joi.string().required(),
});

router.post(validate({ body: personSchema }), (req, res) => {
  const person = req.body;  // ✅ Middleware handles validation
  return res.status(201).json({ data: person });
});
```

---

## Security & CVE Analysis

**Search Date:** 2026-02-26

**Sources Checked:**
- GitHub Security Advisories: 0 active advisories
- Snyk Vulnerability Database: No behavioral CVEs found
- NVD Database: No relevant entries

**Finding:** No CVEs found related to validation behavior. The primary risk is developer misuse (not checking errors), not library vulnerabilities.

---

## Common Mistakes

### Mistake 1: Not Checking .error Property
```typescript
// ❌ WRONG
const { value } = schema.validate(data);
doSomething(value);  // May be invalid!
```

**Impact:** Invalid data passes through silently
**Fix:** Always check error: `if (error) { /* handle */ }`

### Mistake 2: Missing try-catch for validateAsync()
```typescript
// ❌ WRONG
const value = await schema.validateAsync(data);  // No try-catch
```

**Impact:** Unhandled promise rejection crashes app
**Fix:** Wrap in try-catch block

### Mistake 3: Using assert/attempt without try-catch
```typescript
// ❌ WRONG
Joi.assert(data, schema);  // Will crash if validation fails
```

**Impact:** Application crash on invalid input
**Fix:** Wrap in try-catch block

---

## Production Usage Statistics

**Analysis Date:** 2026-02-26
**Repos Analyzed:** Docusaurus, Next.js
**Validation Calls Found:** 3
**Proper Error Handling:** 3 (100%)

**Conclusion:** High-quality production codebases consistently use proper error handling patterns.

---

## Contract Decisions

### Severity: ERROR
All validation methods require error handling because:
1. **validate()** - Silent failures lead to invalid data in system
2. **validateAsync()** - Unhandled rejections crash applications
3. **assert()/attempt()** - Uncaught exceptions crash applications

### Scope
Contract covers:
- `schema.validate()` - Requires checking .error property
- `schema.validateAsync()` - Requires try-catch
- `Joi.assert()` - Requires try-catch
- `Joi.attempt()` - Requires try-catch

Contract does NOT cover:
- Schema definition methods (`.string()`, `.object()`, etc.)
- Constraint methods (`.required()`, `.min()`, `.max()`, etc.)
- Warning handling (warnings are non-fatal)

---

## References

1. **Official API Documentation**
   https://joi.dev/api
   Comprehensive reference for all methods

2. **Validation Error Structure**
   https://joi.dev/api/#validationerror
   Details on error object properties

3. **Best Practices Guide**
   https://joi.dev/api/#general-usage
   Recommended patterns for validation

4. **Production Examples**
   - Docusaurus validation utilities
   - Next.js API validation examples

---

**Research Completed:** 2026-02-26
**Research Files:** `dev-notes/package-onboarding/joi/.onboarding/research/`
