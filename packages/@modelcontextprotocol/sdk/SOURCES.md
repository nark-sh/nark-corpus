# Sources: @modelcontextprotocol/sdk

## Official Documentation

| URL | Description |
|-----|-------------|
| https://modelcontextprotocol.io/introduction | MCP introduction and overview |
| https://spec.modelcontextprotocol.io/ | Full MCP specification |
| https://spec.modelcontextprotocol.io/specification/server/tools/ | Tool specification including error handling |
| https://spec.modelcontextprotocol.io/specification/server/tools/#error-handling | In-band error handling for callTool |
| https://modelcontextprotocol.io/docs/concepts/transports | Transport documentation |
| https://github.com/modelcontextprotocol/typescript-sdk | TypeScript SDK GitHub repository |
| https://github.com/modelcontextprotocol/typescript-sdk/blob/main/packages/client/src/client/client.ts | Client implementation source |
| https://github.com/modelcontextprotocol/typescript-sdk/blob/main/packages/server/src/server/mcp.ts | McpServer implementation source |
| https://github.com/modelcontextprotocol/typescript-sdk/blob/main/packages/server/src/server/server.ts | Server base class source |

## Real-World Evidence

### Correct error handling (witsy — 22k+ stars)
- https://github.com/nbonamy/witsy/blob/main/src/main/mcp.ts
- Uses try-catch around `client.connect()` and `client.listTools()`

### Correct error handling (n8n — 50k+ stars)
- https://github.com/n8n-io/n8n/blob/master/packages/@n8n/nodes-langchain/nodes/mcp/shared/utils.ts
- Uses try-catch around `client.connect()`, returns typed Result

### Missing error handling (nocodb — 49k+ stars)
- https://github.com/nocodb/nocodb/blob/develop/packages/nocodb/src/mcp/mcp.service.ts
- `server.connect()` and `transport.handleRequest()` not wrapped in try-catch (relies on NestJS exception filter)

### CLI tool with top-level catch (groq-compound-mcp)
- Pattern: `server.connect()` inside `main()`, with `main().catch(...)` — acceptable for CLI
