# CHANGELOG — resend

All notable verification, deepen, and fork events for this profile. Newest first.

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
