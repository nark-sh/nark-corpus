# Got - Behavioral Contract Sources

## Package Information
- **Package Name:** got
- **Contract Version:** 2.0.0
- **Semver Range:** >=12.0.0
- **Last Verified:** 2026-03-12
- **Verified Against:** got@14.6.6 (installed in fixtures/node_modules)

---

## Primary Sources

### Official Documentation

| Document | URL | What it covers |
|----------|-----|----------------|
| Errors reference | https://github.com/sindresorhus/got/blob/main/documentation/8-errors.md | Full error class hierarchy, when each is thrown, properties |
| Options reference | https://github.com/sindresorhus/got/blob/main/documentation/2-options.md | throwHttpErrors, retry, timeout options |
| Retry documentation | https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md | Default retry behavior, which methods/status codes are retried |
| Streams documentation | https://github.com/sindresorhus/got/blob/main/documentation/3-streams.md | Stream API error model (events vs rejections) |
| Pagination documentation | https://github.com/sindresorhus/got/blob/main/documentation/4-pagination.md | got.paginate() error propagation |
| Instances documentation | https://github.com/sindresorhus/got/blob/main/documentation/10-instances.md | got.extend() behavior and inheritance |

### Source Files Examined (from installed got@14.6.6)

- `dist/source/core/errors.d.ts` — TypeScript declarations for all error classes and their inheritance chain
- `dist/source/core/options.js` — Default retry settings (limit, methods, statusCodes, errorCodes)
- `dist/source/core/options.d.ts` — Documentation for throwHttpErrors, retry, timeout options
- `dist/source/core/calculate-retry-delay.js` — Retry delay logic (exponential backoff, RetryError handling)
- `dist/source/as-promise/types.d.ts` — CancelError (Promise API only)
- `dist/source/types.d.ts` — Got, GotStream, GotPaginate, got.extend() type signatures

---

## Behavioral Claims

### Error Class Hierarchy

All got errors inherit from `RequestError extends Error`:

| Class | code | When thrown | Has `response`? |
|-------|------|-------------|-----------------|
| `RequestError` | POSIX code | Base class: any request failure | Optional |
| `HTTPError` | `ERR_NON_2XX_3XX_RESPONSE` | Non-2xx/3xx status when `throwHttpErrors: true` | Yes |
| `MaxRedirectsError` | `ERR_TOO_MANY_REDIRECTS` | >10 redirects (configurable) | Yes |
| `TimeoutError` | `ETIMEDOUT` | Timeout on any phase (connect, request, response, etc.) | No |
| `ReadError` | varies | Failure reading from response stream | Yes |
| `UploadError` | varies | Failure reading from request body stream | No |
| `CacheError` | varies | Cache adapter failure | No |
| `RetryError` | `ERR_RETRYING` | Manually triggered retry (always causes a new attempt) | No |
| `AbortError` | `ERR_ABORTED` | Request cancelled via AbortController | No |
| `CancelError` | — | Promise cancelled via `.cancel()` (Promise API only) | Optional |

**Source:** `dist/source/core/errors.d.ts`, `dist/source/as-promise/types.d.ts`

---

### throwHttpErrors Option

**Default:** `true`

**Behavior:**
- When `true`: responses with non-2xx/3xx status throw `HTTPError`
- When `false`: responses with 4xx/5xx status resolve with the response object (no throw)
- Network errors (`RequestError`, `TimeoutError`, etc.) always throw regardless of this setting

**Source:** `dist/source/core/options.d.ts` line 1109-1117:
> "Determines if a `got.HTTPError` is thrown for unsuccessful responses. If this is disabled, requests that encounter an error status code will be resolved with the `response` instead of throwing."

---

### Retry Behavior (Defaults from `dist/source/core/options.js`)

```js
retry: {
  limit: 2,
  methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
  // NOTE: POST and PATCH are NOT retried by default
  statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED',
               'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
  backoffLimit: Infinity,
  noise: 100  // ms of jitter
}
```

Delay formula: `min(2^(attempt-1) * 1000, backoffLimit) + random(0, noise)`

After retries are exhausted, the final error is thrown to the caller.

**Source:** `dist/source/core/options.js` lines 149-187

---

### Stream API Error Model

`got.stream()` (and `got.stream.get()`, etc.) returns a Duplex stream, not a Promise.

**Errors are emitted as `'error'` events, not Promise rejections.**

The stream must have an `error` listener attached. Without one, Node.js will treat it as an uncaught exception.

```typescript
// CORRECT
const stream = got.stream('https://example.com');
stream.on('error', (error) => { ... });

// WRONG — try-catch does not work for stream errors
try {
  const stream = got.stream('https://example.com');
} catch (error) {
  // This will NOT catch stream errors
}
```

The `beforeRetry` hook is ignored when using the Stream API.

**Source:** `dist/source/types.d.ts` (GotStream type), got streams documentation

---

### Pagination API Error Model

`got.paginate()` returns an `AsyncIterableIterator`. `got.paginate.all()` returns a `Promise<T[]>`.

Errors from individual page requests propagate to the iterator consumer:
- `for await (const item of got.paginate(...))` — must be in try-catch
- `await got.paginate.all(...)` — must be in try-catch

Each page uses the same error behavior as a regular got() call (retries, throwHttpErrors, etc.).

**Source:** `dist/source/types.d.ts` (GotPaginate type)

---

### got.extend() Inheritance

`got.extend(options)` creates a new Got instance with merged defaults. The returned instance:
- Has identical method signatures: `.get()`, `.post()`, `.put()`, `.patch()`, `.delete()`, `.head()`, `.stream()`, `.paginate()`, `.extend()`
- Inherits all error behavior from the parent
- Can override `throwHttpErrors`, `retry`, `timeout` etc. in the extend options
- Can be further extended: `const api2 = api1.extend({...})`

**Source:** `dist/source/types.d.ts` (Got type), `dist/source/core/options.d.ts`

---

## Verification Notes

The contract was verified by reading the TypeScript declarations and source JS of the installed
got@14.6.6 package directly from `corpus/packages/got/fixtures/node_modules/got/`.

Key changes from stub contract (v1.0.0):
1. Added full error hierarchy with all error classes (not just RequestError/HTTPError)
2. Added `throwHttpErrors: false` edge case — changes behavior from throw to resolve
3. Added `stream` function with correct error model (events, not rejections)
4. Added `paginate` function with error propagation through async iteration
5. Added `extend` function — documents that error behavior is inherited
6. Added `head` function (was missing)
7. Documented retry defaults precisely: POST/PATCH are NOT retried by default
8. Added `upload-error` postcondition for POST (UploadError on body stream failure)
9. Added `timeout-error` postcondition (TimeoutError is a distinct subclass)
10. Added `max-redirects-error` postcondition
11. Updated semver from `>=11.0.0` to `>=12.0.0` (v12 was the ESM-only rewrite)
