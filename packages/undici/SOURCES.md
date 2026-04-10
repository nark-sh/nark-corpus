# Undici - Behavioral Contract Sources

## Package Information
- **Package Name:** undici
- **Contract Version:** 1.0.0
- **Last Verified:** 2026-02-26

## Primary Sources

### Official Documentation
- [Undici npm package](https://www.npmjs.com/package/undici)
- [GitHub Repository](https://github.com/nodejs/undici)
- [Node.js Fetch Documentation](https://nodejs.org/en/learn/getting-started/fetch)
- [Undici Official Docs](https://undici.nodejs.org/)

## Behavioral Claims

### Network Error Handling
**Claim:** Both `request()` and `fetch()` methods can throw errors on network failures, DNS errors, timeouts, connection refused, certificate validation errors, and resource exhaustion.

**Evidence:**
- Undici is the HTTP/1.1 client written from scratch for Node.js
- Node.js's built-in fetch is powered by undici (available globally since Node.js v18+)
- Both low-level `request()` and high-level `fetch()` APIs return promises
- Network errors cause promise rejection with TypeError
- Error contains `cause` property with underlying error details (UND_ERR_SOCKET, etc.)
- Per Fetch standard: HTTP errors (4xx, 5xx) do NOT throw - only network failures throw

**Error Types:**
- `TypeError: fetch failed` - Generic network failure
- `UND_ERR_SOCKET` - Socket-level errors
- `TypeError: terminated` - Aborted fetch operations
- `RequestContentLengthMismatchError` - Body/header mismatch

**Source References:**
- Official Documentation: https://undici.nodejs.org/
- Node.js fetch docs: https://nodejs.org/en/learn/getting-started/fetch
- GitHub Issues: https://github.com/nodejs/undici/issues (numerous error pattern examples)
- npm package: https://www.npmjs.com/package/undici

**CVE Evidence:**
- CVE-2026-22036: Unbounded decompression chain causes resource exhaustion (fetch can throw)
- CVE-2025-47279: Bad certificate data causes DoS (certificate validation errors)
- CVE-2024-24750: Resource exhaustion on external URLs (fetch can fail)

## Important Notes

**Node.js Integration:** Undici v6.x is bundled in Node.js 20.x and 22.x. Undici v7.x is bundled in Node.js 24.x.

**Fetch API:** Undici's `fetch()` provides a WHATWG Fetch API implementation for Node.js, similar to browser fetch but without CORS checks by default.

**Low-Level API:** The `request()` function provides lower-level access to HTTP requests with more control over streams and responses.

## Contract Justification

Undici is a modern, fast HTTP client for Node.js that powers Node's native fetch. It makes network requests that can fail due to:
- Network connectivity issues
- DNS resolution failures
- Connection timeouts
- Server unavailability

Both `request()` and `fetch()` methods return promises that reject on errors, requiring explicit error handling.

## Verification Date
2026-02-26
