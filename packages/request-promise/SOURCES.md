# Sources for request-promise Behavioral Contract

**Last Updated:** 2026-02-27
**Package Version:** 4.x
**Contract Version:** 1.0.0

---

## Official Documentation

### GitHub Repository
**Source:** https://github.com/request/request-promise
**Accessed:** 2026-02-27

Key findings:
- Package is deprecated as of Feb 11, 2020
- Depends on deprecated `request` package
- Promises powered by Bluebird library
- Three main error types: StatusCodeError, RequestError, TransformError

**Error Types:**
- StatusCodeError: Non-2xx HTTP responses (when `simple: true`, the default)
- RequestError: Technical failures (network, DNS, timeout)
- TransformError: Errors in transform functions

**Options affecting error behavior:**
- `simple = true` (default): Reject on non-2xx status codes
- `resolveWithFullResponse = false` (default): Return body only
- `transform`: Custom response transformation
- `transform2xxOnly = false`: Apply transform to all responses

---

## npm Package Page
**Source:** https://www.npmjs.com/package/request-promise
**Accessed:** 2026-02-27

Deprecation notice confirms:
- Package fully deprecated
- Recommends alternatives: got, axios, native fetch
- Last publish: Several years ago
- Still has ~2M weekly downloads (legacy usage)

---

## Error Handling Documentation

### StatusCodeError
**Source:** GitHub issue #48 - "How do you handle error responses properly?"
**URL:** https://github.com/request/request-promise/issues/48
**Accessed:** 2026-02-27

Confirms:
- StatusCodeError thrown for non-2xx responses by default
- Can access: err.statusCode, err.error, err.options, err.response
- Can disable with `simple: false`

### RequestError
**Source:** GitHub issue #203 - "I often get some RequestError? Why"
**URL:** https://github.com/request/request-promise/issues/203
**Accessed:** 2026-02-27

Confirms:
- RequestError for network failures
- err.cause contains underlying error
- Common causes: ECONNREFUSED, ENOTFOUND, ETIMEDOUT

### TransformError
**Source:** GitHub README section on Transforming Responses
**URL:** https://github.com/request/request-promise
**Accessed:** 2026-02-27

Confirms:
- Wraps errors thrown by transform functions
- err.cause contains original transform error
- transform2xxOnly option can limit when transforms run

---

## Real-World Usage Issues

### Unhandled Promise Rejections
**Source:** GitHub issue #263 - "Possibly unhandled StatusCodeError"
**URL:** https://github.com/request/request-promise/issues/263
**Accessed:** 2026-02-27

Shows common mistake:
- Developers forget to add .catch() handlers
- Results in "Unhandled rejection StatusCodeError"
- Particularly common with async/await without try-catch

**Source:** GitHub issue #168 - "Unhandled rejection StatusCodeError: 400"
**URL:** https://github.com/request/request-promise/issues/168
**Accessed:** 2026-02-27

Demonstrates:
- Even following documentation, developers miss error handling
- 400 responses throw by default (non-2xx)
- Must explicitly handle or set simple: false

**Source:** GitHub issue #191 - "Unhandled rejection error: 401 Unauthorized"
**URL:** https://github.com/request/request-promise/issues/191
**Accessed:** 2026-02-27

Shows:
- Authentication failures (401) also throw StatusCodeError
- Common in API integrations
- Requires explicit error handling

---

## Async/Await Error Handling Best Practices

**Source:** "Async/Await Error Handling" by Wes Bos
**URL:** https://wesbos.com/javascript/12-advanced-flow-control/71-async-await-error-handling
**Accessed:** 2026-02-27

Best practices:
- Always use try-catch with async/await
- Without try-catch, unhandled rejections crash Node.js
- Can use .catch() on individual promises as alternative

**Source:** "Best Practices for Error Handling with async/await in JavaScript"
**URL:** https://dev.to/uzairsaleemkhan/best-practices-for-error-handling-with-asyncawait-in-javascript-1cip
**Accessed:** 2026-02-27

Emphasizes:
- Try-catch is essential for async/await
- Without it, errors become unhandled rejections
- Future Node.js versions will terminate process on unhandled rejections

---

## Security and CVE Information

**Source:** GitHub issue #3411 (request/request repository)
**URL:** https://github.com/request/request/issues/3411
**Accessed:** 2026-02-27

Security status:
- Underlying `request` package has CVE-2021-44907 (qs dependency)
- Package deprecated, no security updates
- Recommendation: Migrate to maintained alternatives

**Source:** "Where to find npm vulnerabilities?"
**URL:** https://www.nodejs-security.com/blog/where-to-find-npm-vulnerabilities
**Accessed:** 2026-02-27

Lists request among vulnerable packages:
- Multiple dependencies with known CVEs
- No longer receiving updates
- Security risk for continued use

---

## Alternative Libraries

**Source:** request-promise README deprecation notice
**URL:** https://github.com/request/request-promise
**Accessed:** 2026-02-27

Recommended alternatives:
- `got` - Modern, actively maintained
- `axios` - Popular, widely used
- Native `fetch` - Built into Node.js 18+
- `request-promise-native` - Uses native Promises (also deprecated)

---

## Contract Design Rationale

### Why ERROR severity?
- All three error types (StatusCodeError, RequestError, TransformError) are thrown exceptions
- Not handling them causes unhandled promise rejections
- Can crash Node.js applications
- Multiple real-world issues confirm this is a common mistake

### Why 85% estimated detection rate?
- Promise rejections are detected effectively by static analysis
- Similar to axios (also 85%+ detection)
- Cannot detect:
  - Global promise rejection handlers
  - simple: false (disables StatusCodeError)
  - Dynamic code paths

### Why production status despite deprecation?
- Still widely used in legacy codebases (~2M weekly downloads)
- Clear error patterns that can be detected
- High value for legacy code maintenance
- Contract helps migration (documents behavior to preserve when migrating)

---

## Key Behavioral Insights

1. **Default Rejection on Non-2xx:** Unlike some HTTP clients, request-promise rejects by default on 4xx/5xx responses. This catches many developers off-guard.

2. **Bluebird-Specific Features:** Uses Bluebird promises, which have additional methods (.finally(), .catch() with error type filtering). May not work with native Promises.

3. **Transform Timing:** Transforms run on all responses by default. Can throw TransformError even on error responses unless transform2xxOnly: true.

4. **Deprecation Context:** While deprecated, contract still valuable for:
   - Legacy code maintenance
   - Understanding behavior for migration
   - Documenting anti-patterns to avoid in replacements

---

## Additional References

- GitHub issue #52: "export RequestError and StatusCodeError"
- GitHub issue #184: "better stacktraces"
- GitHub issue #170: ".catch(function(error) { } ) - Error is response object"

All sources accessed and verified on 2026-02-27.
