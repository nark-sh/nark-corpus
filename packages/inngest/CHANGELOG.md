# CHANGELOG — inngest

## 2026-06-25 — re-verified clean

- **Latest published:** inngest@4.11.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (in-scope surface expanded)

- **Profile:** `packages/inngest/contract.yaml`
- **Functions added:** step.sleep, step.sleepUntil, step.fetch, step.ai.infer, step.realtime.publish, inngest.realtime.publish (6 total)
- **Postconditions added:** 8 (sleep-not-awaited, sleep-until-not-awaited, sleep-until-invalid-date, fetch-network-error-no-try-catch, ai-infer-provider-error-no-try-catch, step-realtime-publish-no-try-catch, realtime-publish-no-try-catch)
- **Functions intentionally omitted this pass:** inngest.sendSignal / step.sendSignal / step.waitForSignal (EXPERIMENTAL per SDK d.ts marker — not yet stable); step.ai.wrap (wraps user-provided SDK call — error semantics inherit from wrapped SDK, no novel surface); inngest.realtime.subscribe / inngest.realtime.token (auxiliary low-adoption read APIs)
- **Scanner concerns queued:** 5 (`concern-20260624-inngest-deepen-1` through `concern-20260624-inngest-deepen-5`)
- **Scanner version used:** nark@3.2.0
- **API surface verified against:** inngest@4.11.0 (installed into /private/tmp/claude/bc-deepen/inngest)
- **Sources fetched:** https://www.inngest.com/docs/reference/functions/step-sleep, https://www.inngest.com/docs/reference/functions/step-sleep-until, https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch, https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration, https://www.inngest.com/docs/features/realtime
- **SDK source citations:** `node_modules/inngest/components/InngestStepTools.cjs` (L166 schema-validation throw, L173 publish-failed throw, L275 sleepUntil invalid-date throw); `node_modules/inngest/components/Inngest.cjs` (L323 sendSignal throw, L358/L366 client-level publish throws); `node_modules/inngest/components/Fetch.d.ts` (StepFetch = typeof globalFetch)
- **Effective coverage:** 11/11 in-scope async-callable functions = 1.0
- **Verified by:** bc-deepen-contract (pass 27, deepen-stream-3, 2026-06-24T01:51:21.235Z)

## 2026-06-18 — re-verified clean

- **Latest published:** inngest@4.7.0
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** inngest@4.6.0
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** inngest@4.5.1
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** inngest@4.5.1
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** inngest@4.5.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** inngest@>=3.0.0 <5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
