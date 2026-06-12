# CHANGELOG — stripe

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — deepen pass — coverage 57% → 86%

- **Profile:** `packages/stripe-v21/contract.yaml`
- **Functions added:** `parseEventNotification`, `fetchRelatedObject`, `fetchEvent` (3 total)
- **Postconditions added:** 7 (2 for parseEventNotification, 3 for fetchRelatedObject, 2 for fetchEvent)
- **Functions intentionally omitted this pass:** `oauth.authorizeUrl` — synchronous URL builder, no async errors
- **Scanner concerns queued:** 3 (`concern-20260611-stripe-v21-deepen-1`, `concern-20260611-stripe-v21-deepen-2`, `concern-20260611-stripe-v21-deepen-3`)
- **Scanner version used:** nark@1.0.3
- **Sources fetched:**
  - `stripe-node v21.0.1 cjs/stripe.core.js` — parseEventNotification implementation (lines 375-416)
  - `stripe-node v21.0.1 cjs/Webhooks.js` — wrong-parsing-method guard (lines 28, 41)
  - `stripe-node v21.0.1 cjs/Error.js` — generateV2Error, TemporarySessionExpiredError, RateLimitError
  - `stripe-node v21.0.1 cjs/RequestSender.js` — StripeConnectionError path (lines 411-414)
  - `stripe-node v21.0.1 types/Errors.d.ts` — TemporarySessionExpiredError class definition
  - `https://github.com/stripe/stripe-node/pull/2618` — wrong-parsing-method guard change
  - `https://github.com/stripe/stripe-node/blob/v21.0.0/CHANGELOG.md`
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T23:30:00Z)

**Key new insights from this pass:**
1. `parseEventNotification()` throws a plain `Error` (NOT `StripeError`) for wrong payload type — `instanceof StripeError` alone does NOT catch it.
2. `fetchRelatedObject()` returns `Promise<null>` (does not throw) when `notification.related_object` is absent — silent failure if callers don't null-check.
3. `TemporarySessionExpiredError` is a **new v21 error class** (rawType: `temporary_session_expired`) distinct from `StripeRateLimitError` — affects any v2 API call made via StripeContext after context expiry.
4. `RateLimitError` (v2) is also a new class distinct from `StripeRateLimitError` (v1) — same concept but separate type in the v2 error dispatch path.

## 2026-06-09 — backfilled

- **Verified against:** stripe@>=21.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
