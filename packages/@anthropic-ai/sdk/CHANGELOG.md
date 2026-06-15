# CHANGELOG — @anthropic-ai/sdk

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-14 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.104.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 44% → 69%

- **Profile:** `packages/@anthropic-ai/sdk/contract.yaml`
- **Functions added:** `messages.batches.cancel`, `messages.batches.delete`, `beta.webhooks.unwrap` (+ `messages.batches.results` promoted from omitted) — 4 net additions (3 new + 1 promotion)
- **Postconditions added:** 7 (2 on batches.cancel, 2 on batches.delete, 2 on batches.results, 1 on webhooks.unwrap)
- **Functions intentionally omitted this pass:** 9 new omissions from the Managed Agents preview surface (`beta.agents.*`, `beta.sessions.*`, `beta.memoryStores.*`, `beta.skills.*`, `beta.vaults.*`, `beta.userProfiles.*`, `beta.deployments.*`, `beta.deploymentRuns.*`, `beta.environments.*`) — too new to have real-world adoption (<1% of corpus repos); revisit in 3-6 months. Plus `messages.batches.retrieve` (idempotent polling, covered by batches.create error model).
- **Scanner concerns queued:** 6 (`concern-20260612-anthropic-sdk-deepen-1` through `-6`) — notable: concern-6 requires expanding scanner from awaited-only to selected synchronous APIs to cover `beta.webhooks.unwrap`
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
    - https://platform.claude.com/docs/en/api/canceling-message-batches
    - https://platform.claude.com/docs/en/api/deleting-message-batches
    - https://platform.claude.com/docs/en/api/errors
    - `node_modules/@anthropic-ai/sdk@0.104.1/resources/beta/webhooks.js` (unwrap source)
    - `node_modules/standardwebhooks/dist/index.d.ts` (WebhookVerificationError class)
    - `node_modules/@anthropic-ai/sdk@0.104.1/resources/messages/batches.d.ts`
- **Verified by:** bc-deepen-contract (pass 5 — deepen-stream-1 on 2026-06-12T03:19:15Z)

## 2026-04-04 — backfilled

- **Verified against:** @anthropic-ai/sdk@>=0.18.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
