# Sources — ofetch

## Documentation Sources

| URL | Fetched | Summary |
|-----|---------|---------|
| https://raw.githubusercontent.com/unjs/ofetch/main/README.md | 2026-04-02 | Main README — FetchError thrown on non-2xx responses, .data/.status/.statusCode properties |
| https://raw.githubusercontent.com/unjs/ofetch/main/src/error.ts | 2026-04-02 | FetchError class definition — extends Error, has request/options/response/data/status/statusCode properties |
| https://github.com/unjs/ofetch | 2026-04-02 | Repository homepage |

## Key Error Type

`FetchError` (extends `Error`):
- `.status` / `.statusCode` — HTTP status code from response
- `.data` — Parsed response body
- `.message` — Format: "[METHOD] URL: STATUS_CODE STATUS_TEXT"
- `.request` — The original request
- `.response` — The full response object

## Error Trigger

Any response where `response.ok === false` (non-2xx) automatically throws FetchError.
Can be suppressed with `ignoreResponseError: true` option.

## Real-World Usage

- ourongxing/newsnow: `$fetch.create()` pattern, then calls like `myFetch('/me/sync', { method: 'POST' })` in hooks without try/catch
