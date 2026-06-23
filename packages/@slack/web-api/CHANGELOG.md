# CHANGELOG — @slack/web-api

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100%

- **Profile:** `packages/@slack/web-api/contract.yaml`
- **Functions added:** chat.startStream, chat.appendStream, chat.stopStream (3 total)
- **Postconditions added:** 3 (chat-startstream-no-trycatch, chat-appendstream-no-trycatch, chat-stopstream-no-trycatch)
- **Functions intentionally omitted this pass:** chat.meMessage / chat.unfurl / chat.deleteScheduledMessage / chat.scheduledMessages.list (read-only or duplicate error-profile of contracted methods)
- **Scanner concerns queued:** 3 (`concern-20260623-slack-web-api-deepen-1`, `concern-20260623-slack-web-api-deepen-2`, `concern-20260623-slack-web-api-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://docs.slack.dev/reference/methods/chat.startStream ; https://docs.slack.dev/reference/methods/chat.appendStream ; https://docs.slack.dev/reference/methods/chat.stopStream
- **Verified by:** bc-deepen-contract (pass on 2026-06-23T19:30Z, deepen-stream-2 pass=20)
- **Notes:** Re-verified against installed @slack/web-api@7.17.0 dist/methods.d.ts. Found 3 new methods on the `Methods` class that did not exist in the 2026-04-03 deepen pass (which scanned v7.10) — the Slack AI streaming surface (chat.startStream / appendStream / stopStream) shipped in v7.13+. Coverage stays at 1.0 effective on the SaaS-relevant async surface (21/21 contracted; 30 total methods with 13 intentional omissions for read-only / duplicate-profile methods). Existing 30 ground-truth tests + 6 new (NoCatch + WithCatch pairs for each new method) = 36 pass.

## 2026-06-18 — re-verified clean

- **Latest published:** @slack/web-api@7.17.0
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @slack/web-api@7.17.0
- **Profile semver:** >=6.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @slack/web-api@7.17.0
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @slack/web-api@7.17.0
- **Profile semver:** `>=6.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @slack/web-api@7.17.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-03 — backfilled

- **Verified against:** @slack/web-api@>=6.0.0 <8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
