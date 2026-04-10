# yup Contract Sources

**Package:** yup
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-26
**Maintainer:** corpus-team

---

## Overview

Yup is a JavaScript schema validation library for validating object shapes and values. Unlike validator.js (which returns booleans), yup **throws `ValidationError`** when validation fails, making proper error handling with try-catch blocks essential.

**Critical behavior:** All validation methods (`validate`, `validateSync`, `validateAt`, `validateSyncAt`) throw exceptions on validation failure. Missing error handling causes application crashes.

---

## Official Documentation

### Primary Sources

1. **GitHub Repository**
   https://github.com/jquense/yup
   Official source code and documentation

2. **API Documentation - Schema Methods**
   https://yup-docs.vercel.app/docs/Api/schema
   Detailed documentation of validation methods

3. **NPM Package**
   https://www.npmjs.com/package/yup
   Package registry and installation

---

## Validation Methods That Throw Exceptions

### 1. validate() - Async Validation

**Signature:** `Schema.validate(value: any, options?: object): Promise<InferType<Schema>, ValidationError>`

**Behavior:**
- Returns Promise resolving to validated/parsed value
- **Rejects with `ValidationError`** on validation failure
- Asynchronous - supports async validation rules

**Source:** https://github.com/jquense/yup#schemavalidatevalue-options-promise

**Example:**
```javascript
try {
  const validData = await schema.validate(data);
  // Use validData
} catch (error) {
  if (error instanceof Yup.ValidationError) {
    console.error('Validation failed:', error.errors);
  }
}
```

**Without try-catch:** Unhandled promise rejection crashes application.

---

### 2. validateSync() - Sync Validation

**Signature:** `Schema.validateSync(value: any, options?: object): InferType<Schema>`

**Behavior:**
- Synchronously validates and returns parsed value
- **Throws `ValidationError`** directly on failure
- Only works if schema has no async tests

**Source:** https://github.com/jquense/yup#schemavalidatesyncvalue-options-any

**Example:**
```javascript
try {
  const validData = schema.validateSync(data);
  // Use validData
} catch (error) {
  if (error instanceof Yup.ValidationError) {
    console.error('Validation failed:', error.errors);
  }
}
```

**Without try-catch:** Uncaught exception crashes application.

---

### 3. validateAt() - Async Field Validation

**Signature:** `Schema.validateAt(path: string, value: any, options?: object): Promise<InferType<Schema>, ValidationError>`

**Behavior:**
- Validates specific nested field at given path
- Returns Promise rejecting with `ValidationError` on failure
- Asynchronous

**Source:** https://github.com/jquense/yup#schemavalidateatpath-string-value-any-options-object-promise

**Example:**
```javascript
try {
  const validEmail = await schema.validateAt('email', formData);
  // Valid email
} catch (error) {
  if (error instanceof Yup.ValidationError) {
    console.error('Email invalid:', error.message);
  }
}
```

**Without try-catch:** Unhandled promise rejection.

---

### 4. validateSyncAt() - Sync Field Validation

**Signature:** `Schema.validateSyncAt(path: string, value: any, options?: object): InferType<Schema>`

**Behavior:**
- Synchronously validates specific nested field
- **Throws `ValidationError`** directly on failure
- Only works with synchronous validation rules

**Source:** https://github.com/jquense/yup#schemavalidatesyncat-path-string-value-any-options-object-any

**Example:**
```javascript
try {
  const validEmail = schema.validateSyncAt('email', formData);
  // Valid email
} catch (error) {
  if (error instanceof Yup.ValidationError) {
    console.error('Email invalid:', error.message);
  }
}
```

**Without try-catch:** Uncaught exception.

---

## ValidationError Structure

**Source:** https://github.com/jquense/yup (README)

**Properties:**
- `message` - Error message string
- `errors` - Array of error messages
- `path` - Path to failing field (for nested validations)
- `value` - The invalid value
- `inner` - Array of `ValidationError` instances (when `abortEarly: false`)

**Example:**
```javascript
catch (error) {
  console.log(error.message);  // "email must be a valid email"
  console.log(error.errors);   // ["email must be a valid email"]
  console.log(error.path);     // "email"
  console.log(error.value);    // "invalid-email"
  console.log(error.inner);    // [ValidationError, ValidationError, ...]
}
```

---

## Validation Options

### abortEarly

**Type:** `boolean`
**Default:** `true`

**Behavior:**
- `true`: Stop validation on first error (default)
- `false`: Validate all fields, return all errors in `error.inner`

**Source:** https://github.com/jquense/yup/issues/44

**Example:**
```javascript
try {
  await schema.validate(data, { abortEarly: false });
} catch (error) {
  // error.inner contains ALL validation errors
  error.inner.forEach(err => {
    console.log(err.path, err.message);
  });
}
```

---

## Safe Methods (Don't Throw)

### isValid() / isValidSync()

**Signatures:**
- `Schema.isValid(value: any, options?: object): Promise<boolean>`
- `Schema.isValidSync(value: any, options?: object): boolean`

**Behavior:**
- Return `true` if valid, `false` if invalid
- **Never throw exceptions**
- Safe for boolean checks without try-catch

**Example:**
```javascript
const valid = await schema.isValid(data);
if (!valid) {
  // Handle invalid data
}
```

