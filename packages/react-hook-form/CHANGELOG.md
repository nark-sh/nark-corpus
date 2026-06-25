# CHANGELOG — react-hook-form

## 2026-06-25 — re-verified clean

- **Latest published:** react-hook-form@7.80.0
- **Profile semver:** ^7.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 67% → 78%

- **Profile:** `packages/react-hook-form/contract.yaml`
- **Functions added:** useController (1 total)
- **Postconditions added:** 1 (controller-onchange-resolver-rejection)
- **Functions intentionally omitted this pass:** none new — useFormState (read-only subscription) and useWatch (read-only value subscription) remain omitted. useController moved from omitted to contracted because v7.79.0 (PR #13518) restored the Promise return from field.onChange.
- **Scanner concerns queued:** 1 (`concern-20260623-react-hook-form-deepen-1`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://github.com/react-hook-form/react-hook-form/releases/tag/v7.79.0
  - https://github.com/react-hook-form/react-hook-form/releases/tag/v7.80.0
  - https://github.com/react-hook-form/react-hook-form/pull/13518
  - https://react-hook-form.com/docs/usecontroller
  - node_modules/react-hook-form@7.80.0/dist/index.esm.mjs (lines 462-477, 1798-1854, 2082-2152)
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T20:53:47Z, deepen-stream-3 pass 6, public tier)

Effective coverage (contracted / non-omitted async-callable) = 7/7 = 1.0. Raw coverage 7/9 = 0.78 (denominator includes useFormState and useWatch which are intentionally omitted as read-only subscriptions). Async-callable surface for v7.80.0: handleSubmit, useFormContext, useFieldArray, trigger, Form, useForm, useController — all contracted.

## 2026-06-18 — re-verified clean

- **Latest published:** react-hook-form@7.79.0
- **Profile semver:** `^7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** react-hook-form@7.79.0
- **Profile semver:** ^7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** react-hook-form@7.79.0
- **Profile semver:** `^7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** react-hook-form@7.79.0
- **Profile semver:** `^7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** react-hook-form@7.79.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

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
