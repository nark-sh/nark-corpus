# CHANGELOG — @mistralai/mistralai

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — re-verified at v2.3.0 (deepen pass 49)

- **Verified against:** @mistralai/mistralai@2.3.0 (installed via npm install)
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no new postconditions — all v2.3.0 new surface is admin/read-only
- **New SDK namespaces reviewed:** beta.rag.* (searchIndexes + ingestionPipelineConfigurations), beta.observability.traces/logs/spans.*, workflows.bulkArchive/bulkUnarchive, betaAgents version-management subcommands, betaConnectors activation + credential-management subcommands
- **Disposition:** all 8 new categories added to `functions_intentionally_omitted` (admin/setup/read-only error families already covered by existing omissions for beta.libraries.*, beta.connectors.create/get/update/delete, workflows.archive/unarchive, beta.observability.* admin)
- **Coverage:** 1.0 -> 1.0 (23/23 runtime-relevant functions still contracted)
- **api_functions_total:** 34 -> 42 (8 new omission categories; contracted count unchanged at 23)
- **Notes added:** 5 explanatory bullets to contract.yaml mapping new namespaces to existing admin omission families
- **Fixtures touched:** none (no new postconditions)
- **Scanner concerns queued:** none
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 49)

## 2026-06-18 — re-verified clean

- **Latest published:** @mistralai/mistralai@2.2.6
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @mistralai/mistralai@2.2.6
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @mistralai/mistralai@2.2.6
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @mistralai/mistralai@2.2.5
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @mistralai/mistralai@2.2.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @mistralai/mistralai@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
