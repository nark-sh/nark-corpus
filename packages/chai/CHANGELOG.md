# CHANGELOG — chai

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — re-verified clean

- **Latest published:** chai@6.2.2
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** chai@6.2.2
- **Profile semver:** >=4.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** chai@6.2.2
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** chai@6.2.2
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** chai@6.2.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen re-verification pass — coverage 67% → 67% (no change)

- **Profile:** `packages/chai/contract.yaml`
- **Functions added:** none (already at effective coverage 4/4 = 1.0)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `use(fn)` — sync plugin registration, programming-error TypeError only, no async contract; class exports (`Assertion`, `AssertionError`, `Should`) — not callable as functions; `config` — config object, not callable; `util` namespace — sync plugin-development helpers
- **Scanner concerns queued:** 0 (existing detection covers all 4 contracted entries)
- **Scanner version used:** nark@3.0.0
- **Package version verified against:** chai@6.2.2
- **Sources fetched:** `node_modules/chai/index.js` (exports block line 4162, `use()` impl line 4144); `node_modules/chai/package.json` (v6.2.2 confirmed); README.md (no API additions in v6 user-facing surface)
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T01:38:00Z)
- **Verdict:** re-confirmed-covered. Chai is a synchronous assertion library; the 4 contracted entry points (`expect`, `assert`, `should`, `assert.ifError`) remain the complete set of callable exports with distinct throw contracts. v6 added `register-assert.js`/`register-expect.js`/`register-should.js` entry points but these are sync side-effect imports that bind to `globalThis` with no new error semantics. `last_verified` bumped from 2026-04-20 → 2026-06-12; `contract_version` bumped 1.1.0 → 1.1.1 (re-verification, no content change).

## 2026-04-20 — backfilled

- **Verified against:** chai@>=4.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
