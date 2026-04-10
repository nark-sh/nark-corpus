# Sources — ollama

## Documentation Sources

| URL | Fetched | Summary |
|-----|---------|---------|
| https://raw.githubusercontent.com/ollama/ollama-js/main/README.md | 2026-04-02 | Main README — documents all async methods, abort error behavior |
| https://raw.githubusercontent.com/ollama/ollama-js/main/src/index.ts | 2026-04-02 | Source — `processStreamableRequest` JSDoc: `@throws {Error} - If the response body is missing or if the response is an error` |
| https://github.com/ollama/ollama-js | 2026-04-02 | Repository homepage |

## Real-World Usage

- cline/cline (59k stars): `/corpus-builder/active/cline__cline/src/core/api/providers/ollama.ts`
  - Uses proper try/catch, checks `error.status || error.statusCode`

## Error Types

- Generic `Error` (no custom error hierarchy)
- `AbortError` (DOMException) when `abort()` is called on streaming requests
- Error has `.status` / `.statusCode` (HTTP status), `.message` properties
