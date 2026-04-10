# Sources — @upstash/qstash

## Claim: publishJSON/publish/enqueueJSON throw QstashError on HTTP failures

**Source 1:** GitHub source code — `src/client/http.ts`
https://github.com/upstash/qstash-js/blob/main/src/client/http.ts

The `HttpClient` class used by all publish methods throws `QstashError` (and subclasses) on non-2xx responses. The `processRequest` method:
1. Checks response status
2. On 429: throws `QstashRatelimitError`, `QstashDailyRatelimitError`, or `QstashChatRatelimitError` based on headers
3. On other non-2xx: throws `QstashError` with response body text

**Source 2:** QStash TypeScript SDK Examples
https://upstash.com/docs/qstash/sdks/ts/examples/publish

Official documentation for publishJSON usage.

**Source 3:** npm package page
https://www.npmjs.com/package/@upstash/qstash

## Claim: Error class hierarchy

**Source:** GitHub source code — `src/client/error.ts` (inferred from http.ts imports)
```
QstashError extends Error
  QstashRatelimitError extends QstashError
  QstashDailyRatelimitError extends QstashError
  QstashChatRatelimitError extends QstashError
  QstashEmptyArrayError extends QstashError
SignatureError extends Error (from receiver.ts)
```

## Claim: No auto-retry at publish time

**Source:** QStash documentation on retries
https://upstash.com/docs/qstash/features/retry

Retries apply to message DELIVERY (QStash retrying the destination URL). The SDK's `RetryConfig` controls HTTP request retries on the client side, but defaults to 0.

## Claim: receiver.verify() throws SignatureError

**Source:** GitHub source code — `src/receiver.ts`
https://github.com/upstash/qstash-js/blob/main/src/receiver.ts

`SignatureError` is thrown when JWT signature is invalid, URL doesn't match, or body hash doesn't match.

## Package Metadata

- **Package:** `@upstash/qstash`
- **npm:** https://www.npmjs.com/package/@upstash/qstash
- **GitHub:** https://github.com/upstash/qstash-js
- **Verified version range:** >=2.0.0
- **License:** MIT
- **Maintainer:** Upstash, Inc.
