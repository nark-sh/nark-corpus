# CHANGELOG — @aws-sdk/client-ses

## 2026-06-25 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1075.0
- **Profile semver:** ^3.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 77% -> 82%

- **Profile:** `packages/@aws-sdk/client-ses/contract.yaml`
- **Functions added:** CloneReceiptRuleSetCommand, CreateReceiptFilterCommand, UpdateReceiptRuleCommand (3 total)
- **Postconditions added:** 6 (2 per function)
  - `ses-clone-receipt-rule-set-already-exists` (error, DOWNTIME)
  - `ses-clone-receipt-rule-set-source-not-found` (error, DOWNTIME)
  - `ses-create-receipt-filter-already-exists` (error, SECURITY_RISK — silent security hazard)
  - `ses-create-receipt-filter-limit-exceeded` (error, SECURITY_RISK)
  - `ses-update-receipt-rule-invalid-action-config` (error, DATA_LOSS — silent mail loss)
  - `ses-update-receipt-rule-not-found` (error, DATA_LOSS)
- **Functions intentionally omitted this pass:** 36 commands that throw only generic `SESServiceException` (covered by existing `sesClient.send` postcondition), all `Describe*`/`Get*`/`List*` read-only commands, and identity-toggle commands (`SetIdentityDkimEnabled`, `UpdateAccountSendingEnabled`, `DeleteIdentity`, etc.)
- **Scanner concerns queued:** 3 (`concern-20260624-aws-sdk-client-ses-deepen-1`, `-2`, `-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ses/command/CloneReceiptRuleSetCommand/
  - https://docs.aws.amazon.com/ses/latest/APIReference/API_CloneReceiptRuleSet.html
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ses/command/CreateReceiptFilterCommand/
  - https://docs.aws.amazon.com/ses/latest/APIReference/API_CreateReceiptFilter.html
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ses/command/UpdateReceiptRuleCommand/
  - https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateReceiptRule.html
  - https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-permissions.html
- **Drift mode:** STALENESS — profile's prior `last_deepened` was 2026-04-16 (oldest public-tier entry in deepen-index.json). Re-enumerated dist-types/commands/*.d.ts at @aws-sdk/client-ses@3.1075.0. Of 47 uncovered commands, picked the 3 highest-impact mutation commands with distinct typed throws.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24, deepen-stream-3 pass 32)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1072.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1070.0
- **Profile semver:** ^3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1069.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1069.0
- **Profile semver:** `^3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-ses@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-ses@^3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
