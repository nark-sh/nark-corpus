# Sources — googleapis

## Documentation Fetched (2026-04-02)

| URL | Summary |
|-----|---------|
| https://raw.githubusercontent.com/googleapis/google-api-nodejs-client/main/README.md | Main README. Shows error handling with callbacks and promises. Notes that refresh tokens may stop working. |
| https://raw.githubusercontent.com/googleapis/gaxios/main/README.md | gaxios HTTP client README. Confirms GaxiosError is used for shouldRetry/onRetryAttempt callbacks. |
| https://raw.githubusercontent.com/googleapis/gaxios/main/src/common.ts | GaxiosError class source. Has .status, .code, .response, .config properties. Extends Error. |
| https://github.com/advisories?query=googleapis | GitHub advisories. One historical CVE (GHSA-7543-mr7h-6v86) fixed in v39.1.0, not relevant at v171. |

## Key Reference Implementations

- `google/clasp` — `src/core/utils.ts`: Definitive `handleApiError(error: unknown)` that checks
  `instanceof GaxiosError` and extracts `.status` and `.errors[0].message`.
- `civitai/civitai` — `src/server/youtube/client.ts`: Callback pattern rejecting with GaxiosError.
- `gitroomhq/postiz-app` — Multiple googleapis calls, mix of protected and unprotected.

## Error Type

`GaxiosError` from `googleapis-common` / `gaxios` package. Properties:
- `.status` — HTTP status code (401, 403, 404, 429, 500...)
- `.response` — full HTTP response
- `.response.data` — Google API error body
- `.message` — human-readable message
