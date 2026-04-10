# Sources — @langchain/openai

## URLs Fetched

| URL | Date | Summary |
|-----|------|---------|
| https://github.com/langchain-ai/langchainjs/issues/1547 | 2026-04-02 | "Catching the original OpenAI error" — confirms wrapOpenAIClientError properly surfaces OpenAI SDK errors; issue closed Sept 2023 after fix |
| https://github.com/langchain-ai/langchainjs/security/advisories/GHSA-r399-636x-v7f6 | 2026-04-02 | CVE-2025-68665 (CVSS 8.6) — serialization injection in @langchain/core < 1.1.8; affects loads/dumps APIs not direct chat invocation |
| https://docs.langchain.com/oss/javascript/langchain/overview | 2026-04-02 | General LangChain.js overview; no error-handling specifics |

## Package Source Examined

- `/private/tmp/claude-501/package/dist/utils/client.js` — actual `wrapOpenAIClientError` implementation listing all HTTP error codes and their mapped error types
- `/private/tmp/claude-501/package/dist/index.d.ts` — full export list
- `/private/tmp/claude-501/package/dist/embeddings.d.ts` — OpenAIEmbeddings class signatures
- `/private/tmp/claude-501/package/dist/tools/dalle.d.ts` — DallEAPIWrapper class signature
- `/private/tmp/claude-501/package/dist/chat_models/base.d.ts` — BaseChatOpenAI types

## Real-World Repositories Examined

| Repo | Stars | File | Finding |
|------|-------|------|---------|
| gitroomhq/postiz-app | 27,547 | `libraries/.../agent.graph.service.ts` | invoke() called without try-catch |
| gitroomhq/postiz-app | 27,547 | `libraries/.../autopost.service.ts` | dalle.invoke() called without try-catch |
| developersdigest/llm-answer-engine | 5,021 | `app/tools/contentProcessing.tsx` | embeddings used inside try-catch (correct) |
