# CHANGELOG — square

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 82%

- **Profile:** `packages/square/contract.yaml`
- **Functions added:** subscriptions.pause, subscriptions.resume, invoices.cancel (3 total)
- **Postconditions added:** 9 (3 per function)
- **Functions intentionally omitted this pass:** none (5 prior read-only GETs remain omitted)
- **API surface re-count:** previous pass under-counted v44 namespaced surface — bumped from 25 to 28; 3 newly contracted, leaving bookings.create / invoices.update / invoices.delete deferred for follow-up
- **Detection updates:** added `InvoicesClient` to `detection.class_names` so the existing throwing-function detector picks up `client.invoices.cancel(...)` callsites
- **Scanner concerns queued:** 3 (`concern-20260624-square-deepen-11`, `concern-20260624-square-deepen-12`, `concern-20260624-square-deepen-13`)
- **Scanner version used:** nark@3.1.0 (from `nark-dev/nark/package.json`)
- **Sources fetched (2026-06-24):**
  - https://developer.squareup.com/reference/square/subscriptions-api/pause-subscription
  - https://developer.squareup.com/reference/square/subscriptions-api/resume-subscription
  - https://developer.squareup.com/reference/square/invoices-api/cancel-invoice
  - https://developer.squareup.com/docs/invoices-api/overview
  - https://developer.squareup.com/reference/square/enums/ErrorCode
- **Key new findings:**
  - `subscriptions.pause()` is DEFERRED — pause takes effect at start of next billing cycle if pauseEffectiveDate is omitted or in current cycle. Silent-success trap if caller doesn't read `response.actions[0].effectiveDate`.
  - `subscriptions.resume()` commonly hits INVALID_CARD / CUSTOMER_NOT_FOUND on long-paused subscriptions (cards on file expire during the pause). Must be surfaced to the customer, not silently retried.
  - `invoices.cancel()` requires a `version` parameter for optimistic concurrency control. Stale version triggers an INVALID_REQUEST_ERROR — caller must re-fetch with `invoices.get()` before retrying. Cancellation is IRREVERSIBLE.
- **Verified by:** bc-deepen-contract (pass 41 on 2026-06-24T05:30:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** square@44.2.0
- **Profile semver:** `>=40.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** square@44.1.0
- **Profile semver:** >=40.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** square@44.1.0
- **Profile semver:** `>=40.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** square@44.1.0
- **Profile semver:** `>=40.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** square@44.1.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** square@>=40.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
