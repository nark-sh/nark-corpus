# CHANGELOG — firebase-admin

## 2026-06-26 — deepen pass 6 (deepen-stream-1 pass 4) — coverage 67% → 74%

- **Profile:** `packages/firebase-admin/contract.yaml`
- **Functions added:** AppCheck.createToken, AppCheck.verifyToken, deleteUsers, generateEmailVerificationLink, sendEachForMulticast, unsubscribeFromTopic (6 total)
- **Postconditions added:** 14 (3 for createToken, 3 for verifyToken, 2 for deleteUsers, 2 for generateEmailVerificationLink, 2 for sendEachForMulticast, 2 for unsubscribeFromTopic)
- **Functions intentionally omitted this pass:** getUserByPhoneNumber/getUserByProviderUid (same profile as getUserByEmail), getUsers (batch lookup, no distinct errors), listUsers (read-only pagination), sendMulticast (deprecated alias)
- **Scanner concerns queued:** 4 (`concern-20260626-firebase-admin-deepen-appcheck-createtoken`, `-appcheck-verifytoken`, `-deleteusers`, `-generateemailverificationlink`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/app-check/app-check-api-client-internal.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/app-check/token-verifier.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/app-check/error.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/auth/base-auth.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/auth/auth-api-request.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/messaging/messaging.ts`
  - firebase-admin@14.1.0 node_modules (app-check.js, token-verifier.js, base-auth.js, messaging.js)
- **Coverage math:** 67 contracted / 23 omitted / 90 total = 0.7444 (67% → 74%). +6 contracted this pass.
- **Verified by:** bc-deepen-contract (deepen-stream-1 pass 4 on 2026-06-26)

## 2026-06-26 — deepen pass 5 (deepen-stream-2 pass 1) — coverage 60% → 67%

- **Profile:** `packages/firebase-admin/contract.yaml`
- **Functions added:** SecurityRules.releaseFirestoreRulesetFromSource, SecurityRules.releaseStorageRulesetFromSource, SecurityRules.createRuleset, SecurityRules.deleteRuleset, MachineLearning.updateModel, Installations.deleteInstallation (6 total)
- **Postconditions added:** 16 (3 for releaseFirestoreRulesetFromSource, 3 for releaseStorageRulesetFromSource, 2 for createRuleset, 2 for deleteRuleset, 3 for updateModel, 2 for deleteInstallation)
- **Functions intentionally omitted this pass:** MachineLearning.waitForUnlocked (resolves silently on timeout), MachineLearning.unpublishModel (inverse of publishModel -- same error profile), SecurityRules.getRuleset/getFirestoreRuleset/getStorageRuleset/listRulesetMetadata (read-only GETs), SecurityRules.releaseFirestoreRuleset/releaseStorageRuleset (apply existing ruleset -- no distinct errors), RemoteConfig.getTemplateAtVersion/listVersions (read-only), RemoteConfig.load() (ServerTemplate preview), Extensions.setProcessingState/setFatalError (extension lifecycle)
- **Scanner concerns queued:** 6 (`concern-20260626-firebase-admin-security-rules-release-1`, `-release-2`, `-create`, `-delete`, `-ml-update-model`, `-installations-delete`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/security-rules/security-rules.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/security-rules/security-rules-api-client-internal.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/security-rules/error.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/machine-learning/error.ts`
  - `https://github.com/firebase/firebase-admin-node/blob/master/src/installations/installations-request-handler.ts`
  - firebase-admin@14.1.0 type declarations (security-rules.d.ts, machine-learning.d.ts, installations.d.ts)
- **Coverage math:** 60 contracted / 90 total = 0.67 (60% → 67%). +6 contracted, -6 from "unaccounted" bucket.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 1 on 2026-06-26)

## 2026-06-25 — deepen pass 3 (deepen-stream-2) — coverage 60% → 60% (expanded surface)

- **Profile:** `packages/firebase-admin/contract.yaml`
- **Functions added:** TaskQueue.enqueue, TaskQueue.delete, Channel.publish (Eventarc), RemoteConfig.rollback, RemoteConfig.getServerTemplate, MachineLearning.createModel, MachineLearning.publishModel, MachineLearning.deleteModel (8 total)
- **Postconditions added:** 16
- **Functions intentionally omitted this pass:** listVersions / getTemplateAtVersion (read-only Remote Config); MachineLearning.getModel (read-only) / updateModel (shares createModel error profile) / unpublishModel (inverse of publishModel); setProcessingState / setFatalError (Extensions lifecycle, low SaaS blast-radius); Security Rules release helpers (releaseFirestoreRuleset* etc. — admin-only); Installations.deleteInstallation (admin op)
- **Scanner concerns queued:** 4 (`concern-20260625-firebase-admin-deepen-1` through `-deepen-4`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `lib/functions/error.d.ts`, `lib/functions/functions.d.ts` (firebase-admin@14.0.0 node_modules)
  - `lib/eventarc/error.d.ts`, `lib/eventarc/eventarc.d.ts` (firebase-admin@14.0.0 node_modules)
  - `lib/remote-config/error.d.ts`, `lib/remote-config/remote-config.d.ts` (firebase-admin@14.0.0 node_modules)
  - `lib/machine-learning/error.d.ts`, `lib/machine-learning/machine-learning.d.ts` (firebase-admin@14.0.0 node_modules)
  - https://firebase.google.com/docs/functions/task-functions
  - https://firebase.google.com/docs/remote-config/automate-rc
  - https://firebase.google.com/docs/ml/manage-models-admin
- **Coverage math:** API surface re-enumerated from 77 to 90 (added Cloud Functions/TaskQueue, Eventarc/Channel, additional Remote Config, Machine Learning). 54 contracted / 36 omitted / 90 total = 0.60 raw (same ratio as 46/77 pass 42 — surface growth was proportional to coverage growth).
- **Verified by:** bc-deepen-contract (deepen-stream-2, pass 3 on 2026-06-25T17:03:30+00:00)

## 2026-06-25 — re-verified clean

- **Latest published:** firebase-admin@14.1.0
- **Profile semver:** >=11.0.0 <15.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


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
