# Sources — groq-sdk

## Official Documentation

| URL | Description |
|-----|-------------|
| https://console.groq.com/docs/openai | Main API reference (OpenAI-compatible endpoints) |
| https://console.groq.com/docs/errors | Error codes and handling guidance |
| https://console.groq.com/docs/rate-limits | Rate limit tiers and retry guidance |
| https://console.groq.com/docs/speech-text | Audio transcription/translation API |
| https://console.groq.com/docs/text-speech | Text-to-speech API |
| https://console.groq.com/docs/tool-use | Function calling documentation |
| https://console.groq.com/docs/batch | Batch API documentation |

## Source Code

| URL | Description |
|-----|-------------|
| https://github.com/groq/groq-typescript | Official TypeScript SDK source |
| https://www.npmjs.com/package/groq-sdk | npm package (versions, downloads) |

## Error Handling Evidence

Error hierarchy from SDK source:
- `GroqError` → base class
- `APIError` → all API/network errors, has `.status`, `.headers`, `.error`
  - `BadRequestError` (400) — invalid params, unsupported features
  - `AuthenticationError` (401) — invalid/missing API key
  - `PermissionDeniedError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)
  - `UnprocessableEntityError` (422)
  - `RateLimitError` (429) — RPM/TPM/RPD/TPD limits
  - `InternalServerError` (500+)
  - `APIConnectionError` — network unreachable
  - `APIConnectionTimeoutError` — request timeout (default 1 min)
  - `APIUserAbortError` — caller aborted stream

SDK auto-retries on connection errors and 429s (default maxRetries=2).
After retries exhausted, error is **thrown** — callers must handle.

## Version History

- v1.x: current stable API (chat, audio, embeddings, models, batches)
- v0.3.x-0.9.x: earlier releases with same error handling model
- Semver range: `>=0.3.0` (covers all practical production versions)
