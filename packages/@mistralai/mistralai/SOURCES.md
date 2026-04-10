# @mistralai/mistralai — Contract Sources

## Official Documentation

- **Chat Completions**: https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post
  - Confirms `client.chat.complete()` makes HTTPS POST to `/v1/chat/completions`.
  - Error responses: 400 (bad request), 401 (unauthorized), 422 (unprocessable), 429 (rate limit), 500/503/504 (server errors).

- **Streaming**: https://docs.mistral.ai/capabilities/completion/#streaming
  - Documents `client.chat.stream()` for Server-Sent Events streaming responses.
  - Same error characteristics as non-streaming; can also fail mid-stream.

- **SDK README/USAGE**: https://github.com/mistralai/client-ts/blob/main/packages/mistralai/USAGE.md
  - TypeScript SDK usage with examples. Official quickstart omits try-catch.

- **Error Handling**: https://github.com/mistralai/client-ts/blob/main/packages/mistralai/src/sdk/sdk.ts
  - SDKError base class, specific subclasses: RateLimitError, UnauthorizedError, BadRequestError,
    ServiceUnavailableError, GatewayTimeoutError, SDKValidationError.

## GitHub Repository

- **mistralai/client-ts**: https://github.com/mistralai/client-ts
  - Official TypeScript SDK. Error classes in `packages/mistralai/src/models/errors/`.
  - Chat namespace in `packages/mistralai/src/sdk/chat.ts`.

## Real-World Evidence

| Repo | Stars | Usage | Error Handling |
|------|-------|-------|----------------|
| cline/cline | 59,274 | `client.chat.stream({...}).catch(handler)` | ✅ .catch() |
| plastic-labs/tutor-gpt | 891 | `client.files.upload/ocr.process` | ✅ try-catch |

Note: All directly accessible repos have proper error handling.
Real-world TPs expected in less mature codebases that follow the official
quickstart examples which omit try-catch.

## Version Notes

- v0.x: `client.chat(params)`, `client.chatStream(params)` — **EOL, not covered**
- v1.0.0: New API with `client.chat.complete()`, `client.chat.stream()` namespace structure
- v1.x → current: API stable, same method names
- Contract covers `>=1.0.0`

## Why try-catch is Required

1. **Auth errors**: Invalid API key → 401 Unauthorized thrown immediately
2. **Rate limits**: Mistral enforces per-minute and per-day limits → 429 RateLimitError
3. **Model errors**: Invalid model name → 400 BadRequest
4. **Network failures**: ECONNREFUSED, ETIMEDOUT on API unavailability
5. **Server errors**: 500/503/504 on Mistral infrastructure issues
6. **SDKValidationError**: Response schema mismatch (rare but possible)

Official quickstart examples commonly omit try-catch, leading to unprotected
calls in production code.
