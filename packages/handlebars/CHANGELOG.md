# CHANGELOG — handlebars

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 83%

- **Profile:** `packages/handlebars/contract.yaml`
- **Functions added:** none (re-verification pass)
- **Postconditions added:** 1 (`compile-invalid-input-type` on `compile()`)
- **Functions intentionally omitted this pass:** parse (low adoption for direct use; error profile identical to compile)
- **Scanner concerns queued:** 1 (`concern-20260624-handlebars-deepen-5`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://handlebarsjs.com/api-reference/compilation.html, https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/compiler/compiler.js
- **Verified by:** bc-deepen-contract (pass on 2026-06-24, deepen-stream-2, pass 45)
- **Notes:** Drift-by-staleness re-verification of 2.5-month-old profile against handlebars 4.7.9. Re-reading compiler.js surfaced that `compile()` was missing the invalid-input-type postcondition that `precompile()` already documented — same throw mechanism (compiler.js line 481), different entrypoint. Other unmatched throws in compiler.js (knownHelpersOnly + unknown helper, unsupported partial-args count) are option-specific and rarely hit in app code; deferred to a future deepen pass.

## 2026-06-18 — re-verified clean

- **Latest published:** handlebars@4.7.9
- **Profile semver:** `>=4.7.7` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** handlebars@4.7.9
- **Profile semver:** >=4.7.7 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** handlebars@4.7.9
- **Profile semver:** `>=4.7.7` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** handlebars@4.7.9
- **Profile semver:** `>=4.7.7` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** handlebars@4.7.9
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** handlebars@>=4.7.7
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
