# CHANGELOG — twilio

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 92% → 92% (depth not surface)

- **Profile:** `packages/twilio/contract.yaml`
- **Functions added:** none (already at 11/12 covered)
- **Postconditions added:** 2 on existing `messages.create()`
  - `messages-create-opted-out-not-handled` — catches `error.code === 21610` (recipient replied STOP)
  - `messages-create-geo-permission-not-handled` — catches `error.code === 21408` (country blocked by Geo Permissions)
- **Functions intentionally omitted this pass:** `incomingPhoneNumbers.create()` — provisioning is admin/setup, not runtime SaaS path (unchanged from prior passes)
- **Scanner concerns queued:** 2 (`concern-20260624-twilio-deepen-1`, `concern-20260624-twilio-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://www.twilio.com/docs/api/errors/21610 , https://www.twilio.com/docs/api/errors/21408
- **Verified by:** bc-deepen-contract pass 28 (deepen-stream-3, 2026-06-24T02:11Z)

## 2026-06-18 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:** `>=3.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:** >=3.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:** `>=3.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:** `>=3.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** twilio@6.0.2
- **Profile semver:** `>=3.0.0 <6.0.0` → `>=3.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes in v6 — major bump was solely to signal Node.js 20 minimum requirement; no API, error class, or RestException behavior changes
- **Changelog evidence:** v6.0.0 CHANGES.md: "Bump version to 6.0.0 (major version release). Raise minimum Node.js engine from >=14.0 to >=20.0." — this is the entire documented breaking change
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-15 — backfilled

- **Verified against:** twilio@>=3.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
