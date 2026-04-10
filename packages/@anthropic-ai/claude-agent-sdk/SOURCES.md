# Sources: @anthropic-ai/claude-agent-sdk

## Documentation Fetched (2026-04-03)

### SDK Type Declarations
- URL: https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.2.91/sdk.d.ts
- Summary: Full TypeScript type declarations. `query()` returns `Query` async iterable.
  `AbortError` is the only exported error class. `SDKAssistantMessageError` covers
  billing/auth/rate-limit errors emitted in message stream (not thrown).

### README
- URL: https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.2.91/README.md
- Summary: Basic getting started guide. References official docs at platform.claude.com.

### Official Documentation
- URL: https://platform.claude.com/docs/en/agent-sdk/overview
- Summary: Agent SDK overview. Not fetched directly (auth-gated).

## Real-World Usage Evidence

### CherryHQ/cherry-studio (42k stars)
- File: `src/main/services/agents/services/claudecode/index.ts`
- Pattern: `for await (const message of query({ prompt, options }))` in try/catch
- Error handling: Checks `errorObj?.name === 'AbortError'` explicitly

### 21st-dev/1code (5k stars)
- File: `src/main/lib/trpc/routers/claude.ts`
- Pattern: Separate try/catch for `stream = claudeQuery(queryOptions)` and `for await (const msg of stream)`
- Error handling: `catch (queryError)` and `catch (streamError)` separately

## npm Package Info
- Version: 0.2.91
- Dependencies: @anthropic-ai/sdk, @modelcontextprotocol/sdk
- This is the successor to @anthropic-ai/claude-code-sdk
