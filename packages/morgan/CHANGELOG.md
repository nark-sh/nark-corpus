# CHANGELOG — morgan

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** morgan@1.11.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** morgan@1.11.0
- **Profile semver:** >=1.0.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** morgan@1.11.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** morgan@1.11.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** morgan@1.11.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 75% → 100%

- **Profile:** `packages/morgan/contract.yaml`
- **Functions added:** `format` (promoted from intentionally-omitted to contracted)
- **Postconditions added:** 1 (`format-name-overwrite-silent`)
- **Functions intentionally omitted this pass:** none — all 4 callable exports now contracted
- **Scanner concerns queued:** 0 — existing contract-matcher already detects this postcondition without a new detector rule (verified via passing ground-truth tests for SHOULD_FIRE / SHOULD_NOT_FIRE)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - `node_modules/morgan/index.js` (morgan@1.11.0, lines 488-491 = function format body; lines 178-209 = built-in formats registered via internal morgan.format() calls)
  - `node_modules/@types/morgan/index.d.ts` (Morgan interface, format() signatures)
  - https://github.com/expressjs/morgan#readme (morgan.format(name, fmt) usage docs)
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T16:32:51Z)
- **Notes:** Re-enumerated morgan@1.11.0 API surface — no new exports vs. 1.10.x. Prior depth pass (2026-04-16) intentionally omitted `morgan.format` calling it "a pure name registry, no distinct error surface." This pass reversed that decision: the function body assigns directly to `morgan[name]` with zero validation, and the built-in named formats live on the same `morgan[name]` slots, so calling `morgan.format('combined', ...)` silently replaces the Apache combined log shape for every other middleware in the same process — structurally the same hazard as the contracted `token-name-overwrite-silent` rule. Coverage 3/4 → 4/4 effective and raw. contract_version bumped 1.1.0 → 1.2.0.

## 2026-04-16 — backfilled

- **Verified against:** morgan@>=1.0.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
