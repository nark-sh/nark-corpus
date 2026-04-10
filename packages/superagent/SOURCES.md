# Sources for SuperAgent Contract

## Official Documentation

1. **SuperAgent Official Website**
   - URL: https://forwardemail.github.io/superagent/
   - Used for: API reference, error handling patterns, HTTP methods

2. **SuperAgent GitHub Repository**
   - URL: https://github.com/forwardemail/superagent
   - Used for: Source code verification, issue tracking

3. **SuperAgent NPM Package**
   - URL: https://www.npmjs.com/package/superagent
   - Used for: Version information, installation details

## Security Analysis

4. **Snyk Vulnerability Database**
   - URL: https://snyk.io/node-js/superagent
   - Used for: CVE analysis, security vulnerabilities
   - Key finding: v3.7.0+ has all known vulnerabilities fixed

5. **Snyk Package Security**
   - URL: https://security.snyk.io/package/npm/superagent
   - Used for: Detailed vulnerability information

## Code Examples

6. **DefinitelyTyped TypeScript Tests**
   - URL: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/superagent/superagent-tests.ts
   - Used for: Real-world usage patterns, TypeScript examples

7. **Snyk Code Examples**
   - URL: https://snyk.io/advisor/npm-package/superagent/functions/superagent.get
   - URL: https://snyk.io/advisor/npm-package/superagent/functions/superagent.post
   - Used for: Common usage patterns

## Key Behavioral Characteristics

### Error Handling

SuperAgent **treats 4xx and 5xx responses as errors by default**, which is different from fetch() but similar to axios.

**Quote from docs:**
> "SuperAgent treats 4xx and 5xx responses (as well as unhandled 3xx responses) as errors by default. Network failures produce errors with no status or response fields."

### Error Object Structure

Errors contain:
- `err.status` - HTTP status code (if applicable)
- `err.response` - Full response object (if applicable)
- `err.timeout` - Present if timeout occurred
- `err.message` - Error message

### HTTP Methods

All standard HTTP verbs are supported:
- GET: `request.get(url)`
- POST: `request.post(url)`
- PUT: `request.put(url)`
- PATCH: `request.patch(url)`
- DELETE: `request.delete(url)` or `request.del(url)` (IE compatibility)
- HEAD: `request.head(url)`

### Execution Patterns

Requests are executed via:
1. `.then()` - Promise-based
2. `await` - Async/await
3. `.end(callback)` - Legacy callback

**Quote from docs:**
> "A request can be initiated by invoking the appropriate method on the request object, then calling .then() (or .end() or await) to send the request."

## Version Support

**Target:** v3.7.0+

**Rationale:**
- All known CVEs fixed in v3.7.0 (Zip Bomb DoS)
- Earlier versions had multiple security vulnerabilities
- Stable API across v3.x - v10.x

**Supported range:**
```
^3.7.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0 || ^9.0.0 || ^10.0.0
```

## Severity Justification

**All HTTP methods: ERROR severity**

**Rationale:**
1. Network failures are common in production (DNS, connection timeouts, server downtime)
2. HTTP 4xx/5xx errors occur regularly (404, 500, 401, 429 rate limiting)
3. SuperAgent treats HTTP errors as promise rejections by default
4. Unhandled promise rejections can crash Node.js applications
5. Consistent with axios, got, and node-fetch contracts

## Date

Contract created: 2026-02-26
