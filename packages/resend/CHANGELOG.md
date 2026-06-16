# CHANGELOG — resend

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** resend@6.12.4
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** resend@6.12.4
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — deepen pass — coverage 86% → 100%

- **Profile:** `packages/resend/contract.yaml`
- **Functions added:** events.send, automations.stop (2 total)
- **Postconditions added:** 2 (`events-send-no-error-check`, `automations-stop-no-error-check`)
- **Functions intentionally omitted this pass:** None new. The 56 admin/read-only methods omitted in the 2026-06-12 pass remain omitted for the same reasons (generic `{ data, error }` silent-failure mode already covered).
- **Scanner concerns queued:** 2 (`concern-20260611-resend-deepen-7`, `concern-20260611-resend-deepen-8`)
- **Scanner version used:** nark@3.0.0 (read from nark-dev/nark/package.json)
- **Sources fetched:**
  - https://resend.com/docs/api-reference/events/send-event
  - https://resend.com/docs/api-reference/automations/stop-automation
  - https://resend.com/docs/api-reference/errors (re-verified error vocabulary)
  - `node_modules/resend/dist/index.d.mts` (resend@6.12.2 in papermark test-repo — declares `class Events { send(...): Promise<SendEventResponse>; ... }` and `class Automations { stop(id: string): Promise<StopAutomationResponse>; ... }`)
- **Key insights:**
  - These were the 2 functions the 2026-06-12 pass identified as "high-impact contractable" in the 12/14 effective-coverage denominator but did not write postconditions for. Closing the gap to 14/14.
  - `events.send()` is the Resend v6 Automations product trigger API. Silent failure here is uniquely dangerous because the downstream signal is *absent* — missed drip campaigns leave contacts silently dropped out of automation funnels with no error, no log, no downstream artifact. Often invisible for days/weeks until someone notices customers stopped getting onboarding emails.
  - `automations.stop()` is the control-plane halt operation. The required handling must check *both* `result.error` AND `result.data.status === 'disabled'` — a successful HTTP response can still carry a non-disabled state on the validation_error path. During incident response, a silently-failed stop call leaves the offending automation spamming customers while the operator's runbook claims it is halted.
- **Effective coverage:** 14/14 high-impact contractable methods = 1.0. Raw score against the 70-method surface = 0.20, but the 56 admin/read-only omissions are the correct call (their generic `{ data, error }` silent-failure mode is already covered by the standing postcondition pattern).
- **Verified by:** bc-deepen-contract (deepen-stream-1 pass 7 on 2026-06-11)

## 2026-06-12 — deepen pass — coverage 60% → 86%

- **Profile:** `packages/resend/contract.yaml`
- **Functions added:** emails.create, emails.update, batch.create, domains.verify, broadcasts.create, webhooks.create (6 total)
- **Postconditions added:** 6
- **Functions intentionally omitted this pass:** ~56 admin/read-only methods across 17 sub-clients (apiKeys, automations, automationRuns, contactProperties, contactSegments, contactTopics, segments, templates, topics, events, logs, receiving, plus list/get/update/delete on broadcasts/contacts/domains/emails/webhooks). Generic `{ data, error }` silent-failure mode is already documented under `emails-cancel-no-error-check` and `contacts-create-no-error-check` — adding postconditions for every list/get method would inflate the contract without adding new behavioral guidance.
- **Scanner concerns queued:** 6 (`concern-20260612-resend-deepen-1` through `-6`)
- **Scanner version used:** nark@1.0.x (read from nark-dev/nark/package.json)
- **Sources fetched:**
  - https://resend.com/docs/api-reference/errors (full error code table)
  - https://resend.com/docs/api-reference/emails/update-email
  - https://resend.com/docs/api-reference/domains/verify-domain
  - https://resend.com/docs/api-reference/broadcasts/create-broadcast
  - https://resend.com/docs/api-reference/webhooks/create-webhook
  - `node_modules/resend/dist/index.d.mts` (resend@6.12.4 type declarations)
- **Key insights:**
  - emails.create() / batch.create() are aliases for .send() added in SDK v5.x (REST naming) — scanner must detect both names.
  - emails.update() failures silently break drip-campaign reschedules.
  - domains.verify() is a verification *trigger*, not a synchronous verify — silent failure cascades into days-long send outages.
  - broadcasts.create() failures cascade into broadcasts.send(undefined) which surfaces a misleading TypeError/not_found.
  - webhooks.create() returns signing_secret in `data` — silent create-failure leads to handler deployed against undefined RESEND_WEBHOOK_SECRET, causing every webhook to fail verification.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 3 on 2026-06-12T03:09Z)

## 2026-04-03 — backfilled

- **Verified against:** resend@>=3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
