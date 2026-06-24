# CHANGELOG — @upstash/qstash

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 90% → 96%

- **Profile:** `packages/@upstash/qstash/contract.yaml`
- **Functions added:** urlGroups.addEndpoints, urlGroups.removeEndpoints, urlGroups.delete, dlq.listMessages, flowControl.pause, flowControl.resume, flowControl.pin, flowControl.unpin, flowControl.resetRate (9 total)
- **Postconditions added:** 10 (8 api-error + 1 cursor-not-checked + 1 supplementary)
- **Functions intentionally omitted this pass:** Client.events (deprecated alias of logs), Messages.delete/deleteMany/deleteAll (deprecated; superseded by cancel), DLQ.deleteMany (deprecated), Chat.create/Chat.prompt (chat() being removed in qstash-js 3.0); Messages.get / Queue.get / Queue.list / Schedules.get / Schedules.list / UrlGroups.get / UrlGroups.list / FlowControlApi.get / FlowControlApi.getGlobalParallelism (low-impact GETs with generic HTTP error surface)
- **Scanner concerns queued:** 10 (`concern-20260624-upstash-qstash-deepen-1` through `concern-20260624-upstash-qstash-deepen-10`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://raw.githubusercontent.com/upstash/qstash-js/main/src/client/url-groups.ts, https://raw.githubusercontent.com/upstash/qstash-js/main/src/client/flow-control.ts, https://raw.githubusercontent.com/upstash/qstash-js/main/src/client/dlq.ts, https://upstash.com/docs/qstash/features/url-groups, https://upstash.com/docs/qstash/features/flow-control, https://upstash.com/docs/qstash/features/dlq (also inspected installed node_modules/@upstash/qstash@2.11.1 source for error path confirmation)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T08:44:12Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @upstash/qstash@2.11.1
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @upstash/qstash@2.11.1
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @upstash/qstash@2.11.1
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @upstash/qstash@2.11.0
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @upstash/qstash@2.11.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** @upstash/qstash@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
