/**
 * Missing error handling for @modelcontextprotocol/sdk
 * Should trigger multiple ERROR violations.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// ❌ Missing: client.connect() not wrapped in try-catch
async function connectClientWithoutErrorHandling() {
  const client = new Client({ name: 'my-client', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'my-mcp-server' });

  await client.connect(transport); // VIOLATION: no try-catch
  return client;
}

// ❌ Missing: client.callTool() not wrapped in try-catch
async function callToolWithoutErrorHandling(client: Client) {
  const result = await client.callTool({ name: 'my-tool', arguments: { input: 'test' } }); // VIOLATION
  return result;
}

// ❌ Missing: client.listTools() not wrapped in try-catch
async function listToolsWithoutErrorHandling(client: Client) {
  const { tools } = await client.listTools(); // VIOLATION
  return tools;
}

// ❌ Missing: server.connect() not wrapped in try-catch
async function connectServerWithoutErrorHandling() {
  const server = new McpServer({ name: 'my-server', version: '1.0.0' });
  const transport = new StdioServerTransport();

  await server.connect(transport); // VIOLATION: no try-catch
}

// ❌ Multiple violations in one function
async function badMcpWorkflow() {
  const client = new Client({ name: 'bad-client', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'server-cmd' });

  await client.connect(transport);  // VIOLATION
  const { tools } = await client.listTools();  // VIOLATION
  const result = await client.callTool({ name: tools[0].name, arguments: {} });  // VIOLATION
  return result;
}
