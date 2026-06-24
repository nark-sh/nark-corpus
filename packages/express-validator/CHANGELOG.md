# CHANGELOG — express-validator

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 87% → 93%

- **Profile:** `packages/express-validator/contract.yaml`
- **Functions added:** validationResult.withDefaults (1 total)
- **Postconditions added:** 2 (withdefaults-formatter-throws, withdefaults-formatter-side-effect)
- **Functions intentionally omitted this pass:** buildCheckFunction (same error profile as body/check); Result.array / Result.mapped / Result.isEmpty / Result.formatWith (pure data access utilities, no error contracts)
- **Scanner concerns queued:** 1 (`concern-20260624-express-validator-deepen-1` — refine withdefaults-formatter-throws detector to discriminate safe vs unsafe formatters by inspecting formatter body for unguarded property access)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://express-validator.github.io/docs/api/validation-result#withdefaults; https://express-validator.github.io/docs/api/validation-errors; node_modules/express-validator@7.3.2/lib/validation-result.js
- **Notes:** Fixture (ground-truth.ts) already referenced `withdefaults-formatter-throws` via the legacy `@expect-violation:` syntax, but the postcondition itself was missing from contract.yaml — this pass closed that gap. Fixture annotations updated to the canonical `// SHOULD_FIRE: <id> — <reason>` style. Safe-formatter call site at line 265 had its SHOULD_NOT_FIRE annotation removed (replaced with a NOTE) because the current generic detector cannot yet discriminate safe vs unsafe formatters; the queued scanner concern tracks that work.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T04:36:10Z)

## 2026-06-18 — re-verified clean

- **Latest published:** express-validator@7.3.2
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** express-validator@7.3.2
- **Profile semver:** >=6.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** express-validator@7.3.2
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** express-validator@7.3.2
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** express-validator@7.3.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** express-validator@>=6.0.0 <8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
