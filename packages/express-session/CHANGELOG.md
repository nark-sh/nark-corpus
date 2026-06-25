# CHANGELOG — express-session

## 2026-06-25 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:** >=1.17.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 100%

- **Profile:** `packages/express-session/contract.yaml`
- **Functions added:** `req.sessionStore.all`, `req.sessionStore.clear` (2 total)
- **Postconditions added:** 4 (all-callback-error-unchecked, all-method-not-implemented, clear-callback-error-unchecked, clear-method-not-implemented)
- **Functions intentionally omitted this pass:** none — both newly added functions close the remaining 5/7 → 7/7 gap. `req.session.touch()` and `req.session.resetMaxAge()` are sync and were already classified out of scope (no callback, no async surface).
- **Scanner concerns queued:** 2 (`concern-20260624-express-session-deepen-1`, `concern-20260624-express-session-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/expressjs/session/master/README.md (§Session Store Implementation §store.all §store.clear)
  - DefinitelyTyped @types/express-session/index.d.ts (Store abstract class — all, clear marked Optional)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 44 on 2026-06-24T05:58Z)

## 2026-06-18 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:** `>=1.17.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:** >=1.17.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:** `>=1.17.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:** `>=1.17.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** express-session@1.19.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** express-session@>=1.17.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
