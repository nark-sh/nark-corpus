# CHANGELOG — firebase-admin

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass 42 — coverage 100% → 60%

- **Profile:** `packages/firebase-admin/contract.yaml`
- **Functions added:** DataConnect.executeGraphql, PhoneNumberVerification.verifyToken (2 total)
- **Postconditions added:** 7 (4 on executeGraphql, 3 on verifyToken)
- **Functions intentionally omitted this pass:** DataConnect.executeGraphqlRead / executeQuery / executeMutation / insert / insertMany / upsert / upsertMany (all share the executeGraphql error profile and are covered by the same await_patterns)
- **Scanner concerns queued:** 2 (`concern-20260624-firebase-admin-deepen-1`, `concern-20260624-firebase-admin-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `lib/data-connect/data-connect-api-client-internal.js` (firebase-admin@14.0.0 node_modules)
  - `lib/data-connect/error.d.ts` (firebase-admin@14.0.0 node_modules)
  - `lib/phone-number-verification/token-verifier.js` (firebase-admin@14.0.0 node_modules)
  - `lib/phone-number-verification/error.d.ts` (firebase-admin@14.0.0 node_modules)
  - https://firebase.google.com/docs/data-connect/error-codes
- **Coverage math correction:** Previous index claimed coverage 1.0 against a stale 68-function total. v14.0.0 added DataConnect (8 distinct callable surface items: 1 contracted, 7 omitted-as-variants) and PhoneNumberVerification (1 method, contracted). True post-pass surface: 46 contracted / 31 omitted / 77 total = 0.60.
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 42 on 2026-06-24T05:27:41+00:00)

## 2026-06-18 — re-verified clean

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:** `>=11.0.0 <15.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:** >=11.0.0 <15.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:** `>=11.0.0 <15.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:** `>=11.0.0 <15.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** firebase-admin@14.0.0
- **Profile semver:** `>=11.0.0 <14.0.0` → `>=11.0.0 <15.0.0`
- **Verdict:** no error-handling-relevant behavioral changes between v13 and v14 — extended range
- **Changelog evidence:** PR #3140 "Error Handling Revamp" investigated directly. Changes are: (1) new `cause` and `httpResponse` fields added to FirebaseError/ErrorInfo interfaces, (2) better exports of error classes, (3) refactored internals, (4) removed deprecated Instance ID service. Critical finding: functions still throw the same `FirebaseAuthError`, `FirebaseMessagingError`, etc. with the same error codes. Existing catch blocks checking `error.code` still work. The `cause`/`httpResponse` additions are additive non-breaking.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-13 — backfilled

- **Verified against:** firebase-admin@>=11.0.0 <14.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
