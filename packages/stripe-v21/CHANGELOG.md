# CHANGELOG — stripe

## 2026-06-25 — re-verified clean

- **Latest published:** stripe@22.3.0
- **Profile semver:** >=21.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass 2 — coverage 86% → 87.5% (effective 100%)

- **Profile:** `packages/stripe-v21/contract.yaml`
- **Functions added:** `parseEventNotificationAsync` (1 total)
- **Postconditions added:** 2 (`parse-event-notification-async-signature-failed`, `parse-event-notification-async-wrong-payload-type`)
- **Functions intentionally omitted this pass:** none new (existing omission of `oauth.authorizeUrl` carried forward — synchronous URL builder, no async errors)
- **Scanner concerns queued:** 1 (`concern-20260624-stripe-v21-deepen-parse-event-notification-async`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `stripe-node v22.2.3 cjs/stripe.core.js` lines 560-601 — `parseEventNotificationAsync` implementation
  - `stripe-node v22.2.3 cjs/stripe.core.d.ts` line 331 — `Promise<V2.Core.EventNotification>` signature
  - `stripe-node v22.2.3 CHANGELOG.md` — version added in v22.0.2 (PR #2685)
  - `https://github.com/stripe/stripe-node/pull/2685` — "Adds parseEventNotificationAsync to match existing sync function"
  - `https://github.com/stripe/stripe-node/pull/2618` — wrong-parsing-method guard (mirrored to async variant)
  - `https://docs.stripe.com/webhooks/signatures`
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T11:54:21Z)

**Key new insight:** `parseEventNotificationAsync` was added in stripe-node v22.0.2 (2026-04-16, PR #2685) and was missed by deepen pass 1 (2026-06-11). Edge Runtime webhook handlers (Cloudflare Workers, Vercel Edge Functions, Deno) require this variant — Node's `crypto` module is unavailable so the sync `parseEventNotification` cannot be used. Same error semantics as the sync variant: `StripeSignatureVerificationError` on bad signatures and plain `Error` on wrong-payload-type (the v21 wrong-parsing-method guard from PR #2618 was mirrored for the async variant in PR #2685). The async path uses `verifyHeaderAsync` (SubtleCrypto/WebCrypto) instead of `verifyHeader` (Node crypto).

## 2026-06-18 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=21.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** >=21.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=21.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=21.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean (v22 reviewed, no fork needed)

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=21.0.0` (unchanged — open-ended range covers v22)
- **Verdict:** no action — v22 breaking changes are TypeScript type restructuring (`Stripe.errors.StripeError` type removed, `new Stripe()` constructor enforced, callback removal). None invalidate the v21 error-handling postconditions (TemporarySessionExpiredError, RateLimitError v2, parseEventNotification, fetchRelatedObject, fetchEvent). stripe-v21 profile correctly covers v22 with its open-ended range.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

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
