# CHANGELOG — passport

## 2026-06-25 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:** >=0.7.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 91% (re-verification, no postconditions added)

- **Profile:** `packages/passport/contract.yaml`
- **Functions added:** none (re-verification pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** isAuthenticated, isUnauthenticated (sync predicates), unuse (no error contract), framework (internal config), sessionManager (sync setter), init (boot-time helper)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://www.passportjs.org/docs/, node_modules/passport@0.7.0 source (authenticator.js, http/request.js, sessionmanager.js)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24, deepen-stream-3, pass 40)
- **Notes:** Drift-by-staleness re-verification of 2-month-old profile against passport@0.7.0 (still latest published — no version drift). Re-walked Authenticator + req prototype surface (12 + 4 callable surfaces), confirmed the 10 contracted functions match current source-thrown errors and all 6 uncovered surfaces remain genuinely no-error-contract (sync predicates, pure setters, internal helpers). Fixture annotation IDs cross-checked against contract postcondition IDs: zero orphans. No new postconditions warranted.

## 2026-06-18 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:** `>=0.7.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:** >=0.7.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:** `>=0.7.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:** `>=0.7.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** passport@0.7.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** passport@>=0.7.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
