# CHANGELOG — mailgun.js

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 94.1% → 100%

- **Profile:** `packages/mailgun.js/contract.yaml`
- **Functions added:** lists.members.upload (1 total)
- **Postconditions added:** 2 (members-upload-no-try-catch, members-upload-payload-too-large)
- **Functions intentionally omitted this pass:** lists.listByAddress (read-only GET), lists.members.listMembersByAddress (read-only GET), routes.matchAddress (read-only lookup, v12.9.0), customMessageLimit.{get,set,destroy,enable} (admin throttle config, v13.1.0), accountManagement.* 8 methods (admin/sandbox/webhook-signing-key config, v13.2.0)
- **Scanner concerns queued:** 2 (`concern-20260624-mailgun.js-deepen-1`, `concern-20260624-mailgun.js-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/mailgun/mailgun.js/blob/main/CHANGELOG.md, https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/mailing-lists/post-lists-list_address-members.csv, package tarball v13.2.0 Types/Interfaces/MailingLists/MailingListMembers.d.ts
- **Verified by:** bc-deepen-contract deepen-stream-3 pass 50 (drift-by-staleness re-verification, last deepened 2026-04-16 at v12.8.0; current v13.2.0 released 2026-06-01)

## 2026-06-18 — re-verified clean

- **Latest published:** mailgun.js@13.2.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** mailgun.js@13.2.0
- **Profile semver:** >=3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** mailgun.js@13.2.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** mailgun.js@13.2.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** mailgun.js@13.2.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** mailgun.js@>=3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
