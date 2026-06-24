# CHANGELOG — busboy

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 90% → 91%

- **Profile:** `packages/busboy/contract.yaml`
- **Functions added:** Busboy factory — no new top-level function (single export); refined existing entry with one new postcondition
- **Postconditions added:** 1 (`busboy-010` — mid-stream `Malformed part header` runtime emit, distinct from busboy-001 generic error-listener and busboy-008 synchronous constructor throw)
- **Functions intentionally omitted this pass:** Malformed urlencoded form (carried forward — internal stream mechanism subsumed by busboy-001 generic error listener; no real-world client triggers)
- **Scanner concerns queued:** 1 (`concern-20260624-busboy-deepen-1`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** lib/types/multipart.js@1.6.0 line 398 confirms `this.emit('error', new Error('Malformed part header'))` from the header sub-parser; https://github.com/mscdex/busboy/blob/master/lib/types/multipart.js ; https://github.com/mscdex/busboy/issues/171
- **Verified by:** bc-deepen-contract (drift-by-staleness pass 43 on 2026-06-24T04:23:53Z, deepen-stream-2)


## 2026-06-18 — re-verified clean

- **Latest published:** busboy@1.6.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** busboy@1.6.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** busboy@1.6.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** busboy@1.6.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** busboy@1.6.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** busboy@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
