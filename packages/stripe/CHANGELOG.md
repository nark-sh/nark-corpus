# CHANGELOG — stripe

## 2026-06-25 — re-verified clean

- **Latest published:** stripe@22.3.0
- **Profile semver:** >=8.0.0 <21.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass — coverage 78% -> 82.6%

- **Profile:** `packages/stripe/contract.yaml`
- **Functions added:** update (1 total — promoted from previously-omitted list)
- **Postconditions added:** 4 (update-permission-error, update-idempotency-error, update-invalid-state-transition, update-invalid-parameter)
- **Error classes newly covered:** StripePermissionError and StripeIdempotencyError — both declared in stripe/types/Errors.d.ts and instantiated in stripe/cjs/Error.js since at least v8 but had NO postcondition referencing them across the 18 prior contracted functions (verified via grep before pass)
- **Functions intentionally omitted this pass:** list (read-only paginated enumeration), search (read-only), expire (narrow state-transition; surface fully overlapping with cancel), reverse-payout (narrow state-transition; surface fully overlapping with cancel/refund)
- **Scanner concerns queued:** 4 (`concern-20260624-stripe-deepen-1` ... `-4`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://docs.stripe.com/error-handling (fetched 2026-06-24, confirms both new error classes), https://docs.stripe.com/api/idempotent_requests, stripe@20.4.1 node_modules (Errors.d.ts + cjs/Error.js)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 78 on 2026-06-24T10:28Z)

## 2026-06-18 — re-verified (no action; sibling fork covers latest)

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged — this profile is the parent)
- **Verdict:** major drift on parent, but sibling version-fork already covers stripe@22.2.1; no action on parent
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified (fork already current)

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged; parent profile)
- **Verdict:** latest is outside parent range but covered by version fork `stripe-v21` — no action required on this profile
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified (fork already current)

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged; parent profile)
- **Verdict:** latest is outside parent range but covered by version fork — no action required on this profile
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged — covered by stripe-v21 fork for v21+)
- **Verdict:** no action on parent. stripe-v21 (`>=21.0.0`, open range) continues to cover v22.2.1. No new stripe major between 2026-06-14 and 2026-06-15 sweeps.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** stripe@22.2.1
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged — covered by stripe-v21 fork for v21+)
- **Verdict:** no action on parent profile — stripe-v21/contract.yaml (semver `>=21.0.0`) covers v21 and v22 with open-ended range. v22 changelog reviewed: TypeScript type restructuring, constructor style change (`new Stripe()` required), callback removal. None of these invalidate error-handling postconditions. stripe-v21 profile correctly covers current surface.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — re-verified clean

- **Latest published:** stripe@22.2.0
- **Profile semver:** `>=8.0.0 <21.0.0` (unchanged — covered by stripe-v21 fork for v21+)
- **Verdict:** no action needed on parent profile — stripe-v21/contract.yaml (semver `>=21.0.0`) already covers v21 and v22 with open-ended range. v22 changelog reviewed: only new API resources added, no error-handling changes since v21. stripe-v21 profile covers the full current surface.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-18 — backfilled

- **Verified against:** stripe@>=8.0.0 <21.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
