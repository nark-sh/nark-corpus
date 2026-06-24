# CHANGELOG — superagent

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verified clean

- **Latest published:** superagent@10.3.0 (stable since 2023; no API surface changes since last deepen pass on 2026-04-16)
- **Profile semver:** `>=3.7.0` (unchanged)
- **Effective coverage:** 9/9 non-omitted = 100% (unchanged)
- **API surface re-enumerated from:** `@types/superagent@10.x` (`lib/node/index.d.ts`, `agent.d.ts`, `request-base.d.ts`)
- **Async surface confirmed:** 9 contracted (get/post/put/patch/delete/del/head/pipe/agent) + 2 intentionally omitted (callable-as-function, end() callback) + 28 WebDAV/extended HTTP verb aliases (acl/bind/checkout/connect/copy/link/lock/merge/mkactivity/mkcalendar/mkcol/move/notify/options/propfind/proppatch/purge/rebind/report/search/source/subscribe/trace/unbind/unlink/unlock/unsubscribe/m-search) — all share identical error profile with already-contracted methods, no postcondition divergence
- **Scanner re-test:** 45 violations across fixtures (44 errors, 1 warning) — detection holds for all postconditions
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 58)
- **Verdict:** no functions added, no postconditions added; profile remains complete


## 2026-06-18 — re-verified clean

- **Latest published:** superagent@10.3.0
- **Profile semver:** `>=3.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** superagent@10.3.0
- **Profile semver:** >=3.7.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** superagent@10.3.0
- **Profile semver:** `>=3.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** superagent@10.3.0
- **Profile semver:** `>=3.7.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** superagent@10.3.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** superagent@>=3.7.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
