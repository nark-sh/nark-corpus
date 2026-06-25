# CHANGELOG — ai

## 2026-06-25 — re-verified clean

- **Latest published:** ai@6.0.209
- **Profile semver:** >=2.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 93%

- **Profile:** `packages/ai/contract.yaml`
- **Latest npm version evaluated:** ai@6.0.209 (82 days stale from prior pass on 2026-04-02)
- **Functions added:** ToolLoopAgent (Agent.generate / Agent.stream), validateUIMessages, createUIMessageStream (3 total)
- **Postconditions added:** 8 (agent-api-error, agent-invalid-argument, agent-no-output-generated, agent-missing-tool-results, agent-retry-exhausted, validate-ui-messages-type-validation, create-ui-message-stream-error-leak, create-ui-message-stream-execute-throw)
- **Functions intentionally omitted this pass:** experimental_generateVideo (still experimental, mirrors generateImage error model); safeValidateUIMessages (non-throwing twin); createUIMessageStreamResponse / pipeUIMessageStreamToResponse / createTextStreamResponse / pipeTextStreamToResponse / createAgentUIStreamResponse / pipeAgentUIStreamToResponse (Response/pipe wrappers — stream-builder upstream owns the error contract); readUIMessageStream / consumeStream (consumer-side, errors flow through configured onError); callCompletionApi (client-side fetch wrapper, caller-controlled error surface); convertFileListToFileUIParts / parsePartialJson (small data-transform Promises whose errors are direct AISDKError subclasses already covered generically)
- **Scanner concerns queued:** 4 (`concern-20260623-ai-deepen-stream2-pass14-1` through `-4`) covering ToolLoopAgent.generate / .stream method-call detection, validateUIMessages persistence-layer detection, and createUIMessageStream onError-missing detection
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://ai-sdk.dev/docs/agents/overview (ToolLoopAgent API)
  - https://ai-sdk.dev/docs/reference/ai-sdk-errors (canonical error class list — 32 classes confirmed)
  - https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence (validateUIMessages persistence pattern + TypeValidationError handling)
  - https://ai-sdk.dev/docs/ai-sdk-core/error-handling (generateText / streamText error handling)
  - ai@6.0.207 CHANGELOG entry b4b575a (createUIMessageStream onError default change — CVE-class data leak fix)
- **Coverage rationale:** prior pass marked 100% (12 in-scope functions all covered). Re-enumeration against ai@6.0.209 found 3 new high-impact v6 surfaces that materially expand the contract footprint. Coverage drops from 100% to 93% because the denominator grew (15 total) faster than the numerator (14 contracted). This is the correct drift-discovery behavior — stale 100% scores hide new API surface.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 14, 2026-06-23T22:11Z)

## 2026-06-18 — re-verified clean

- **Latest published:** ai@6.0.208
- **Profile semver:** `>=2.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ai@6.0.207
- **Profile semver:** >=2.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ai@6.0.206
- **Profile semver:** `>=2.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ai@6.0.206
- **Profile semver:** `>=2.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ai@6.0.205
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** ai@>=2.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
