# CHANGELOG — vite

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (RE-CONFIRMED-COMPLETE)

- **Profile:** `packages/vite/contract.yaml`
- **Functions added:** none
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `parse`, `minify`, `parseAstAsync` — newly surfaced top-level re-exports from `rolldown/utils` and `rolldown/parseAst` (added between 2026-04-18 and 2026-06-24); their error contracts (parse/syntax errors) are owned by the rolldown profile, not vite — adding them here would double-cover semantics that belong upstream
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** vite@8.1.0 `node_modules/vite/dist/node/index.d.ts` (4009 lines), `node_modules/rolldown/dist/shared/transform-n2APpHoz.d.mts` (parse/minify signatures), `node_modules/rolldown/dist/parse-ast-index.d.mts` (parseAstAsync signature)
- **Verified by:** bc-deepen-contract (pass 79 deepen-stream-2 on 2026-06-24T10:42:37Z)
- **Notes:** Re-verify of the 2026-04-18 deep pass against vite@8.1.0. All 10 contracted async functions (build, createServer, preview, server.listen/close/restart, resolveConfig, loadConfigFromFile, createBuilder, transformWithOxc) still present with unchanged Promise signatures. Original omission list (12 items: deprecated APIs, internal pipeline utilities, internal dev-server plumbing) still accurate. Three new top-level re-exports surfaced from the rolldown→vite passthrough but classified as out-of-scope per upstream-ownership policy. metadata.last_verified bumped to 2026-06-24; contract_version bumped 1.2.0 → 1.2.1.

## 2026-06-18 — re-verified clean

- **Latest published:** vite@8.0.16
- **Profile semver:** `>=5.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** vite@8.0.16
- **Profile semver:** >=5.0.0 <9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** vite@8.0.16
- **Profile semver:** `>=5.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** vite@8.0.16
- **Profile semver:** `>=5.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** vite@8.0.16
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** vite@>=5.0.0 <9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
