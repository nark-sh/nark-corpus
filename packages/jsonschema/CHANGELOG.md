# CHANGELOG — jsonschema

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (re-confirmed-complete)

- **Profile:** `packages/jsonschema/contract.yaml`
- **Functions added:** none (0 total)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none (no new sync-or-async surface in jsonschema@1.5.0 vs the existing covered set)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** `node_modules/jsonschema/lib/index.d.ts` (jsonschema@1.5.0), `node_modules/jsonschema/lib/validator.js`, `node_modules/jsonschema/lib/index.js` (all installed via `npm install jsonschema --cache /private/tmp/claude/.npm-cache` in `/private/tmp/claude/bc-deepen/jsonschema-pass34`)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 34, 2026-06-24T02:21Z)
- **Notes:** Full Phase 1 enumeration confirms the package is entirely synchronous — no `Promise<>` returns, no `async` declarations in `lib/*.js`. Public TypeScript surface from `lib/index.d.ts`: top-level `validate(instance, schema, options?)`, `Validator` class (constructor + `addSchema` + `validate`), `ValidatorResult` class (helper, no I/O), `ValidatorResultError`/`ValidationError`/`SchemaError` (error classes, not callable surface), plus the `scan` re-export from `lib/scan.js`. All four callable functions are contracted: `validate` (6 postconditions covering throwFirst / throwAll / throwError / invalid-schema-arg / allowUnknownAttributes / result-unchecked silent-failure), `Validator.validate` (2 postconditions covering throw + unresolved-ref), `addSchema` (2 postconditions covering invalid-schema-arg + undefined-schema-property), `scan` (1 postcondition covering conflicting-schema-ids). semver `>=1.0.0` already covers 1.5.0. last_verified bumped to 2026-06-24. coverage_score stays at 1.0. No new postconditions, no fixtures touched, no scanner concerns queued.

## 2026-06-18 — re-verified clean

- **Latest published:** jsonschema@1.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** jsonschema@1.5.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** jsonschema@1.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** jsonschema@1.5.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** jsonschema@1.5.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** jsonschema@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
