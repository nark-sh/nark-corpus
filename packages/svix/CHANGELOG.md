
## 2026-06-14 — re-verified clean

- **Latest published:** svix@1.95.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

# svix Profile Changelog

Created by bc-deepen-contract Phase 6.4 — pre-CHANGELOG history not preserved.

## 2026-06-11 — deepen pass — coverage 75% → 92%

- **Profile:** `packages/svix/contract.yaml`
- **Functions added:** authentication.expireAll, endpoint.replayMissing, endpoint.sendExample (3 total)
- **Postconditions added:** 6 (authentication-expire-all-api-error, authentication-expire-all-network-error, endpoint-replay-missing-api-error, endpoint-replay-missing-async-not-polled, endpoint-send-example-api-error, endpoint-send-example-delivery-not-confirmed)
- **Functions intentionally omitted this pass:** operationalWebhookEndpoint.create (svix→YOUR system webhooks, enterprise-only pattern, narrow SaaS adoption), authentication.dashboardAccess (legacy, superseded by appPortalAccess), authentication.logout (void session mgmt, no domain contract), authentication.streamPortalAccess/getStreamPollerToken/rotateStreamPollerToken (streaming enterprise feature), all list/read-only/admin CRUD, backgroundTask.*/health.*/statistics.*/environment.*/eventType.*/integration.*/connector.*/ingest.*/streaming.*
- **Scanner concerns queued:** 3 (`concern-20260611-svix-deepen-5` — authentication.expireAll detection, `concern-20260611-svix-deepen-6` — endpoint.replayMissing async-not-polled pattern, `concern-20260611-svix-deepen-7` — endpoint.sendExample delivery-not-confirmed pattern)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `svix@1.84.1/dist/api/authentication.js` — expireAll() implementation (POST /api/v1/auth/app/{app_id}/expire-all, sendNoResponseBody)
  - `svix@1.84.1/dist/api/endpoint.js` — replayMissing() and sendExample() implementations
  - `svix@1.84.1/dist/models/replayOut.d.ts` — ReplayOut: { id: string, status: BackgroundTaskStatus, task: BackgroundTaskType }
  - `svix@1.84.1/dist/models/backgroundTaskStatus.d.ts` — BackgroundTaskStatus enum: "running" | "finished" | "failed"
  - `svix@1.84.1/dist/models/eventExampleIn.d.ts` — EventExampleIn: { eventType: string, exampleIndex?: number }
  - `svix@1.84.1/dist/models/applicationTokenExpireIn.d.ts` — ApplicationTokenExpireIn: { expiry?: number | null, sessionIds?: string[] }
  - `svix@1.84.1/dist/request.js` — filterResponseForErrors() and sendWithRetry() confirmed (2 retries on 5xx/network)
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T20:16:21Z)

### Key insights from this pass

1. **authentication.expireAll() is security-critical, not administrative:** Called in incident response to immediately revoke all outstanding portal magic links. A missing try-catch means outstanding sessions remain valid after a security event — the portal is still accessible to unauthorized parties. Must catch both ApiException AND Error (network failures skip retry on auth endpoints).

2. **endpoint.replayMissing() has the same async pitfall as endpoint.recover():** Both return a background task reference (ReplayOut vs RecoverOut — both have `id` and `status` fields). Callers who discard the return value assume the replay is complete when it is only queued. The BackgroundTaskStatus enum ("running" / "finished" / "failed") must be polled.

3. **endpoint.sendExample() creates a queued message, NOT a delivery receipt:** MessageOut confirms the test message was enqueued — it does NOT confirm the endpoint's HTTP server received and acknowledged the payload. "Send Test Event" UIs that use sendExample() without calling messageAttempt.listByMsg() to verify delivery will give false assurance to customers with misconfigured endpoints.

## 2026-06-11 — deepen pass — coverage 17% → 75%

- **Profile:** `packages/svix/contract.yaml`
- **Functions added:** application.create, application.getOrCreate, endpoint.create, endpoint.recover, endpoint.rotateSecret, authentication.appPortalAccess, messageAttempt.resend, Webhook.verify (missing-required-headers postcondition added) (8 total)
- **Postconditions added:** 11 (api-error×7, network-error×1, async-not-polled×1, missing-required-headers×1, plus 1 to existing verify function)
- **Functions intentionally omitted this pass:** eventType.create (niche schema management, not a SaaS hot-path runtime call), integration.rotateKey (admin operation), environment.import (one-time migration operation) — all bulk list/get/update/delete/patch operations across all namespaces (no distinct error contracts beyond generic ApiException), backgroundTask/health/statistics/connector/ingest/streaming/operationalWebhookEndpoint (admin/niche/enterprise)
- **Scanner concerns queued:** 4 (`concern-20260611-svix-deepen-1` — application.create detection, `concern-20260611-svix-deepen-2` — endpoint.create nested namespace detection, `concern-20260611-svix-deepen-3` — authentication.appPortalAccess 3-level chain, `concern-20260611-svix-deepen-4` — endpoint.recover async-not-polled pattern)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `svix@1.95.2/dist/request.js` — filterResponseForErrors() throw sites (ApiException for all 4xx/5xx)
  - `svix@1.95.2/dist/util.js` — ApiException class: code, body, headers fields
  - `standardwebhooks/dist/index.js` — WebhookVerificationError: "Missing required headers", "Message timestamp too old", "Message timestamp too new", "No matching signature found"
  - `svix@1.95.2/dist/api/application.d.ts` — create(), getOrCreate() signatures
  - `svix@1.95.2/dist/api/endpoint.d.ts` — create(), recover(), rotateSecret() signatures
  - `svix@1.95.2/dist/api/authentication.d.ts` — appPortalAccess() signature
  - `svix@1.95.2/dist/api/messageAttempt.d.ts` — resend() signature
  - `svix@1.95.2/dist/api/backgroundTask.d.ts` — BackgroundTaskOut.status field (used in recover() async pattern)
  - https://docs.svix.com/idempotency
  - https://docs.svix.com/app-portal
  - https://docs.svix.com/receiving/verifying-payloads/how
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T00:00:00Z)

### Key insights from this pass

1. **All HTTP methods use a single error class:** `ApiException` with `code` (HTTP status integer), `body` (parsed JSON for 4xx, raw text for 5xx), and `headers` fields. Confirmed from `filterResponseForErrors()` in `dist/request.js`.

2. **5xx errors are auto-retried:** `sendWithRetry()` retries on 5xx and network failures 2× before throwing. 4xx errors are NOT retried. Callers must still catch the final throw.

3. **endpoint.recover() is ASYNCHRONOUS:** Returns `RecoverOut` with a `id` (background task ID) immediately — the actual message replay happens in the background. Callers who discard the return value assume recovery is complete when it is only queued.

4. **WebhookVerificationError has 3 distinct conditions:** (a) missing headers, (b) timestamp too old/new (5 min tolerance, confirmed from `WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60`), (c) signature mismatch. Prior profile only covered (b) and (c).

5. **application.create() failure is silent and cascading:** If create() throws without try-catch, the customer has no svix application — subsequent message.create() calls will fail with 404 (app not found), delivering to zero endpoints without any error if THAT call is also uncaught.
