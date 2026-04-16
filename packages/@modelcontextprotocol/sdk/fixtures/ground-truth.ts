/**
 * @modelcontextprotocol/sdk Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@modelcontextprotocol/sdk"):
 *   - Client.connect()         postcondition: connect-throws-on-failure
 *   - McpServer.connect()      postcondition: connect-throws-on-failure
 *   - Client.callTool()        postcondition: call-tool-throws-on-protocol-error
 *   - Client.listTools()       postcondition: list-tools-throws-on-failure
 *   - Client.close()           postcondition: close-missing-on-server-shutdown
 *   - McpServer.close()        postcondition: close-missing-on-server-shutdown
 *   - Client.readResource()    postcondition: read-resource-missing-try-catch
 *   - Client.getPrompt()       postcondition: get-prompt-missing-try-catch
 *   - Server.createMessage()   postcondition: create-message-missing-try-catch
 *   - Server.elicitInput()     postcondition: elicit-input-missing-try-catch
 *   - Client.listResources()   postcondition: list-resources-missing-try-catch
 *   - Client.listPrompts()     postcondition: list-prompts-missing-try-catch
 *   - Client.subscribeResource() postcondition: subscribe-resource-missing-try-catch
 *
 * Detection path: instance tracking (new Client() → instanceMap) →
 *   ThrowingFunctionDetector fires client.connect() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. Client.readResource() — without try-catch
// @expect-violation: read-resource-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_readResource_missing(client: Client) {
  // SHOULD_FIRE: read-resource-missing-try-catch — no try-catch on client.readResource()
  const result = await client.readResource({ uri: 'file:///data.json' });
  return result.contents;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Client.readResource() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_readResource_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE: client.readResource() inside try-catch satisfies error handling
    const result = await client.readResource({ uri: 'file:///data.json' });
    return result.contents;
  } catch (e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Client.getPrompt() — without try-catch
// @expect-violation: get-prompt-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getPrompt_missing(client: Client) {
  // SHOULD_FIRE: get-prompt-missing-try-catch — no try-catch on client.getPrompt()
  const prompt = await client.getPrompt({ name: 'analyze-code', arguments: { lang: 'ts' } });
  return prompt.messages;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Client.getPrompt() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getPrompt_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE: client.getPrompt() inside try-catch satisfies error handling
    const prompt = await client.getPrompt({ name: 'analyze-code', arguments: { lang: 'ts' } });
    return prompt.messages;
  } catch (e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Client.listResources() — without try-catch
// @expect-violation: list-resources-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listResources_missing(client: Client) {
  // SHOULD_FIRE: list-resources-missing-try-catch — no try-catch
  const { resources } = await client.listResources();
  return resources;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Client.listResources() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listResources_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE
    const { resources } = await client.listResources();
    return resources;
  } catch (e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Client.listPrompts() — without try-catch
// @expect-violation: list-prompts-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listPrompts_missing(client: Client) {
  // SHOULD_FIRE: list-prompts-missing-try-catch — no try-catch
  const { prompts } = await client.listPrompts();
  return prompts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Client.listPrompts() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_listPrompts_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE
    const { prompts } = await client.listPrompts();
    return prompts;
  } catch (e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Client.subscribeResource() — without try-catch
// @expect-violation: subscribe-resource-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_subscribeResource_missing(client: Client) {
  // SHOULD_FIRE: subscribe-resource-missing-try-catch — no try-catch
  await client.subscribeResource({ uri: 'file:///config.json' });
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Client.subscribeResource() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_subscribeResource_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE
    await client.subscribeResource({ uri: 'file:///config.json' });
  } catch (e) {
    console.error('Resource subscription failed:', (e as Error).message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. Server.createMessage() — without try-catch
// @expect-violation: create-message-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createMessage_missing(server: Server) {
  // SHOULD_FIRE: create-message-missing-try-catch — no try-catch on server.createMessage()
  const result = await server.createMessage({
    messages: [{ role: 'user', content: { type: 'text', text: 'Hello' } }],
    maxTokens: 256
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. Server.createMessage() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createMessage_proper(server: Server) {
  try {
    // SHOULD_NOT_FIRE
    const result = await server.createMessage({
      messages: [{ role: 'user', content: { type: 'text', text: 'Hello' } }],
      maxTokens: 256
    });
    return result;
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. Server.elicitInput() — without try-catch
// @expect-violation: elicit-input-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_elicitInput_missing(server: Server) {
  // SHOULD_FIRE: elicit-input-missing-try-catch — no try-catch
  const result = await server.elicitInput({
    message: 'Confirm deletion?',
    requestedSchema: { type: 'object', properties: { confirm: { type: 'boolean' } }, required: ['confirm'] }
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. Server.elicitInput() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_elicitInput_proper(server: Server) {
  try {
    // SHOULD_NOT_FIRE
    const result = await server.elicitInput({
      message: 'Confirm deletion?',
      requestedSchema: { type: 'object', properties: { confirm: { type: 'boolean' } }, required: ['confirm'] }
    });
    return result;
  } catch (e) {
    return { action: 'cancel' };
  }
}
