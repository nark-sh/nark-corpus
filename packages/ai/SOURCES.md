# ai (Vercel AI SDK) Behavioral Contract Sources

This document lists all authoritative sources consulted when creating the ai (Vercel AI SDK) behavioral contract.

**Package:** ai
**Versions Covered:** 2.0.0 - 6.x.x
**Contract Version:** 2.0.0
**Last Verified:** 2026-03-12

---

## Official Documentation

### Core Documentation

- **Generating Text**: https://ai-sdk.dev/docs/ai-sdk-core/generating-text
  - Documents generateText() error conditions
  - Documents API provider error handling (rate limits, auth, network, content filtering)
  - Documents maxRetries parameter behavior

- **Streaming Text**: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
  - Documents streamText() error handling model
  - Documents onError callback requirement (errors do NOT throw in streamText)
  - Documents stream error propagation differences vs generateText

- **Generating Structured Data**: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
  - Documents generateObject() and streamObject() error conditions
  - Documents Zod schema validation failures
  - Documents JSON parsing error conditions
  - Documents partial object validation during streaming

- **Embeddings**: https://ai-sdk.dev/docs/ai-sdk-core/embeddings
  - Documents embed() and embedMany() error conditions
  - Documents batch size limits
  - Documents partial batch failure behavior

- **Tools and Tool Calling**: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
  - Documents tool execution error handling
  - Documents tool schema validation errors
  - Documents maxSteps/maxToolRoundtrips for limiting iterations

---

## Key Behavioral Insights

### streamText Does Not Throw

**Critical behavioral difference from generateText:**
- `generateText()` throws errors (wrappable with try-catch)
- `streamText()` passes errors to `onError` callback — errors do NOT throw
- Without `onError`, stream errors are included in the stream silently, which can crash servers

This is documented at: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

### API Provider Error Types

Common errors across all AI SDK functions:
- **429 Rate Limit**: Requires retry with exponential backoff. Check `maxRetries` parameter.
- **401/403 Auth**: Do not retry — configuration error. Verify API key.
- **400 Invalid Request**: Do not retry — validate inputs before calling.
- **Network errors**: Retry-safe for most operations. Use `maxRetries` parameter.
- **Content filtering**: Implement content pre-screening or alternative prompts.

---

## Testing Against Real Codebases

The following patterns were validated:

### Verified error conditions:
1. **streamText without onError** — server-sent events endpoint crashes on API errors
2. **generateObject schema mismatch** — model generates invalid JSON or wrong shape
3. **tool execution without try-catch** — tool functions that throw propagate as unhandled errors
4. **Rate limit 429** — requires retry logic with exponential backoff

---

## Known CVEs and Security Issues

### None Currently Documented

As of 2026-03-12, there are no open CVEs related to Vercel AI SDK behavioral contracts.

---

## Version History

### 2.0.0 (2026-03-06)
- Initial contract covering ai SDK versions 2.x - 6.x
- Covers: generateText, streamText, generateObject, streamObject, embed, embedMany, tool
- Error states: rate limits, auth errors, network errors, content filtering, schema validation, JSON parsing, tool execution, batch failures

---

## Maintenance Notes

### Next Review: 2026-06-12 (3 months)

Review triggers:
- [ ] Vercel AI SDK releases major/minor version with API changes
- [ ] onError callback behavior changes in streamText/streamObject
- [ ] New error types documented by AI providers
- [ ] False positives reported in real codebases
- [ ] maxRetries parameter behavior changes

---

## Questions or Corrections

If you find:
- Incorrect behavioral claims
- Missing error states
- Broken documentation links
- Behavioral changes in newer SDK versions

Please open an issue with label `package:ai`.
