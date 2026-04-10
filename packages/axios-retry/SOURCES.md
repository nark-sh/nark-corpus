# Sources: axios-retry

This document lists all sources used to create the behavioral contract for `axios-retry`.

**Last Updated:** 2026-02-27

---

## Official Documentation

### Primary Repository
- **URL:** https://github.com/softonic/axios-retry
- **Type:** GitHub Repository (Official)
- **Relevance:** HIGH - Primary source for API documentation and usage patterns
- **Key Information:**
  - Core API: `axiosRetry(axiosInstance, options)`
  - Configuration options: retries, retryDelay, retryCondition, onRetry, onMaxRetryTimesExceeded
  - Built-in delay strategies: noDelay, exponentialDelay, linearDelay
  - Default retry behavior: network errors and 5xx for idempotent requests only
  - Request-specific configuration support

### npm Package Page
- **URL:** https://www.npmjs.com/package/axios-retry
- **Type:** npm Registry
- **Relevance:** HIGH - Official package information and download statistics
- **Key Information:**
  - 5.5M+ weekly downloads
  - Maintained by Softonic
  - No major security vulnerabilities in package itself

---

## Error Handling Patterns

### Default Retry Behavior
- **Source:** https://github.com/softonic/axios-retry/blob/master/README.md
- **Pattern:** By default, only retries:
  1. Network errors (ECONNREFUSED, ETIMEDOUT, etc.)
  2. 5xx errors for idempotent methods (GET, HEAD, OPTIONS, PUT, DELETE)
- **NOT retried by default:** 4xx errors including 429 (rate limiting), 401 (auth)

### Custom Retry Conditions
- **Source:** https://www.joinplank.com/articles/axios-handling-errors-and-using-retry-mechanisms
- **Pattern:** Use `retryCondition` option to customize which errors trigger retries
- **Common Use Case:** Retrying 429 (Too Many Requests) with Retry-After header support

### onMaxRetryTimesExceeded Callback
- **Source:** https://github.com/softonic/axios-retry/blob/master/CHANGELOG.md
- **Purpose:** Handle final failure after all retries exhausted
- **Signature:** `(error: AxiosError, count: number) => void`
- **Common Use Cases:**
  - Logging final failures
  - Triggering logout on auth failures
  - Implementing fallback strategies
  - User notification

---

## Configuration Options

### Core Options
- **retries** (Number, default: 3): Maximum retry attempts
- **retryDelay** (Function): Delay strategy between retries
  - `axiosRetry.noDelay()` - No delay
  - `axiosRetry.exponentialDelay(retryCount, error, initialDelay)` - Exponential backoff
  - `axiosRetry.linearDelay()` - Linear delay
  - Custom function: `(retryCount, error) => milliseconds`
- **retryCondition** (Function, default: `isNetworkOrIdempotentRequestError`): Determines if error should trigger retry
- **shouldResetTimeout** (Boolean, default: false): Reset timeout between retries
- **onRetry** (Function): Callback before each retry - `(retryCount, error, requestConfig) => void`
- **onMaxRetryTimesExceeded** (Function): Callback after final failure - `(error, count) => void`
- **validateResponse** (Function/null, default: null): Custom response validation

### Request-Specific Override
- **Source:** https://github.com/softonic/axios-retry
- **Pattern:** Override defaults per request using `axios-retry` config key
```javascript
client.get('/test', {
  'axios-retry': {
    retries: 0  // Disable retries for this request
  }
})
```

---

## Security Analysis

### axios-retry Package
- **Source:** https://security.snyk.io/package/npm/axios-retry
- **Status:** No direct CVEs reported
- **Maintenance Concern:** No new releases in past 12 months (as of 2026-02)
- **Dependencies:** Relies on axios (which has had security issues)

### axios Dependency Vulnerabilities
- **Source:** https://security.snyk.io/package/npm/axios
- **Known Issues:**
  1. SSRF and credential leakage when passing absolute URLs
  2. DoS vulnerability in Node.js with data: scheme URLs (fixed in axios 0.30.2 and 1.12.0)
