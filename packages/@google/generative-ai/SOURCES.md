# Sources: @google/generative-ai

All behavioral claims in `contract.yaml` are documented here with primary sources.

## Official Documentation

- **Error Handling Guide**
  https://ai.google.dev/gemini-api/docs/error-codes
  Documents HTTP status codes returned by the Gemini API: 400 (invalid argument),
  403 (permission denied / invalid API key), 429 (quota exceeded), 500/503 (server errors).

- **Safety Settings**
  https://ai.google.dev/gemini-api/docs/safety-settings
  Documents safety filter behavior: blocked prompts set `promptFeedback.blockReason`,
  blocked responses set `candidate.finishReason = "SAFETY"`. Calling `response.text()`
  on a blocked response throws `GoogleGenerativeAIResponseError`.

- **Streaming API**
  https://ai.google.dev/gemini-api/docs/text-generation#generate-a-text-stream
  Documents `generateContentStream()` / `sendMessageStream()` patterns and error surface.

- **API Reference: GenerativeModel**
  https://ai.google.dev/api/generate-content
  Full API surface for `generateContent`, `generateContentStream`, `startChat`,
  `embedContent`, `countTokens`.

## Package Source (Error Types)

- **Error class definitions**
  https://github.com/google-gemini/generative-ai-js/blob/main/src/errors.ts
  Source of truth for exported error classes:
  - `GoogleGenerativeAIError` — base class
  - `GoogleGenerativeAIFetchError` — network/HTTP errors (`.status`, `.statusText`, `.errorDetails`)
  - `GoogleGenerativeAIResponseError<T>` — deferred error from `response.text()` on blocked content
  - `GoogleGenerativeAIRequestInputError` — malformed input
  - `GoogleGenerativeAIAbortError` — timeout / AbortSignal cancellation (added 0.23.0)

- **npm package registry**
  https://www.npmjs.com/package/@google/generative-ai
  Version history and deprecation notice (EOL: November 30, 2025; replaced by `@google/genai`).

## Key Behavioral Claims

### `generateContent` / `sendMessage` throw at the network layer

`GoogleGenerativeAIFetchError` is thrown when the HTTP request fails. Confirmed in
`src/fetch.ts` in the package source — the `makeRequest()` function wraps `fetch()`
and converts HTTP error responses into `GoogleGenerativeAIFetchError`.

Source: https://github.com/google-gemini/generative-ai-js/blob/main/src/requests/request.ts

### Safety blocks are deferred errors from response accessors

When the Gemini API returns a response with `finishReason: "SAFETY"` or
`promptFeedback.blockReason` set, calling `response.text()` throws
`GoogleGenerativeAIResponseError` synchronously. The `await generateContent()` call
itself does **not** throw. This is the most common source of unexpected production crashes.

Source: https://github.com/google-gemini/generative-ai-js/blob/main/src/types/response-helpers.ts
Source: https://ai.google.dev/gemini-api/docs/safety-settings

### Streaming errors

For `generateContentStream` / `sendMessageStream`, the same patterns apply:
- The initial `await` can throw `GoogleGenerativeAIFetchError`
- `chunk.text()` during iteration can throw `GoogleGenerativeAIResponseError` on blocked chunks

Source: https://github.com/google-gemini/generative-ai-js/blob/main/src/methods/generate-content.ts

## Security Notes

No CVEs have been published for this package. The main security risk is API key exposure —
keys of the form `AIzaSy*` in public repositories can be used to make unauthorized Gemini
API calls at the account owner's expense (up to thousands of dollars/day).

The package reached EOL November 30, 2025. No future security patches will be issued.
Migration path: `@google/genai` (the unified Google AI SDK).

## Version Range

Semver: `>=0.11.0 <1.0.0`

Confirmed in production (found in test-repos/):
- `chatbot-ui`: `^0.11.4`
- `n8n`: `0.24.0`

The error API (`GoogleGenerativeAIFetchError`, `GoogleGenerativeAIResponseError`) has been
stable across this range. The `GoogleGenerativeAIAbortError` was added in 0.23.0 but is not
covered by this contract.
