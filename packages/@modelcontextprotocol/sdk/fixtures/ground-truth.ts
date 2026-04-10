/**
 * @modelcontextprotocol/sdk Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@modelcontextprotocol/sdk"):
 *   - Client.connect()   postcondition: connect-throws-on-failure
 *   - McpServer.connect() postcondition: connect-throws-on-failure
 *   - Client.callTool()  postcondition: call-tool-throws-on-protocol-error
 *   - Client.listTools() postcondition: list-tools-throws-on-failure
 *
 * Detection path: instance tracking (new Client() → instanceMap) →
 *   ThrowingFunctionDetector fires client.connect() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Client.connect() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_clientConnect_missing() {
  const client = new Client({ name: 'c', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'server' });
  // SHOULD_FIRE: connect-throws-on-failure — no try-catch on client.connect()
  await client.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Client.connect() — inside try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_clientConnect_proper() {
  const client = new Client({ name: 'c', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: 'server' });
  try {
    // SHOULD_NOT_FIRE: client.connect() inside try-catch satisfies error handling
    await client.connect(transport);
  } catch (e) {
    console.error(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. McpServer.connect() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_serverConnect_missing() {
  const server = new McpServer({ name: 's', version: '1.0.0' });
  const transport = new StdioServerTransport();
  // SHOULD_FIRE: connect-throws-on-failure — no try-catch on server.connect()
  await server.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. McpServer.connect() — inside try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_serverConnect_proper() {
  const server = new McpServer({ name: 's', version: '1.0.0' });
  const transport = new StdioServerTransport();
  try {
    // SHOULD_NOT_FIRE: server.connect() inside try-catch satisfies error handling
    await server.connect(transport);
  } catch (e) {
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Client.callTool() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_callTool_missing(client: Client) {
  // SHOULD_FIRE: call-tool-throws-on-protocol-error — no try-catch on client.callTool()
  const result = await client.callTool({ name: 'tool', arguments: {} });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Client.callTool() — inside try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_callTool_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE: client.callTool() inside try-catch satisfies error handling
    const result = await client.callTool({ name: 'tool', arguments: {} });
    return result;
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Client.listTools() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listTools_missing(client: Client) {
  // SHOULD_FIRE: list-tools-throws-on-failure — no try-catch on client.listTools()
  const { tools } = await client.listTools();
  return tools;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Client.listTools() — inside try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listTools_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE: client.listTools() inside try-catch satisfies error handling
    const { tools } = await client.listTools();
    return tools;
  } catch (e) {
    return [];
  }
}
