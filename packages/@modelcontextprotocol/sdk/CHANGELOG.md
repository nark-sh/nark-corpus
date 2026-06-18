# CHANGELOG — @modelcontextprotocol/sdk

All notable verification, deepen, and fork events for this profile. Newest first.


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
