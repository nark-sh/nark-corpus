# CHANGELOG — @notionhq/client

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 1.0 -> 1.0 (effective 0.35 -> 0.47)

- **Profile:** `packages/@notionhq/client/contract.yaml`
- **Functions added:** dataSources.query, dataSources.create, pages.move, blocks.update, comments.update, comments.delete (6 total)
- **Postconditions added:** 15
- **API surface:** 47 async-callable functions (was 46 at last deepen — v5 added data sources, comments CRUD, views, markdown, oauth introspect/revoke)
- **Detection patterns extended:** added `.dataSources.query/create/retrieve/update(` and `.comments.update/delete(` to await_patterns
- **Drift context:** last deepened 2026-04-16 against v1.x; this pass enumerates @notionhq/client@5.22.0 (Notion API version 2025-09-03), the first re-deepen since the data sources API rolled out. 6 high-impact NEW or previously-gap functions contracted; 25 functions intentionally omitted as read-only/admin-only/narrow-adoption.
- **Functions intentionally omitted this pass:** blocks.children.list (read-only), blocks.meetingNotes.query (niche), dataSources.retrieve/update/listTemplates (read/admin), pages.retrieveMarkdown/updateMarkdown/properties.retrieve (narrow adoption), users.* (read-only), customEmojis.list (read-only), comments.list/retrieve (read-only), fileUploads.retrieve/list (read-only), views.* family (admin-only, 8 entries), oauth.introspect/revoke (rare).
- **Scanner concerns queued:** 0 — all 6 new functions are detected by existing scanner rules (verified by passing 43-test ground-truth suite with new SHOULD_FIRE annotations)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://developers.notion.com/reference/errors
  - https://developers.notion.com/reference/query-a-data-source
  - https://developers.notion.com/reference/create-a-data-source
  - https://developers.notion.com/reference/update-a-block
  - https://developers.notion.com/reference/update-a-comment
  - https://developers.notion.com/reference/delete-a-comment
  - SDK source: node_modules/@notionhq/client/build/src/Client.d.ts and api-endpoints/pages.d.ts (for pages.move; Notion docs page 404s for move endpoint, relied on SDK source)
- **Verified by:** bc-deepen-contract (pass 49, 2026-06-24T05:35Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @notionhq/client@5.22.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @notionhq/client@5.22.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @notionhq/client@5.22.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @notionhq/client@5.22.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @notionhq/client@5.22.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @notionhq/client@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
