/**
 * Instance usage patterns for @modelcontextprotocol/sdk
 * Tests class instance detection (Client stored in class properties, etc.)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// ❌ Missing error handling via class property pattern
class McpClientManager {
  private client: Client;

  constructor() {
    this.client = new Client({ name: 'manager-client', version: '1.0.0' });
  }

  async connect() {
    const transport = new StdioClientTransport({ command: 'my-server' });
    await this.client.connect(transport); // VIOLATION: no try-catch
  }

  async getTools() {
    const { tools } = await this.client.listTools(); // VIOLATION: no try-catch
    return tools;
  }

  async runTool(name: string, args: Record<string, unknown>) {
    const result = await this.client.callTool({ name, arguments: args }); // VIOLATION
    return result;
  }
}

// ✅ Class with proper error handling
class ProperMcpManager {
  private client: Client;

  constructor() {
    this.client = new Client({ name: 'proper-manager', version: '1.0.0' });
  }

  async connect() {
    const transport = new SSEClientTransport(new URL('http://localhost:3000/mcp'));
    try {
      await this.client.connect(transport);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  async getTools() {
    try {
      const { tools } = await this.client.listTools();
      return tools;
    } catch (error) {
      console.error('listTools failed:', error);
      return [];
    }
  }
}

// ❌ HTTP server without error handling
async function handleMcpRequest(req: Request, res: Response) {
  const server = new McpServer({ name: 'http-server', version: '1.0.0' });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  await server.connect(transport); // VIOLATION: no try-catch in HTTP context
}
