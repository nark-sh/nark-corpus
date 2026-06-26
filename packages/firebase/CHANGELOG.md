# CHANGELOG — firebase

## 2026-06-26 — deepen pass — coverage 83% -> 100%

- **Profile:** `packages/firebase/contract.yaml`
- **Functions added:** sendSignInLinkToEmail, verifyPasswordResetCode, checkActionCode, unlink, reload, signInWithCredential, updateMetadata (7 total)
- **Postconditions added:** 7 (send-sign-in-link-argument-error, verify-password-reset-code-error, check-action-code-error, unlink-no-such-provider, reload-token-or-network-error, sign-in-with-credential-error, update-metadata-error)
- **Coverage:** 35/42 (0.83) -> 42/42 (1.0) — all considered async functions now contracted
- **Functions intentionally omitted (unchanged):** SMS-flow functions (signInWithPhoneNumber/linkWithPhoneNumber/updatePhoneNumber — phone-number niche), getDocFromServer/getDocsFromServer (duplicate error contract with getDoc/getDocs), fetchSignInMethodsForEmail (deprecated in newer Firebase), validatePassword (optional policy enforcement)
- **Scanner concerns queued:** 7 (concern-20260626-firebase-deepen-1 through 7) — all 7 new postconditions require new scanner detection rules; none use the existing bare-await detection rule
- **Sources fetched:**
  - `@firebase/auth/dist/auth-public.d.ts` (signatures: sendSignInLinkToEmail, verifyPasswordResetCode, checkActionCode, unlink, reload, signInWithCredential)
  - `nark-dev/tmp/firebase/node_modules/@firebase/auth/dist/node/totp-9e84e53d.js` (AuthErrorCodes enum: argument-error, expired-action-code, invalid-action-code, no-such-provider, requires-recent-login, user-token-expired, user-mismatch, invalid-credential, unauthorized-domain)
  - `@firebase/storage/dist/storage-public.d.ts` (signature: updateMetadata)
  - `@firebase/storage/dist/index.cjs.js` (StorageErrorCode enum: OBJECT_NOT_FOUND, UNAUTHORIZED, RETRY_LIMIT_EXCEEDED, UNAUTHENTICATED)
- **Fixtures added:** ground-truth.ts entries #36-42 (14 functions: 7 SHOULD_FIRE + 7 SHOULD_NOT_FIRE)
- **Deepen stream:** deepen-stream-1, pass 1 (2026-06-26)

## 2026-06-25 — re-verified clean

- **Latest published:** firebase@12.15.0
- **Profile semver:** >=9.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 81% -> 83%

- **Profile:** `packages/firebase/contract.yaml`
- **Functions added:** applyActionCode, getRedirectResult, signInWithCustomToken, uploadString, getMetadata (5 total)
- **Postconditions added:** 5 (apply-action-code-error, redirect-result-error, custom-token-error, upload-string-error, get-metadata-error)
- **Functions intentionally omitted this pass:** unchanged from prior pass — SMS-flow functions (phone-number niche), getDocFromServer/getDocsFromServer (duplicate error contract), fetchSignInMethodsForEmail (deprecated), validatePassword (optional policy enforcement)
- **Scanner concerns queued:** 0 — all 5 new postconditions use the existing "bare-await on firebase auth/storage import without try-catch" detection rule; scanner verified 5/5 SHOULD_FIRE fixtures fire, 5/5 SHOULD_NOT_FIRE try-catch wrappers do not fire
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `@firebase/auth/dist/auth-public.d.ts` (signatures: applyActionCode, getRedirectResult, signInWithCustomToken — installed firebase@12.15.0)
  - `@firebase/auth/dist/index.webworker.js` (AuthErrorCode enum: EXPIRED_OOB_CODE, INVALID_OOB_CODE, ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL, CREDENTIAL_ALREADY_IN_USE, INVALID_CUSTOM_TOKEN, CREDENTIAL_MISMATCH, USER_DISABLED)
  - `@firebase/storage/dist/storage-public.d.ts` (signatures: uploadString, getMetadata)
  - `@firebase/storage/dist/index.cjs.js` (StorageErrorCode enum: OBJECT_NOT_FOUND, UNAUTHORIZED, QUOTA_EXCEEDED, RETRY_LIMIT_EXCEEDED, UNAUTHORIZED_APP, INVALID_URL)
  - https://firebase.google.com/docs/reference/js/auth.md#applyactioncode
  - https://firebase.google.com/docs/reference/js/auth.md#getredirectresult
  - https://firebase.google.com/docs/reference/js/auth.md#signinwithcustomtoken
  - https://firebase.google.com/docs/reference/js/storage.md#uploadstring
  - https://firebase.google.com/docs/reference/js/storage.md#getmetadata
  - https://firebase.google.com/docs/storage/web/handle-errors
- **Verified by:** bc-deepen-contract (pass 54 on 2026-06-24T08:04:30Z, deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** firebase@12.15.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** firebase@12.15.0
- **Profile semver:** >=9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** firebase@12.14.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** firebase@12.14.0
- **Profile semver:** `>=9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** firebase@12.14.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** firebase@>=9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
