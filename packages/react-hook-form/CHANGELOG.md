# CHANGELOG — react-hook-form

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-12 — deepen pass — coverage 67% → 67% (re-verification at v7.78.0)

- **Profile:** `packages/react-hook-form/contract.yaml`
- **Functions added:** none (async surface unchanged from April pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** FormStateSubscribe (sync render-prop component, no async error contract); Watch (sync render-prop component, returns ReactNode); useFormControlContext (sync context hook, returns Control); setValues (sync bulk setter on UseFormReturn); resetDefaultValues (sync setter on UseFormReturn); subscribe (sync subscription helper on UseFormReturn — returns unsubscribe cleanup function, no Promise contract)
- **Scanner concerns queued:** 0 (no new postconditions therefore no detection gaps)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:** node_modules/react-hook-form@7.78.0/dist/types/form.d.ts, node_modules/react-hook-form@7.78.0/dist/formStateSubscribe.d.ts, node_modules/react-hook-form@7.78.0/dist/watch.d.ts, node_modules/react-hook-form@7.78.0/dist/useFormControlContext.d.ts
- **Verdict:** Re-enumerated full API surface of react-hook-form@7.78.0 (latest published). 6 new exports introduced since April pass (3 new top-level components/hooks + 3 new UseFormReturn methods) — ALL are synchronous, no Promise-returning behavior, no async error contract worth enforcing. Existing 6 contracted entries (handleSubmit, useFormContext, useFieldArray, trigger, Form, useForm w/async defaultValues) remain valid. `last_verified` bumped from 2026-04-17 to 2026-06-12. `contract_version` bumped 1.1.0 → 1.1.1.
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T02:51:01Z, deepen-stream-1 pass 3)

## 2026-04-17 — backfilled

- **Verified against:** react-hook-form@^7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
