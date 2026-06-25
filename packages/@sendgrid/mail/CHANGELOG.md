# CHANGELOG — @sendgrid/mail

## 2026-06-25 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** >=7.0.0 <9.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — drift-mode deepen (+3 postconditions)

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged — 8.1.6 still in range)
- **Verdict:** existing 3-function coverage intact; added 3 new postconditions to deepen postcondition density on `send` and `sendMultiple`
- **New postconditions:**
  - `send.send-array-batch-no-partial-failure-handling` (warning, SILENT_FAILURE/lost_transaction) — `Promise.all` fails-fast on array input (mail-service.js:165); bulk-notification senders lose per-item visibility
  - `send.send-validation-error-no-response-shape` (warning, SILENT_FAILURE/service_unavailable) — Mail.create / filterSecrets sync throws (24+ sites in @sendgrid/helpers) become Promise.reject with bare Error (no `error.response`); standard catch pattern null-derefs
  - `sendMultiple.send-multiple-callback-with-unhandled-promise` (warning, DOWNTIME/service_unavailable) — callback signature AND promise rejection fire on error; legacy callback users still trip UnhandledPromiseRejection
- **Coverage score:** 3/3 = 1.0 (unchanged; postcondition density deepened, function count unchanged)
- **Fixtures:** no new fixtures this pass; existing 9 scanner violations still fire (no regressions verified via local scan)
- **Scanner concerns queued:** 0 — new postconditions are detector-level guidance for future fixture/rule work, not blocking scanner code changes
- **Pass:** 12
- **Stream:** deepen-stream-3
- **Source verification:**
  - https://github.com/sendgrid/sendgrid-nodejs/blob/main/packages/mail/src/classes/mail-service.js
  - https://github.com/sendgrid/sendgrid-nodejs/blob/main/packages/helpers/classes/mail.js
  - https://nodejs.org/api/process.html#event-unhandledrejection

## 2026-06-18 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** >=7.0.0 <9.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:** `>=7.0.0 <9.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @sendgrid/mail@8.1.6
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-02 — backfilled

- **Verified against:** @sendgrid/mail@>=7.0.0 <9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
