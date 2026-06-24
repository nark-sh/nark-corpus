# CHANGELOG — @aws-sdk/client-sesv2

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 82% to 85%

- **Profile:** `packages/@aws-sdk/client-sesv2/contract.yaml`
- **Functions added:** UpdateContactCommand, CreateExportJobCommand (2 total)
- **Postconditions added:** 3 (sesv2-update-contact-no-try-catch, sesv2-export-job-result-not-polled, sesv2-export-job-no-try-catch)
- **Functions intentionally omitted this pass:** none new (existing omissions retained: TestRenderEmailTemplateCommand, CreateConfigurationSetCommand)
- **Scanner concerns queued:** 3 (`concern-20260624-aws-sdk-client-sesv2-deepen-1`, `concern-20260624-aws-sdk-client-sesv2-deepen-2`, `concern-20260624-aws-sdk-client-sesv2-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** dist-types/commands/UpdateContactCommand.d.ts (@throws annotations), dist-types/commands/CreateExportJobCommand.d.ts (@throws annotations), AWS SES V2 API Reference (UpdateContact, CreateExportJob)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 35 on 2026-06-24T03:46Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-sesv2@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-sesv2@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-sesv2@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-sesv2@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-sesv2@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-sesv2@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
