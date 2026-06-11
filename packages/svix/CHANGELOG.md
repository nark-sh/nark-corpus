# svix Profile Changelog

Created by bc-deepen-contract Phase 6.4 — pre-CHANGELOG history not preserved.

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
