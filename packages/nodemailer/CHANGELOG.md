# CHANGELOG — nodemailer

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (v9 surface absorbed)

- **Profile:** `packages/nodemailer/contract.yaml`
- **Semver extended:** `>=7.0.11` → `>=7.0.11 <10.0.0` (covers v7, v8, v9)
- **contract_version:** 1.0.0 → 1.1.0
- **API surface change vs prior pass:** none. Top-level exports unchanged
  (createTransport, createTestAccount, getTestMessageUrl). Mailer instance
  methods unchanged (sendMail, verify, close, isIdle, use).
- **Postconditions tightened:**
  - `tls-ssl-error` (sendMail): documented v9.0.0 BREAKING — TLS validation
    now strict by default for HTTPS attachment fetches, OAuth2 endpoints,
    HTTPS proxy CONNECT. Surface expanded into existing postcondition; no
    new postcondition needed.
  - `message-content-error` (sendMail): noted v9.0.0 EFETCH surface now
    includes attachment-URL TLS failures; v9.0.1 enforces
    disableFileAccess/disableUrlAccess for raw message option.
  - `protocol-error` (sendMail): added `EPROXY` code (HTTPS proxy CONNECT
    failure, also v9.0.0-strict-TLS impacted).
  - `transport-specific-error` (sendMail) — NEW postcondition: covers
    `ESES` (added v8.0.11, 2026-06-10, AWS SES transport errors now
    tagged) and `ESENDMAIL` (local sendmail transport error code).
    Routes ESES retries via err.responseCode (429 retriable, 5xx outage).
- **Functions intentionally omitted this pass:** getTestMessageUrl, close,
  isIdle, use — same as prior pass; verified still sync utility/teardown
  with no async error contracts.
- **Scanner concerns queued:** 0 (no new function detection rules needed —
  postconditions tightened existing covered surface; ESES/ESENDMAIL/EPROXY
  are error-code expansions on already-covered sendMail call site).
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/nodemailer@9.0.1/CHANGELOG.md` (v8.0.4 → v9.0.1 diff)
  - `node_modules/nodemailer@9.0.1/lib/errors.js` (canonical error-code list)
  - `node_modules/nodemailer@9.0.1/lib/nodemailer.js` (createTestAccount source)
  - `node_modules/nodemailer@9.0.1/lib/mailer/index.js` (Mailer class surface)
  - `node_modules/nodemailer@9.0.1/lib/ses-transport/index.js` (ESES tag)
- **Tests:** 8/8 ground-truth tests pass (`src/v2/fixtures/nodemailer.ground-truth.test.ts`)
- **Corpus validate:** 191/191 contracts pass `scripts/validate-contracts.js`
- **Verified by:** bc-deepen-contract pass 19 on 2026-06-23T00:00:00Z (deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** nodemailer@9.0.1
- **Profile semver:** `>=7.0.11` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** nodemailer@9.0.1
- **Profile semver:** >=7.0.11 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** nodemailer@9.0.0
- **Profile semver:** `>=7.0.11` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** nodemailer@9.0.0
- **Profile semver:** `>=7.0.11` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** nodemailer@9.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-03 — backfilled

- **Verified against:** nodemailer@>=7.0.11
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
