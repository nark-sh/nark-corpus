# CHANGELOG — @langchain/openai

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 86%

- **Profile:** `packages/@langchain/openai/contract.yaml`
- **Functions added:** OpenAI.invoke (1 total)
- **Postconditions added:** 1 (llm-invoke-network-error)
- **Functions intentionally omitted this pass:** none new (carried forward: getNumTokensFromMessages — pure local tiktoken token counting, no API calls)
- **Scanner concerns queued:** 1 (`concern-20260624-langchain-openai-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Installed package version:** @langchain/openai@1.5.3
- **Sources fetched:**
  - `dist/llms.d.ts` (legacy OpenAI LLM class declaration)
  - `dist/llms.js` (completionWithRetry implementation, wrapOpenAIClientError funnel)
  - `dist/azure/llms.d.ts` (AzureOpenAI extends OpenAI legacy LLM)
- **Verified by:** bc-deepen-contract (drift-by-staleness re-verify against @1.5.3, deepen-stream-3 pass 55, 2026-06-24T08:20:47Z)
- **Key finding:** legacy `OpenAI` / `AzureOpenAI` LLM classes (extend BaseLLM, NOT BaseChatModel) are still exported from @langchain/openai@1.5.3 but were missed in the 2026-04-17 deepen pass because the existing `BaseChatOpenAI` patterns array doesn't match them. They sit in a separate inheritance tree and need their own scanner pattern entry (`OpenAI`, `AzureOpenAI`). Same error model as ChatOpenAI.invoke (TimeoutError / AuthenticationError / RateLimitError / NotFoundError / ContextOverflowError via wrapOpenAIClientError).


## 2026-06-18 — re-verified clean

- **Latest published:** @langchain/openai@1.5.1
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @langchain/openai@1.4.7
- **Profile semver:** >=0.1.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @langchain/openai@1.4.7
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @langchain/openai@1.4.7
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @langchain/openai@1.4.7
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** @langchain/openai@>=0.1.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
