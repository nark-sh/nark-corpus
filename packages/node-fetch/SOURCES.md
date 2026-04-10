# Sources: node-fetch

**Package:** node-fetch
**Contract Version:** 1.0.0
**Last Updated:** 2026-02-26

---

## Official Documentation

### Error Handling Guide
- **URL:** https://github.com/node-fetch/node-fetch/blob/main/docs/ERROR-HANDLING.md
- **Relevance:** Official documentation on error handling, FetchError types, and network failures
- **Key Points:**
  - All operational errors (except aborted requests) are rejected with FetchError
  - Network errors have `error.type = 'system'` with error.code (ENOTFOUND, ECONNREFUSED, ETIMEDOUT)
  - AbortError for cancelled requests
  - **Critical:** HTTP 3xx-5xx responses are NOT exceptions and should be handled in then()

### NPM Package Page
- **URL:** https://www.npmjs.com/package/node-fetch
- **Relevance:** Official package documentation and usage examples
- **Key Points:**
  - Lightweight fetch() implementation for Node.js
  - Promise-based API matching browser fetch()
  - Supports HTTP/HTTPS requests

---

## Common Error Patterns

### Network-Level Errors (Reject Promise)
1. **DNS Resolution Failure** - ENOTFOUND
2. **Connection Refused** - ECONNREFUSED
3. **Timeout** - ETIMEDOUT
4. **Network Unreachable** - ENETUNREACH
5. **Aborted Requests** - AbortError

### HTTP-Level Errors (Do NOT Reject)
- HTTP 4xx (Client errors) - Response resolves successfully
- HTTP 5xx (Server errors) - Response resolves successfully
- Must check `response.ok` or `response.status` manually

---

## Behavioral Contract Rationale

### Why fetch() Requires Error Handling

**Network failures are common and unpredictable:**
- DNS servers may be unavailable
- Target server may be down
- Network connectivity issues
- Firewall blocking connections
- Request timeouts

**Failure to handle rejections leads to:**
- Unhandled promise rejections
- Application crashes (in newer Node.js versions)
- Silent failures
- Poor user experience

### Critical Gotcha: HTTP Status Codes

Unlike XMLHttpRequest or many HTTP libraries, fetch() **does not reject on HTTP error status codes**:

```javascript
// This will NOT reject even if server returns 404 or 500
const response = await fetch('https://api.example.com/nonexistent');
// response.ok will be false, but Promise resolved successfully
```

**Correct pattern:**
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  // Handles both network errors AND HTTP errors (if you throw them)
  console.error('Fetch failed:', error);
}
```

---

## References

1. [node-fetch Error Handling Documentation](https://github.com/node-fetch/node-fetch/blob/main/docs/ERROR-HANDLING.md)
2. [Fetch API Error Handling - web.dev](https://web.dev/articles/fetch-api-error-handling)
3. [FetchError function - Snyk Advisor](https://snyk.io/advisor/npm-package/node-fetch/functions/node-fetch.FetchError)
4. [Handling Failed HTTP Responses With fetch()](https://www.tjvantoll.com/2015/09/13/fetch-and-errors/)

---

## Version Notes

- **v2.x:** Introduced Promise-based API
- **v3.x:** ESM-only, dropped CommonJS support
- Contract applies to v2.0.0+ (covers both v2 and v3 error behavior)
