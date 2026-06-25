# CHANGELOG — discord.js

## 2026-06-25 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:** >=14.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 89% → 90%

- **Profile:** `packages/discord.js/contract.yaml`
- **Functions added:** MessageManager.delete, MessageManager.fetch, GuildMemberManager.fetch, GuildMemberManager.bulkBan, GuildBanManager.create, EntitlementManager.consume, AutocompleteInteraction.respond, ModalSubmitInteraction.reply (8 total)
- **Postconditions added:** 9 (8 single + 1 partial-failure variant on bulkBan)
- **Functions intentionally omitted this pass:** AutoModerationRule.* (admin moderation config — covered in earlier pass omission_reason), Guild.set* (admin configuration setters — covered in earlier pass), ClientUser.set* (bot self-config — out of SaaS runtime scope), ApplicationCommand.* (admin command lifecycle — admin-time, not runtime), Subscription* (subscription read paths — pure GETs no domain error contract beyond generic DiscordAPIError)
- **Scanner concerns queued:** 0 (NOTE: nark/src/upgrade-concerns.json had a pre-existing unresolved merge conflict at the time of this pass — concerns will be queued in a follow-up once the conflict is resolved; 8 of 9 new postconditions need scanner detection rules: MessageManager.{delete,fetch}, GuildMemberManager.{fetch,bulkBan,bulkBan-partial-failure}, GuildBanManager.create, EntitlementManager.consume, AutocompleteInteraction.respond, ModalSubmitInteraction.reply)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/discord.js@14.26.4/typings/index.d.ts (lines 1355-1372, 2959-2998, 5051-5093, 5208-5230, 4911-4918), src/managers/MessageManager.js (lines 240-335), src/managers/GuildMemberManager.js (lines 480-600), src/managers/GuildBanManager.js (lines 175-246), src/managers/EntitlementManager.js (lines 155-172), https://discord.js.org/docs/packages/discord.js/main/MessageManager:Class, https://discord.com/developers/docs/resources/channel#delete-message, https://discord.com/developers/docs/resources/guild#bulk-guild-ban, https://discord.com/developers/docs/monetization/entitlements#consume-an-entitlement, https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
- **Verified by:** bc-deepen-contract (pass 35 on 2026-06-24T02:30Z, deepen-stream-2, drift-by-staleness mode against 2026-04-15 last_deepened)


## 2026-06-18 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:** `>=14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:** >=14.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:** `>=14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:** `>=14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** discord.js@14.26.4
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** discord.js@>=14.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