**Key difference:** These methods don't throw, but also don't provide error details.

---

## Common Mistakes

### 1. Missing try-catch on validate()

**Source:** https://github.com/jquense/yup/issues/144

**Wrong:**
```javascript
const data = await schema.validate(input);
// ❌ Unhandled promise rejection crashes app
```

**Right:**
```javascript
try {
  const data = await schema.validate(input);
} catch (error) {
  // Handle error
}
```

---

### 2. Missing try-catch on validateSync()

**Source:** https://github.com/jquense/yup/issues/1989

**Wrong:**
```javascript
const data = schema.validateSync(input);
// ❌ Uncaught exception crashes app
```

**Right:**
```javascript
try {
  const data = schema.validateSync(input);
} catch (error) {
  // Handle error
}
```

---

### 3. Confusing isValid() with validate()

**Wrong:**
```javascript
try {
  const isValid = await schema.isValid(data);
  // ⚠️ isValid never throws - try-catch not needed
}
```

**Right:**
```javascript
const isValid = await schema.isValid(data);
if (!isValid) {
  // Handle invalid data
}
```

---

## Security Considerations

### Prototype Pollution Vulnerability

**CVE:** SNYK-JS-YUP-2420835
**Affected Versions:** < 0.30.0
**Fixed Version:** 0.30.0

**Description:** yup is vulnerable to Prototype Pollution via the `.setLocale()` function.

**Source:** https://security.snyk.io/vuln/SNYK-JS-YUP-2420835

**Proof of Concept:**
```javascript
const payload = JSON.parse('{"__proto__":{"polluted":"Yes"}}');
yup.setLocale(payload);
console.log({}.polluted); // "Yes"
```

**Remediation:** Always use yup >= 0.30.0

**Note:** This vulnerability is unrelated to validation error handling. Contract focuses on `ValidationError` throwing behavior.

---

## Best Practices

### 1. Always use try-catch with throwing methods

**Source:** https://dev.to/buschco/validate-like-a-pro-everywhere-with-yup-2phn

```javascript
try {
  const validData = await schema.validate(data, { abortEarly: false });
  // Process validData
} catch (err) {
  if (err instanceof Yup.ValidationError) {
    // Handle validation errors
    const errors = err.inner.reduce((acc, error) => ({
      ...acc,
      [error.path]: error.message
    }), {});
  }
}
```

---

### 2. Use abortEarly: false for complete error reporting

```javascript
try {
  await schema.validate(data, { abortEarly: false });
} catch (error) {
  // error.inner contains all validation errors
  error.inner.forEach(err => {
    console.log(`${err.path}: ${err.message}`);
  });
}
```

---

### 3. Use isValid() for safe boolean checks

```javascript
// When you only need yes/no, not parsed value
const isValid = await schema.isValid(data);
if (!isValid) {
  // Show generic error, don't need details
}
```

---

## Real-World Usage Examples

### Express API Validation

**Source:** https://gist.github.com/manzoorwanijk/5993a520f2ac7890c3b46f70f6818e0a

```javascript
app.post('/api/users', async (req, res) => {
  try {
    const validData = await userSchema.validate(req.body, { abortEarly: false });
    // Create user with validData
    res.json({ success: true });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      res.status(400).json({ errors: error.inner.map(e => ({
        field: e.path,
        message: e.message
      }))});
    }
  }
});
```

---

### React Form Validation

**Source:** https://formik.org/docs/guides/validation

```javascript
const validationSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
});

// In form submit handler
try {
  const validData = await validationSchema.validate(formData, { abortEarly: false });
  // Submit form
} catch (err) {
  if (err instanceof Yup.ValidationError) {
    const errors = err.inner.reduce((acc, error) => ({
      ...acc,
      [error.path]: error.message
    }), {});
    setFormErrors(errors);
  }
}
```

---

## Contract Rationale

**Why these functions are in the contract:**

1. **validate()** - Most commonly used async validation, throws on failure
2. **validateSync()** - Sync validation, throws on failure
3. **validateAt()** - Field-level async validation, throws on failure
4. **validateSyncAt()** - Field-level sync validation, throws on failure

**Why these are NOT in the contract:**

- **isValid()** / **isValidSync()** - Return boolean, never throw exceptions
- **cast()** - Parsing only, doesn't validate
- **describe()** - Returns schema metadata, doesn't validate

**Key principle:** Contract covers all methods that throw `ValidationError` and require error handling.

---

## References

- Official GitHub: https://github.com/jquense/yup
- API Documentation: https://yup-docs.vercel.app/docs/Api/schema
- Best Practices: https://dev.to/buschco/validate-like-a-pro-everywhere-with-yup-2phn
- Security Advisory: https://security.snyk.io/vuln/SNYK-JS-YUP-2420835
- GitHub Issues (Common Patterns): https://github.com/jquense/yup/issues/144
- Formik Integration: https://formik.org/docs/guides/validation
- React Final Form Example: https://gist.github.com/manzoorwanijk/5993a520f2ac7890c3b46f70f6818e0a

---

**Summary:** Yup is exception-based validation. All `validate*()` methods throw `ValidationError` on failure and MUST be wrapped in try-catch or use .catch() handlers. Missing error handling causes application crashes.
