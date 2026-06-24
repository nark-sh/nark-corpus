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
 *   - client.experimental.tasks.callToolStream() postcondition: call-tool-stream-error-message-unhandled, call-tool-stream-missing-try-catch
 *   - client.experimental.tasks.cancelTask()     postcondition: cancel-task-missing-try-catch
 *   - client.experimental.tasks.getTask()        postcondition: get-task-missing-try-catch
 *   - auth()                                     postcondition: auth-throws-oauth-error-on-server-rejection, auth-redirect-result-not-checked
 *   - exchangeAuthorization()                    postcondition: exchange-authorization-throws-on-invalid-code
 *   - refreshAuthorization()                     postcondition: refresh-authorization-throws-on-revoked-token
 *   - registerClient()                           postcondition: register-client-throws-on-invalid-metadata
 *   - StreamableHTTPServerTransport.handleRequest() postcondition: handle-request-throws-on-stateless-reuse, handle-request-missing-session-routing
 *   - StdioClientTransport.start()                  postcondition: stdio-start-throws-on-spawn-failure, stdio-start-throws-already-started
 *   - StreamableHTTPClientTransport.finishAuth()    postcondition: finish-auth-throws-no-provider, finish-auth-throws-authorization-failed
 *   - StreamableHTTPClientTransport.terminateSession() postcondition: terminate-session-throws-on-server-error
 *   - WebStandardStreamableHTTPServerTransport.handleRequest() postcondition: web-transport-stateless-reuse-throws, web-transport-missing-session-routing
 *   - WebSocketClientTransport.start()       postcondition: websocket-transport-already-started, websocket-transport-connection-failed
 *   - SSEClientTransport.start()             postcondition: sse-transport-no-auth-provider, sse-transport-connection-error
 *   - SSEServerTransport.handlePostMessage() postcondition: sse-handle-post-content-type-error, sse-handle-post-dns-rebinding-blocked
 *   - StdioServerTransport.start()           postcondition: stdio-server-transport-already-started
 *   - McpServer.sendLoggingMessage()         postcondition: send-logging-message-capability-not-set, send-logging-message-not-connected
 *   - fetchToken()                           postcondition: fetch-token-missing-params, fetch-token-oauth-error-not-handled  [added 2026-06-12]
 *   - discoverOAuthServerInfo()              postcondition: discover-oauth-server-info-fetch-error  [added 2026-06-12]
 *   - experimental.tasks.createMessageStream() postcondition: create-message-stream-error-message-not-handled, create-message-stream-tool-capability-not-checked  [added 2026-06-12]
 *   - experimental.tasks.elicitInputStream()   postcondition: elicit-input-stream-error-message-not-handled  [added 2026-06-12]
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
import {
  auth,
  exchangeAuthorization,
  refreshAuthorization,
  registerClient,
  OAuthClientProvider,
  UnauthorizedError,
  // v1.20+ unified OAuth helpers (added 2026-06-12):
  fetchToken,
  discoverOAuthServerInfo,
} from '@modelcontextprotocol/sdk/client/auth.js';
// v1.29+ task-stream takeResult helper (added 2026-06-12):
import { takeResult } from '@modelcontextprotocol/sdk/shared/responseMessage.js';
import { StreamableHTTPClientTransport, StreamableHTTPError } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { OAuthTokens, OAuthClientInformationMixed, OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';
// v1.27+ composable fetch middleware (added 2026-06-24):
import { withOAuth, applyMiddlewares } from '@modelcontextprotocol/sdk/client/middleware.js';
// v1.x server auth provider interface + error types (added 2026-06-24):
import type { OAuthServerProvider, OAuthTokenVerifier, AuthorizationParams } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { InvalidTokenError, InsufficientScopeError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type { OAuthClientInformationFull, OAuthTokenRevocationRequest } from '@modelcontextprotocol/sdk/shared/auth.js';
import type { Response as ExpressResponse } from 'express';

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

// ─────────────────────────────────────────────────────────────────────────────
// 23. client.experimental.tasks.callToolStream() — error message not handled
// @expect-violation: call-tool-stream-error-message-unhandled
// @expect-violation: call-tool-stream-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_callToolStream_missing(client: Client) {
  // no check for message.type === 'error' and no outer try-catch for transport failures
  // SHOULD_FIRE: call-tool-stream-* — no error handling for callToolStream
  const stream = client.experimental.tasks.callToolStream({ name: 'myTool', arguments: {} });
  for await (const message of stream) {
    if (message.type === 'result') {
      return message.result;
    }
    // ❌ 'error' messages are never handled — tool failures silently lost
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. client.experimental.tasks.callToolStream() — properly handled
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_callToolStream_proper(client: Client) {
  try {
    // SHOULD_NOT_FIRE
    const stream = client.experimental.tasks.callToolStream({ name: 'myTool', arguments: {} });
    for await (const message of stream) {
      if (message.type === 'error') {
        throw new Error(`Tool stream error: ${message.error.message}`);
      }
      if (message.type === 'result') {
        return message.result;
      }
    }
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. client.experimental.tasks.cancelTask() — without try-catch
// @expect-violation: cancel-task-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_cancelTask_missing(client: Client, taskId: string) {
  // SHOULD_FIRE: cancel-task-missing-try-catch — no try-catch; task may have already completed
  await client.experimental.tasks.cancelTask(taskId);
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. client.experimental.tasks.cancelTask() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_cancelTask_proper(client: Client, taskId: string) {
  try {
    // SHOULD_NOT_FIRE
    await client.experimental.tasks.cancelTask(taskId);
  } catch (e) {
    // Expected: task may have already completed or been cleaned up
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. client.experimental.tasks.getTask() — without try-catch
// @expect-violation: get-task-missing-try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getTask_missing(client: Client, taskId: string) {
  // SHOULD_FIRE: get-task-missing-try-catch — task may have been cleaned up from task store
  const taskStatus = await client.experimental.tasks.getTask(taskId);
  return taskStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. client.experimental.tasks.getTask() — inside try-catch
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_getTask_proper(client: Client, taskId: string) {
  try {
    // SHOULD_NOT_FIRE
    const taskStatus = await client.experimental.tasks.getTask(taskId);
    return taskStatus;
  } catch (e) {
    // Expected: task may have expired from task store
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. auth() — without try-catch
// @expect-violation: auth-throws-oauth-error-on-server-rejection
// ─────────────────────────────────────────────────────────────────────────────

async function gt_auth_missing(provider: OAuthClientProvider) {
  // SHOULD_FIRE: auth-throws-oauth-error-on-server-rejection — no try-catch; OAuthError thrown on server rejection
  const result = await auth(provider, { serverUrl: 'https://api.example.com/mcp' });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. auth() — return value not checked for REDIRECT
// @expect-violation: auth-redirect-result-not-checked
// ─────────────────────────────────────────────────────────────────────────────

async function gt_auth_redirect_unchecked(provider: OAuthClientProvider, client: Client, transport: StdioClientTransport) {
  try {
    // NOTE: scanner gap — auth-redirect-result-not-checked requires checking that the return value
    // is not inspected for 'REDIRECT'. Scanner cannot detect return-value usage patterns.
    await auth(provider, { serverUrl: 'https://api.example.com/mcp' });
    await client.connect(transport); // proceeds even if result === 'REDIRECT'
  } catch (e) {
    // handles errors but not the REDIRECT return value
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 31. auth() — with try-catch and redirect check (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_auth_proper(provider: OAuthClientProvider, client: Client, transport: StdioClientTransport) {
  try {
    // SHOULD_NOT_FIRE
    const result = await auth(provider, { serverUrl: 'https://api.example.com/mcp' });
    if (result === 'REDIRECT') {
      return; // user being redirected to authorize
    }
    await client.connect(transport);
  } catch (e) {
    // OAuthError subtypes handled
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 32. exchangeAuthorization() — without try-catch
// @expect-violation: exchange-authorization-throws-on-invalid-code
// ─────────────────────────────────────────────────────────────────────────────

async function gt_exchangeAuth_missing(
  authServerUrl: string,
  clientInfo: OAuthClientInformationMixed,
  code: string,
  verifier: string,
  provider: OAuthClientProvider
) {
  // SHOULD_FIRE: exchange-authorization-throws-on-invalid-code — no try-catch; code may be expired
  const tokens = await exchangeAuthorization(authServerUrl, {
    clientInformation: clientInfo,
    authorizationCode: code,
    codeVerifier: verifier,
    redirectUri: 'https://myapp.com/callback',
  });
  return tokens;
}

// ─────────────────────────────────────────────────────────────────────────────
// 33. exchangeAuthorization() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_exchangeAuth_proper(
  authServerUrl: string,
  clientInfo: OAuthClientInformationMixed,
  code: string,
  verifier: string,
  provider: OAuthClientProvider
) {
  try {
    // SHOULD_NOT_FIRE
    const tokens = await exchangeAuthorization(authServerUrl, {
      clientInformation: clientInfo,
      authorizationCode: code,
      codeVerifier: verifier,
      redirectUri: 'https://myapp.com/callback',
    });
    return tokens;
  } catch (e) {
    // InvalidGrantError etc. handled
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 34. refreshAuthorization() — without try-catch
// @expect-violation: refresh-authorization-throws-on-revoked-token
// ─────────────────────────────────────────────────────────────────────────────

async function gt_refreshAuth_missing(
  authServerUrl: string,
  clientInfo: OAuthClientInformationMixed,
  refreshToken: string
) {
  // SHOULD_FIRE: refresh-authorization-throws-on-revoked-token — no try-catch; refresh token may be revoked
  const tokens = await refreshAuthorization(authServerUrl, {
    clientInformation: clientInfo,
    refreshToken,
  });
  return tokens;
}

// ─────────────────────────────────────────────────────────────────────────────
// 35. refreshAuthorization() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_refreshAuth_proper(
  authServerUrl: string,
  clientInfo: OAuthClientInformationMixed,
  refreshToken: string
) {
  try {
    // SHOULD_NOT_FIRE
    const tokens = await refreshAuthorization(authServerUrl, {
      clientInformation: clientInfo,
      refreshToken,
    });
    return tokens;
  } catch (e) {
    // InvalidGrantError: refresh token revoked — schedule re-auth
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 36. registerClient() — without try-catch
// @expect-violation: register-client-throws-on-invalid-metadata
// ─────────────────────────────────────────────────────────────────────────────

async function gt_registerClient_missing(
  authServerUrl: string,
  clientMetadata: OAuthClientMetadata
) {
  // SHOULD_FIRE: register-client-throws-on-invalid-metadata — no try-catch; registration may fail
  const clientInfo = await registerClient(authServerUrl, {
    clientMetadata,
  });
  return clientInfo;
}

// ─────────────────────────────────────────────────────────────────────────────
// 37. registerClient() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_registerClient_proper(
  authServerUrl: string,
  clientMetadata: OAuthClientMetadata
) {
  try {
    // SHOULD_NOT_FIRE
    const clientInfo = await registerClient(authServerUrl, {
      clientMetadata,
    });
    return clientInfo;
  } catch (e) {
    // InvalidClientMetadataError etc. handled
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 38. StreamableHTTPServerTransport.handleRequest() — stateless reuse
// @expect-violation: handle-request-throws-on-stateless-reuse
// ─────────────────────────────────────────────────────────────────────────────

async function gt_handleRequest_reuse(transport: StreamableHTTPServerTransport, req: any, res: any) {
  // SHOULD_FIRE: handle-request-throws-on-stateless-reuse — no try-catch; stateless transport cannot be reused
  await transport.handleRequest(req, res, req.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// 39. StreamableHTTPServerTransport.handleRequest() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_handleRequest_proper(transport: StreamableHTTPServerTransport, req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    // Error: 'Stateless transport cannot be reused' handled
    res.status(500).json({ error: 'Transport error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 40. StdioClientTransport.start() — no try-catch (violation)
// @expect-violation: stdio-start-throws-on-spawn-failure
// ─────────────────────────────────────────────────────────────────────────────

async function gt_stdioStart_violation(client: Client) {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
  });
  // SHOULD_FIRE: connect-* — no try-catch; ENOENT if command not found (scanner gap: fires connect-throws-on-failure instead of stdio-start-throws-on-spawn-failure)
  await client.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 41. StdioClientTransport.start() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_stdioStart_proper(client: Client) {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
  });
  try {
    // SHOULD_NOT_FIRE
    await client.connect(transport);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('MCP server binary not found');
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 42. StreamableHTTPClientTransport.finishAuth() — no try-catch (violation)
// @expect-violation: finish-auth-throws-no-provider
// @expect-violation: finish-auth-throws-authorization-failed
// ─────────────────────────────────────────────────────────────────────────────

async function gt_finishAuth_violation(serverUrl: URL, authCode: string) {
  const transport = new StreamableHTTPClientTransport(serverUrl);
  // SHOULD_FIRE: finish-auth-throws-no-provider — no try-catch; UnauthorizedError when no authProvider set
  await transport.finishAuth(authCode);
}

// ─────────────────────────────────────────────────────────────────────────────
// 43. StreamableHTTPClientTransport.finishAuth() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_finishAuth_proper(transport: StreamableHTTPClientTransport, authCode: string) {
  try {
    // SHOULD_NOT_FIRE
    await transport.finishAuth(authCode);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error('Auth failed, restart login flow:', error.message);
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 44. StreamableHTTPClientTransport.terminateSession() — no try-catch (violation)
// @expect-violation: terminate-session-throws-on-server-error
// ─────────────────────────────────────────────────────────────────────────────

async function gt_terminateSession_violation(transport: StreamableHTTPClientTransport) {
  // SHOULD_FIRE: terminate-session-throws-on-server-error — no try-catch; StreamableHTTPError on non-2xx/non-405
  await transport.terminateSession();
}

// ─────────────────────────────────────────────────────────────────────────────
// 45. StreamableHTTPClientTransport.terminateSession() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_terminateSession_proper(transport: StreamableHTTPClientTransport) {
  try {
    // SHOULD_NOT_FIRE
    await transport.terminateSession();
  } catch (error) {
    if (error instanceof StreamableHTTPError) {
      // Non-fatal — session will expire naturally on server side
      console.warn('Session termination failed:', error.message);
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 46. WebStandardStreamableHTTPServerTransport.handleRequest() — stateless reuse (violation)
// @expect-violation: web-transport-stateless-reuse-throws
// ─────────────────────────────────────────────────────────────────────────────

// Simulates singleton transport at module scope — reused across requests
const sharedWebTransport = new WebStandardStreamableHTTPServerTransport();

async function gt_webTransportReuse_violation(request: Request): Promise<Response> {
  // SHOULD_FIRE: handle-request-* — no try-catch; stateless transport cannot be reused (scanner gap: fires handle-request-throws-on-stateless-reuse instead of web-transport-stateless-reuse-throws)
  return sharedWebTransport.handleRequest(request);
}

// ─────────────────────────────────────────────────────────────────────────────
// 47. WebStandardStreamableHTTPServerTransport.handleRequest() — new per request (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_webTransportPerRequest_proper(request: Request, serverInfo: any): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport(); // new per request
  try {
    // SHOULD_NOT_FIRE
    return await transport.handleRequest(request);
  } catch (error) {
    console.error('Transport error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 48. WebSocketClientTransport.start() — no try-catch (violation)
// @expect-violation: websocket-transport-connection-failed
// ─────────────────────────────────────────────────────────────────────────────

async function gt_websocketStart_violation(serverUrl: URL) {
  const transport = new WebSocketClientTransport(serverUrl);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  // SHOULD_FIRE: connect-* — no try-catch; WebSocket connection may fail (scanner gap: fires connect-throws-on-failure)
  await client.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 49. WebSocketClientTransport.start() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_websocketStart_proper(serverUrl: URL) {
  const transport = new WebSocketClientTransport(serverUrl);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  try {
    // SHOULD_NOT_FIRE
    await client.connect(transport);
  } catch (error) {
    // WebSocket connection failed — server unreachable or bad URL
    console.error('WebSocket MCP connection failed:', (error as Error).message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 50. SSEClientTransport.start() — no try-catch (violation)
// @expect-violation: sse-transport-connection-error
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sseClientStart_violation(serverUrl: URL) {
  const transport = new SSEClientTransport(serverUrl);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  // SHOULD_FIRE: connect-* — no try-catch; SseError on connection failure (scanner gap: fires connect-throws-on-failure)
  await client.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 51. SSEClientTransport.start() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sseClientStart_proper(serverUrl: URL) {
  const transport = new SSEClientTransport(serverUrl);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  try {
    // SHOULD_NOT_FIRE
    await client.connect(transport);
  } catch (error) {
    const sseErr = error as any;
    if (sseErr.code !== undefined) {
      // SseError — SSE connection failed with HTTP status
      console.error(`SSE connection failed (HTTP ${sseErr.code}):`, sseErr.message);
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 52. SSEServerTransport.handlePostMessage() — no try-catch (violation)
// @expect-violation: sse-handle-post-content-type-error
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sseHandlePost_violation(
  transport: SSEServerTransport,
  req: any,
  res: any
) {
  // SHOULD_FIRE: sse-handle-post-content-type-error — no try-catch; throws on wrong Content-Type
  await transport.handlePostMessage(req, res);
}

// ─────────────────────────────────────────────────────────────────────────────
// 53. SSEServerTransport.handlePostMessage() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sseHandlePost_proper(
  transport: SSEServerTransport,
  req: any,
  res: any
) {
  try {
    // SHOULD_NOT_FIRE
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error('SSE POST handler error:', (error as Error).message);
    if (!res.headersSent) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 54. StdioServerTransport.start() — no try-catch (violation)
// @expect-violation: stdio-server-transport-already-started
// ─────────────────────────────────────────────────────────────────────────────

async function gt_stdioServerStart_violation(server: McpServer) {
  const transport = new StdioServerTransport();
  // SHOULD_FIRE: connect-* — no try-catch on double-connect (scanner gap: fires connect-throws-on-failure instead of stdio-server-transport-already-started)
  await server.connect(transport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 55. StdioServerTransport.start() — with try-catch (proper)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_stdioServerStart_proper(server: McpServer) {
  const transport = new StdioServerTransport();
  try {
    // SHOULD_NOT_FIRE
    await server.connect(transport);
  } catch (error) {
    console.error('Failed to start stdio server transport:', (error as Error).message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 56. McpServer.sendLoggingMessage() — capability not set (silent failure)
// @expect-violation: send-logging-message-capability-not-set
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sendLoggingMessage_noCapability() {
  // ❌ No logging capability declared — sendLoggingMessage silently drops messages
  const server = new McpServer({ name: 'my-server', version: '1.0.0' });
  // SHOULD_FIRE: send-logging-message-* — no logging capability; message silently dropped (scanner gap: fires send-logging-message-not-connected)
  await server.sendLoggingMessage({ level: 'error', data: 'critical failure' });
}

// ─────────────────────────────────────────────────────────────────────────────
// 57. McpServer.sendLoggingMessage() — capability set, proper usage
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sendLoggingMessage_withCapability() {
  // ✅ Logging capability declared — messages are delivered
  const server = new McpServer(
    { name: 'my-server', version: '1.0.0' },
    { capabilities: { logging: {} } }
  );
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);
    // SHOULD_NOT_FIRE — capability set, server connected, inside try-catch
    await server.sendLoggingMessage({ level: 'info', data: 'server ready' });
  } catch (error) {
    console.error('Server error:', (error as Error).message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 58. McpServer.sendLoggingMessage() — not connected (throws)
// @expect-violation: send-logging-message-not-connected
// ─────────────────────────────────────────────────────────────────────────────

async function gt_sendLoggingMessage_notConnected() {
  const server = new McpServer(
    { name: 'my-server', version: '1.0.0' },
    { capabilities: { logging: {} } }
  );
  // ❌ No connect() call before sendLoggingMessage — throws Error('Not connected')
  // SHOULD_FIRE: send-logging-message-not-connected — no try-catch; throws Error('Not connected') before transport is set
  await server.sendLoggingMessage({ level: 'info', data: 'starting up' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Depth pass 2026-06-12 (deepen-stream-2 pass 4) — new function fixtures
// Functions added: fetchToken, discoverOAuthServerInfo,
//   experimental.tasks.createMessageStream, experimental.tasks.elicitInputStream
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 59. fetchToken() — proper handling (clean)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_fetchToken_proper(
  provider: OAuthClientProvider,
  authServerUrl: string,
  metadata: any,
  authorizationCode: string
) {
  try {
    // SHOULD_NOT_FIRE — wrapped in try-catch with OAuth error class handling
    const tokens = await fetchToken(provider, authServerUrl, {
      metadata,
      authorizationCode,
    });
    return tokens;
  } catch (error) {
    if ((error as any).errorCode === 'invalid_grant') {
      throw new Error('Session expired — re-authenticate');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 60. fetchToken() — missing params (no try-catch, throws synchronously)
// @expect-violation: fetch-token-missing-params
// @expect-violation: fetch-token-oauth-error-not-handled
// ─────────────────────────────────────────────────────────────────────────────

async function gt_fetchToken_missingParams(
  provider: OAuthClientProvider,
  authServerUrl: string,
  metadata: any
) {
  // ❌ No try-catch; no authorizationCode supplied and provider may not implement prepareTokenRequest;
  // also unprotected against InvalidGrantError on the network path.
  // Both fetch-token-missing-params and fetch-token-oauth-error-not-handled apply — matched via wildcard.
  // SHOULD_FIRE: fetch-token-* — fetchToken called without try-catch; missing-params + oauth-error both apply
  const tokens = await fetchToken(provider, authServerUrl, { metadata });
  return tokens;
}

// ─────────────────────────────────────────────────────────────────────────────
// 61. discoverOAuthServerInfo() — proper handling (clean)
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_discoverOAuthServerInfo_proper(serverUrl: string) {
  try {
    // SHOULD_NOT_FIRE — wrapped in try-catch with transient-vs-permanent classification
    const info = await discoverOAuthServerInfo(serverUrl);
    return info;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`OAuth discovery network error: ${(error as Error).message}`);
    }
    throw new Error(`OAuth not configured at ${serverUrl}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 62. discoverOAuthServerInfo() — fetch error not handled
// @expect-violation: discover-oauth-server-info-fetch-error
// ─────────────────────────────────────────────────────────────────────────────

async function gt_discoverOAuthServerInfo_noTryCatch(serverUrl: string) {
  // ❌ No try-catch — network failures or missing OAuth metadata crash this call
  // SHOULD_FIRE: discover-oauth-server-info-fetch-error — no try-catch; discoverAuthorizationServerMetadata throws on network error
  const info = await discoverOAuthServerInfo(serverUrl);
  return info;
}

// ─────────────────────────────────────────────────────────────────────────────
// 63. experimental.tasks.createMessageStream() — proper handling with takeResult
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createMessageStream_withTakeResult(
  server: Server,
  params: any
) {
  try {
    // SHOULD_NOT_FIRE — takeResult() auto-throws on 'error' messages, wrapped in try-catch
    const result = await takeResult(
      server.experimental.tasks.createMessageStream(params)
    );
    return result;
  } catch (error) {
    console.error('Sampling failed:', (error as Error).message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 64. experimental.tasks.createMessageStream() — error message dropped silently
// @expect-violation: create-message-stream-error-message-not-handled
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createMessageStream_dropsErrors(
  server: Server,
  params: any
) {
  // ❌ Iterates without branching on message.type === 'error'
  let finalResult: any = undefined;
  // SHOULD_FIRE: create-message-stream-error-message-not-handled — silently drops 'error' messages
  const stream = server.experimental.tasks.createMessageStream(params);
  for await (const message of stream) {
    if (message.type === 'result') {
      finalResult = message.result;
    }
    // 'error' messages silently ignored — caller treats failure as "no result"
  }
  return finalResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// 65. experimental.tasks.createMessageStream() — tools without capability check
// @expect-violation: create-message-stream-tool-capability-not-checked
// ─────────────────────────────────────────────────────────────────────────────

async function gt_createMessageStream_noCapabilityCheck(
  server: Server,
  params: any
) {
  // ❌ params.tools may be set but client may not advertise sampling.tools capability
  // No pre-call gate on server.getClientCapabilities()?.sampling?.tools
  const paramsWithTools = { ...params, tools: [{ name: 'calculator' }] };
  // SHOULD_FIRE: create-message-stream-tool-capability-not-checked — synchronous throw on capability mismatch
  const stream = server.experimental.tasks.createMessageStream(paramsWithTools);
  for await (const message of stream) {
    if (message.type === 'result') return message.result;
    if (message.type === 'error') throw message.error;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// 66. experimental.tasks.elicitInputStream() — proper handling with takeResult
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_elicitInputStream_withTakeResult(
  server: Server,
  params: any
) {
  try {
    // SHOULD_NOT_FIRE — takeResult() auto-throws on 'error', wrapped in try-catch
    const result = await takeResult(
      server.experimental.tasks.elicitInputStream(params, {
        task: { ttl: 300000 },
      })
    );
    return result;
  } catch (error) {
    console.error('Elicitation failed:', (error as Error).message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 67. experimental.tasks.elicitInputStream() — error message dropped silently
// @expect-violation: elicit-input-stream-error-message-not-handled
// ─────────────────────────────────────────────────────────────────────────────

async function gt_elicitInputStream_dropsErrors(
  server: Server,
  params: any
) {
  // ❌ Iterates without branching on message.type === 'error'
  let action: string | undefined;
  // SHOULD_FIRE: elicit-input-stream-error-message-not-handled — silently drops 'error' messages
  const stream = server.experimental.tasks.elicitInputStream(params, {
    task: { ttl: 300000 },
  });
  for await (const message of stream) {
    if (message.type === 'result') {
      action = message.result.action;
    }
    // 'error' messages silently ignored — caller treats network failure as "user declined"
  }
  return action;
}

// ─────────────────────────────────────────────────────────────────────────────
// 68. OAuthServerProvider.verifyAccessToken() — implementer silently returns dummy AuthInfo (auth bypass)
// @expect-violation: verify-access-token-must-throw-on-invalid
// ─────────────────────────────────────────────────────────────────────────────

class BadVerifierFailOpen implements OAuthTokenVerifier {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    // ❌ Silently returns dummy AuthInfo when the JWT can't be verified.
    // requireBearerAuth() has no validity gate — every request passes auth.
    // SHOULD_FIRE: verify-access-token-must-throw-on-invalid — must throw InvalidTokenError, not return defaults
    try {
      return await this.decodeJwt(token);
    } catch {
      return {
        token,
        clientId: 'unknown',
        scopes: [],
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };
    }
  }
  private async decodeJwt(_token: string): Promise<AuthInfo> {
    throw new Error('jwt verification not implemented');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 69. OAuthServerProvider.verifyAccessToken() — proper InvalidTokenError on failure
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

class GoodVerifierFailClosed implements OAuthTokenVerifier {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    try {
      // SHOULD_NOT_FIRE — re-throws as InvalidTokenError on every failure path
      const decoded = await this.decodeJwt(token);
      if (!decoded) {
        throw new InvalidTokenError('Token verification failed');
      }
      return decoded;
    } catch (err) {
      if (err instanceof InvalidTokenError) throw err;
      if (err instanceof InsufficientScopeError) throw err;
      throw new InvalidTokenError(`Token verification failed: ${(err as Error).message}`);
    }
  }
  private async decodeJwt(_token: string): Promise<AuthInfo | null> {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 70. Full OAuthServerProvider implementation — verifyAccessToken fail-open is the
// security-critical leak even when other methods are correct
// @expect-violation: verify-access-token-must-throw-on-invalid
// ─────────────────────────────────────────────────────────────────────────────

class CustomOAuthServerProviderBadVerify implements OAuthServerProvider {
  clientsStore = { getClient: async (_id: string) => undefined } as any;
  async authorize(_client: OAuthClientInformationFull, _params: AuthorizationParams, _res: ExpressResponse): Promise<void> {
    /* delegate to upstream */
  }
  async challengeForAuthorizationCode(_client: OAuthClientInformationFull, _code: string): Promise<string> {
    return 'challenge';
  }
  async exchangeAuthorizationCode(_client: OAuthClientInformationFull, _code: string): Promise<OAuthTokens> {
    return { access_token: 'a', token_type: 'Bearer' };
  }
  async exchangeRefreshToken(_client: OAuthClientInformationFull, _rt: string): Promise<OAuthTokens> {
    return { access_token: 'a', token_type: 'Bearer' };
  }
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    // ❌ Returns dummy AuthInfo instead of throwing — auth bypass
    // SHOULD_FIRE: verify-access-token-must-throw-on-invalid — returns instead of throwing
    return {
      token,
      clientId: 'bypass-client',
      scopes: ['*'],
      expiresAt: Math.floor(Date.now() / 1000) + 86400,
    };
  }
  async revokeToken(_client: OAuthClientInformationFull, _req: OAuthTokenRevocationRequest): Promise<void> {
    /* noop */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 71. withOAuth() enhanced fetch — caller does not handle UnauthorizedError
// @expect-violation: with-oauth-enhanced-fetch-must-handle-unauthorized
// ─────────────────────────────────────────────────────────────────────────────

async function gt_withOAuth_noTryCatch(provider: OAuthClientProvider) {
  const enhanced = applyMiddlewares(withOAuth(provider, 'https://api.example.com'))(fetch);
  // ❌ No try/catch — enhanced fetch throws UnauthorizedError on 401-after-retry, REDIRECT, or non-AUTHORIZED auth result.
  // SHOULD_FIRE: with-oauth-enhanced-fetch-must-handle-unauthorized — no try-catch around enhanced fetch
  const response = await enhanced('https://api.example.com/data');
  return await response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 72. withOAuth() enhanced fetch — caller handles UnauthorizedError and branches on REDIRECT
// @expect-clean
// ─────────────────────────────────────────────────────────────────────────────

async function gt_withOAuth_withTryCatch(provider: OAuthClientProvider) {
  const enhanced = applyMiddlewares(withOAuth(provider, 'https://api.example.com'))(fetch);
  try {
    // SHOULD_NOT_FIRE — wrapped in try/catch and branches on UnauthorizedError
    const response = await enhanced('https://api.example.com/data');
    return await response.json();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      if (err.message.includes('redirect initiated')) {
        return null;
      }
      console.error('OAuth re-auth failed', err);
      throw err;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 73. withOAuth() enhanced fetch — bare await assigned to const, no try/catch downstream
// @expect-violation: with-oauth-enhanced-fetch-must-handle-unauthorized
// ─────────────────────────────────────────────────────────────────────────────

async function gt_withOAuth_chainedNoTryCatch(provider: OAuthClientProvider, url: string) {
  const enhanced = applyMiddlewares(withOAuth(provider))(fetch);
  // ❌ Chained call; UnauthorizedError propagates to caller; no try/catch here.
  // SHOULD_FIRE: with-oauth-enhanced-fetch-must-handle-unauthorized — bare await, throw escapes
  const res = await enhanced(url);
  const body = await res.text();
  return body.length;
}
