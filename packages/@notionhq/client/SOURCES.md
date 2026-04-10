# Sources — @notionhq/client

**Package:** `@notionhq/client`
**Version:** 5.12.0 (as of 2026-03-13)
**Evidence quality:** stub

---

## Primary Sources

### Official Error Reference
**URL:** https://developers.notion.com/reference/errors
**What it documents:** Complete list of Notion API error codes, HTTP status codes, and recommended handling patterns.
**Key claim supported:** All API methods throw `APIResponseError` with one of the defined error codes on failure.

### Official SDK README
**URL:** https://github.com/makenotion/notion-sdk-js
**What it documents:** Error handling examples using `isNotionClientError()`, `APIErrorCode`, and `ClientErrorCode`.
**Key claim supported:** SDK throws on API failures (not swallows). The README includes explicit try-catch examples.

### Error Types Source
**URL:** https://github.com/makenotion/notion-sdk-js/blob/main/src/errors.ts
**What it documents:** Full error hierarchy — `APIResponseError`, `RequestTimeoutError`, `UnknownHTTPResponseError`, `InvalidPathParameterError`, plus `APIErrorCode` and `ClientErrorCode` enums.
**Key claim supported:** Error types and codes used in required_handling sections.

### API Reference — databases.query
**URL:** https://developers.notion.com/reference/post-database-query
**What it documents:** Parameters, response structure, and error conditions for database queries.

### API Reference — pages.create
**URL:** https://developers.notion.com/reference/post-page
**What it documents:** Parameters, response, and error conditions for page creation.

### API Reference — pages.update
**URL:** https://developers.notion.com/reference/patch-page
**What it documents:** Parameters, response, and error conditions for page updates.

### API Reference — blocks.children.append
**URL:** https://developers.notion.com/reference/patch-block-children
**What it documents:** Parameters, response, and error conditions for appending block children.

### API Reference — search
**URL:** https://developers.notion.com/reference/post-search
**What it documents:** Parameters, response, and error conditions for search.

---

## Retry Behavior Source (CLAUDE.md in SDK)
**URL:** https://github.com/makenotion/notion-sdk-js/blob/main/CLAUDE.md
**What it documents:** Retry logic — `rate_limited` (429) retried for all methods; `internal_server_error` (500) and `service_unavailable` (503) retried for idempotent methods (GET, DELETE) only. POST/PATCH (create/update/append) are NOT auto-retried on 500/503.

---

## Real-World Evidence

No high-star repos with confirmed TPs found in initial search. Evidence quality: stub.

Planned for upgrade: search for production SaaS apps using `@notionhq/client` in their `package.json` dependencies and scan for unguarded API calls.

---

## Evidence Quality Upgrade Path

To upgrade from `stub` to `partial`:
1. Find a TypeScript repo with 100+ stars that uses `@notionhq/client`
2. Scan with verify-cli
3. Confirm at least one TRUE_POSITIVE (real database.query / pages.create without try-catch)
4. Add the repo URL here under "Real-World Evidence"
5. Update `evidence_quality` in contract.yaml to `partial`

To upgrade to `confirmed`:
1. Confirm TP in a repo with >1k GitHub stars
2. Update `evidence_quality` to `confirmed`
