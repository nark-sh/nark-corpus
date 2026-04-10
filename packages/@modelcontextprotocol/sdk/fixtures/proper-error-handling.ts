/**
 * Proper error handling for @modelcontextprotocol/sdk
 * Should trigger 0 violations.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// ✅ Proper: client.connect() wrapped in try-catch
async function connectClientProperly() {
  const client = new Client({ name: 'my-client', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'my-mcp-server' });

  try {
    await client.connect(transport);
    return client;
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
    throw error;
  }
}

// ✅ Proper: client.callTool() wrapped in try-catch
async function callToolProperly(client: Client) {
  try {
    const result = await client.callTool({ name: 'my-tool', arguments: { input: 'test' } });
    return result;
  } catch (error) {
    console.error('Tool call failed:', error);
    throw error;
  }
}

// ✅ Proper: client.listTools() wrapped in try-catch
async function listToolsProperly(client: Client) {
  try {
    const { tools } = await client.listTools();
    return tools;
  } catch (error) {
    console.error('Failed to list tools:', error);
    return [];
  }
}

// ✅ Proper: server.connect() wrapped in try-catch
async function connectServerProperly() {
  const server = new McpServer({ name: 'my-server', version: '1.0.0' });
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// ✅ Proper: all operations in single try-catch
async function fullMcpWorkflow() {
  const client = new Client({ name: 'workflow-client', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'server-cmd' });

  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    const result = await client.callTool({ name: tools[0].name, arguments: {} });
    return result;
  } catch (error) {
    console.error('MCP workflow failed:', error);
    return null;
  }
}
