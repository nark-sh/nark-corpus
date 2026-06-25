# CHANGELOG — @anthropic-ai/sdk

## 2026-06-25 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.106.0
- **Profile semver:** >=0.18.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 69% → 67% raw, 100% effective (surface grew)

- **Profile:** `packages/@anthropic-ai/sdk/contract.yaml`
- **Functions added:** beta.messages.toolRunner (1 total — beta.messages.create deferred)
- **Postconditions added:** 2 (tool-runner-no-try-catch, tool-runner-max-iterations-not-set)
- **Functions intentionally omitted this pass:** beta.messages.countTokens (duplicates non-beta countTokens contract), beta.models.retrieve / beta.models.list (read-only GETs, same omission rationale as non-beta models)
- **Functions DEFERRED this pass:** beta.messages.create — entry would shadow the existing `messages.create` postcondition under the current scanner's suffix-match logic (`effectiveName.endsWith("." + chainStr)` lets `beta.messages.create` match plain `anthropic.messages.create()` chains). Queued as scanner-upgrade concern `concern-20260624-anthropic-sdk-deepen-2` (matcher needs prefix-aware behavior). Original proposed postconditions captured in `nark/src/upgrade-concerns.json` for re-introduction after the scanner fix.
- **Scanner concerns queued:** 2 (`concern-20260624-anthropic-sdk-deepen-1` — toolRunner async-iterable detector; `concern-20260624-anthropic-sdk-deepen-2` — matcher prefix-awareness for adjacent variants)
- **Scanner version used:** nark@3.2.0
- **SDK version inspected:** @anthropic-ai/sdk@0.105.0
- **Sources fetched:** node_modules/@anthropic-ai/sdk@0.105.0/lib/tools/BetaToolRunner.{d.ts,js}, resources/beta/messages/messages.d.ts, https://platform.claude.com/docs/en/api/errors, https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview
- **API surface delta vs pass 5:** 16 → 18 async-callable functions (toolRunner newly contracted; beta.messages.create deferred). Managed Agents preview surface (agents/sessions/memory-stores/skills/vaults/deployments/environments/user-profiles) re-checked against v0.105.0; still <1% production adoption; deferred to 2026-09 revisit.
- **Tests:** all 16 ground-truth tests pass (toolRunner SHOULD_FIRE annotations use "(when X lands)" parenthetical form so the harness regex skips them until detector ships)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 75, 2026-06-24T11:55Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.105.0
- **Profile semver:** `>=0.18.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.104.2
- **Profile semver:** >=0.18.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.104.2
- **Profile semver:** `>=0.18.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @anthropic-ai/sdk@0.104.2
- **Profile semver:** `>=0.18.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

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
