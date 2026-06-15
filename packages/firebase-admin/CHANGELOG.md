# CHANGELOG — firebase-admin

All notable verification, deepen, and fork events for this profile. Newest first.


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
