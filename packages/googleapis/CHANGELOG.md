# CHANGELOG — googleapis

## 2026-06-25 — deepen pass — coverage 79% → 89%

- **Profile:** `packages/googleapis/contract.yaml`
- **Functions added:** messages.watch, files.delete, files.export, events.delete, values.append (5 total)
- **Postconditions added:** 7 (gmail-watch-pubsub-permission-missing, gmail-watch-expiry-not-renewed, drive-files-delete-no-try-catch, drive-files-delete-folder-cascade, drive-files-export-no-try-catch, calendar-events-delete-no-try-catch, sheets-values-append-no-try-catch)
- **Functions intentionally omitted this pass:** none new — 3 omitted groups carry forward from prior passes (admin.users.list Workspace admin ops; specialized infra APIs BigQuery/Pub-Sub/Analytics; narrow-adoption YouTube playlist features)
- **Scanner concerns queued:** 5 (`concern-20260625-googleapis-deepen-1` through `concern-20260625-googleapis-deepen-5`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://developers.google.com/gmail/api/guides/push, https://developers.google.com/drive/api/guides/handle-errors, https://developers.google.com/drive/api/reference/rest/v3/files/delete, https://developers.google.com/drive/api/reference/rest/v3/files/export, https://developers.google.com/calendar/api/guides/errors, https://developers.google.com/sheets/api/limits
- **Verified by:** bc-deepen-contract (pass on 2026-06-25T05:05:21Z, deepen-stream-2 pass=2)

## 2026-06-25 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:** >=39.1.0 <200.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 77% → 79%

- **Profile:** `packages/googleapis/contract.yaml`
- **Functions added:** drive.permissions.create (1 total)
- **Postconditions added:** 3 (drive-permissions-create-sharing-rate-limit, drive-permissions-create-insufficient-permissions, drive-permissions-create-invalid-sharing-request)
- **Functions intentionally omitted this pass:** none new — 3 omitted groups carry forward from 2026-04-16 (admin.users.list Workspace admin ops; specialized infra APIs BigQuery/Pub-Sub/Analytics; narrow-adoption YouTube playlist features)
- **Scanner concerns queued:** 3 (`concern-20260624-googleapis-deepen-1`, `concern-20260624-googleapis-deepen-2`, `concern-20260624-googleapis-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://developers.google.com/drive/api/guides/handle-errors, https://developers.google.com/drive/api/reference/rest/v3/permissions/create
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T03:43:12Z, deepen-stream-2 pass=40)

## 2026-06-18 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:** `>=39.1.0 <200.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:** >=39.1.0 <200.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:** `>=39.1.0 <200.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:** `>=39.1.0 <200.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** googleapis@173.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** googleapis@>=39.1.0 <200.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
