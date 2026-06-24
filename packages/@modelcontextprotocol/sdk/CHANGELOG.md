# CHANGELOG — @modelcontextprotocol/sdk

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 86% → 91%

- **Profile:** `packages/@modelcontextprotocol/sdk/contract.yaml`
- **Functions added:** `OAuthServerProvider.verifyAccessToken`, `withOAuth` (2 total)
- **Postconditions added:** 2 (`verify-access-token-must-throw-on-invalid` — implementer-contract for the server-side OAuth bearer-auth gate; `with-oauth-enhanced-fetch-must-handle-unauthorized` — composable-middleware enhanced-fetch unhandled-UnauthorizedError pattern)
- **Functions intentionally omitted this pass:** none new — `withOAuth` was promoted out of the prior "sync factory" omission (the factory is sync but the returned Middleware function is async and throws UnauthorizedError)
- **Scanner concerns queued:** 2 (`concern-20260624-modelcontextprotocol-sdk-deepen-32` for the implementer-contract "interface-method-must-throw" pattern on `OAuthServerProvider.verifyAccessToken`; `concern-20260624-modelcontextprotocol-sdk-deepen-33` for the composable-middleware enhanced-fetch unhandled-UnauthorizedError pattern via `applyMiddlewares(withOAuth(...))(fetch)`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:** https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/server/auth/provider.ts (read inline from installed v1.29.0 dist/cjs/server/auth/provider.d.ts), https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/server/auth/middleware/bearerAuth.ts (read inline from installed v1.29.0 dist/cjs/server/auth/middleware/bearerAuth.js), https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/client/middleware.ts (read inline from installed v1.29.0 dist/cjs/client/middleware.js), https://github.com/modelcontextprotocol/typescript-sdk/pull/485 (introduced the middleware family, merged 2025-08-18)
- **Verified by:** bc-deepen-contract (pass 81 on 2026-06-24T13:15:33Z, deepen-stream-3)

## 2026-06-18 — deepen pass — coverage 79% → 86%

- **Profile:** `packages/@modelcontextprotocol/sdk/contract.yaml`
- **Functions added:** `takeResult`, `toArrayAsync`, `experimental.tasks.requestStream` (3 total)
- **Postconditions added:** 3 (one per function, each capturing the canonical missing-error-handling pattern for the helper)
- **Functions intentionally omitted this pass:** none new — prior omissions stand
- **Scanner concerns queued:** 3 (`concern-20260618-modelcontextprotocol-sdk-deepen-29` (takeResult unhandled rejection), `concern-20260618-modelcontextprotocol-sdk-deepen-30` (toArrayAsync dual gap — iteration error + post-call array inspection), `concern-20260618-modelcontextprotocol-sdk-deepen-31` (requestStream silent-error-drop; generalize across experimental.tasks.*Stream family))
- **Scanner version used:** nark@3.0.0
- **Sources fetched:** https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/shared/responseMessage.ts (read inline from installed v1.29.0 dist/cjs/shared/responseMessage.js), https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/experimental/tasks/client.ts (read inline from installed v1.29.0 dist/cjs/experimental/tasks/client.d.ts)
- **Verified by:** bc-deepen-contract (pass on 2026-06-18T23:31:12Z, deepen-stream-2 pass 13)

## 2026-06-18 — re-verified clean

- **Latest published:** @modelcontextprotocol/sdk@1.29.0
- **Profile semver:** `^1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @modelcontextprotocol/sdk@1.29.0
- **Profile semver:** ^1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @modelcontextprotocol/sdk@1.29.0
- **Profile semver:** `^1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @modelcontextprotocol/sdk@1.29.0
- **Profile semver:** `^1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @modelcontextprotocol/sdk@1.29.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 77% → 79%

- **Profile:** `packages/@modelcontextprotocol/sdk/contract.yaml`
- **Functions added:** fetchToken, discoverOAuthServerInfo, experimental.tasks.createMessageStream, experimental.tasks.elicitInputStream (4 total)
- **Postconditions added:** 6 (fetch-token-missing-params, fetch-token-oauth-error-not-handled, discover-oauth-server-info-fetch-error, create-message-stream-error-message-not-handled, create-message-stream-tool-capability-not-checked, elicit-input-stream-error-message-not-handled)
- **Functions intentionally omitted this pass:** createPrivateKeyJwtAuth (sync factory returning AddClientAuthentication function, no async throw); ClientCredentialsProvider/PrivateKeyJwtProvider/StaticPrivateKeyJwtProvider (constructor + sync utility methods, no async throws); auth-extensions JWT signing utilities (sync); ExperimentalServerTasks.requestStream (lower-level primitive shared by createMessageStream/elicitInputStream — same iterator contract, covered by the higher-level wrappers); ExperimentalServerTasks.getTask/getTaskResult/listTasks/cancelTask (identical error profile to the already-contracted Client experimental.tasks equivalents); experimental.tasks.registerToolTask (McpServer-side sync factory, throws synchronously only on `taskSupport: 'forbidden'` programmer error); TaskStore.createTask/storeTaskResult/getTask/updateTaskStatus/enqueue/dequeue/dequeueAll (interface methods on a user-provided storage backend — error contract is the backend's responsibility); StreamableHTTPServerTransport.closeSSEStream/closeStandaloneSSEStream (sync, no throws); WebStandardStreamableHTTPServerTransport.storeEvent and getStreamIdForEventId (EventStore interface methods on a user-provided event store backend).
- **Scanner concerns queued:** 4 (`concern-20260612-modelcontextprotocol-sdk-deepen-25` fetchToken throwing-function detection, `-26` discoverOAuthServerInfo throwing-function detection, `-27` AsyncGenerator-with-message-type-discrimination novel detection pattern, `-28` capability-precheck detection for createMessageStream tools)
- **Scanner version used:** nark@3.0.0
- **Package version verified:** @modelcontextprotocol/sdk@1.29.0
- **Sources fetched:**
  - `node_modules/@modelcontextprotocol/sdk/dist/esm/client/auth.d.ts` and `auth.js` (fetchToken impl, executeTokenRequest impl, discoverOAuthServerInfo impl)
  - `node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/server.d.ts` and `server.js` (createMessageStream impl with capability check + tool_use/tool_result validation; elicitInputStream impl delegating to requestStream)
  - `node_modules/@modelcontextprotocol/sdk/dist/esm/shared/responseMessage.js` (takeResult helper that throws on `type === 'error'`)
  - https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/client/auth.ts
  - https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/experimental/tasks/server.ts
  - https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 (OAuth error response codes)
  - https://datatracker.ietf.org/doc/html/rfc9728 (Protected Resource Metadata)
  - https://datatracker.ietf.org/doc/html/rfc8414 (Authorization Server Metadata)
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T03:14:30Z)

## 2026-04-16 — backfilled

- **Verified against:** @modelcontextprotocol/sdk@^1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
