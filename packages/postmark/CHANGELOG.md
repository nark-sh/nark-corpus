# CHANGELOG — postmark

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 82% → 83%

- **Profile:** `packages/postmark/contract.yaml`
- **Functions added:** deleteTemplate (1 total)
- **Postconditions added:** 1 (delete-template-no-try-catch)
- **Functions intentionally omitted this pass:** none (deleteTemplate was a previously-unaccounted gap — not previously in the omitted list)
- **Scanner concerns queued:** 0 — empirical scan of fixtures confirms the existing await-without-try-catch detector fires correctly on the new `delete-template-no-try-catch` postcondition (verified: postmark fixture scan emits `postmark:deleteTemplate:delete-template-no-try-catch` at ground-truth.ts:454)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://postmarkapp.com/developer/api/templates-api (deleteTemplate endpoint contract)
  - https://postmarkapp.com/developer/api/overview (ErrorCode 1130 layout-cascade — "The layout template cannot be deleted because it has dependent templates using it.")
  - postmark@4.0.7 source: dist/client/errors/ErrorHandler.js (404 maps to generic PostmarkError, no specialized class)
  - postmark@4.0.7 source: dist/client/ServerClient.js:154 (deleteTemplate DELETE /templates/{idOrAlias})
- **Key insight:** deleteTemplate has two destructive-by-design failure paths — (a) HTTP 404 template-not-found maps to GENERIC PostmarkError (no 404 entry in buildErrorByHttpStatusCode), so callers that only catch ApiInputError still crash on missing templates; (b) ErrorCode 1130 layout-cascade — layout templates cannot be deleted while standard templates still reference them. Tear-down/migration scripts must order layout deletion AFTER all dependents.
- **Verified by:** bc-deepen-contract (pass 43, deepen-stream-3, 2026-06-24T05:45:42Z)

## 2026-06-18 — re-verified clean

- **Latest published:** postmark@4.0.7
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** postmark@4.0.7
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** postmark@4.0.7
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** postmark@4.0.7
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** postmark@4.0.7
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** postmark@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