- **Recommendation:** Ensure axios dependency is up-to-date

---

## Common Mistakes and Best Practices

### Timeout Configuration
- **Source:** https://github.com/softonic/axios-retry
- **Mistake:** Not understanding global vs per-retry timeout
- **Best Practice:** "Unless `shouldResetTimeout` is set, the plugin interprets the request timeout as a global value, so it is not used for each retry but for the whole request lifecycle"

### Infinite Retry Loops
- **Source:** https://www.zenrows.com/blog/axios-retry
- **Mistake:** Not setting a maximum retry limit
- **Best Practice:** Always configure `retries` parameter to prevent infinite loops

### Status Code Handling
- **Source:** https://www.joinplank.com/articles/axios-handling-errors-and-using-retry-mechanisms
- **Mistake:** Expecting 4xx errors to retry automatically
- **Best Practice:** Use `retryCondition` to explicitly handle status codes like 429

### Error Propagation
- **Source:** https://axios-http.com/docs/handling_errors
- **Mistake:** Not wrapping axios calls in try-catch when retries are exhausted
- **Best Practice:** After all retries fail, axios will throw - always use try-catch for final error handling

---

## Real-World Usage Patterns

### Token Refresh on 401
- **Source:** https://github.com/softonic/axios-retry/issues
- **Pattern:** Use `onRetry` callback for async operations like token refresh
```javascript
onRetry: async (retryCount, error, requestConfig) => {
  if (error.response?.status === 401) {
    await refreshToken();
  }
}
```

### Rate Limiting with Retry-After
- **Source:** https://github.com/softonic/axios-retry
- **Pattern:** Library automatically respects HTTP Retry-After header
- **Behavior:** Uses whichever is greater: header value or configured `retryDelay`

### Exponential Backoff with Initial Delay
- **Source:** https://iproyal.com/blog/axios-retry-requests/
- **Pattern:** Custom delay with initial value
```javascript
retryDelay: (retryCount, error) =>
  axiosRetry.exponentialDelay(retryCount, error, 1000)
```

---

## Behavioral Contract Implications

### What Errors Occur
1. **After retries exhausted:** axios-retry re-throws the final error
2. **Error types:** Same as underlying axios errors (network, HTTP status, timeouts)
3. **No new error types:** axios-retry doesn't introduce new error classes

### Error Handling Requirements
- **Required:** try-catch around axios calls (axios-retry doesn't prevent final throw)
- **Recommended:** Implement `onMaxRetryTimesExceeded` for graceful failure handling
- **Optional:** Use `onRetry` for side effects between attempts

### Functions That Throw
- `axiosRetry()` itself doesn't throw - it's a configuration function
- The underlying axios methods (get, post, etc.) will still throw after retries fail
- No behavioral change in error throwing - axios-retry is transparent

---

## Known Issues and Behavior Changes

### Issue #240: retryCondition not called on 401 (v3.2.0+)
- **Source:** https://github.com/softonic/axios-retry/issues/240
- **Impact:** Breaking change in v3.2.0
- **Workaround:** Documented in issue thread

### Issue #282: onMaxRetryTimesExceeded not triggered
- **Source:** https://github.com/softonic/axios-retry/issues/282
- **Status:** Open issue
- **Impact:** Callback may not fire in certain scenarios

---

## Summary

axios-retry is a **configuration library** that modifies axios behavior but **does not change error throwing patterns**. After retries are exhausted, axios-retry re-throws the final error exactly as axios would. Therefore:

- ✅ **Same postconditions as axios apply**
- ✅ **try-catch still required** around axios HTTP methods
- ✅ **Error handling covered by axios contract**

**Recommendation:** This package does not require a separate behavioral contract. Users should refer to the axios contract for error handling requirements. The axios-retry library only adds retry logic before the final error is thrown.

---

**Total Sources:** 15+ URLs consulted
**Research Date:** 2026-02-27
**Researched By:** Claude AI (claude-agent-1)
