# Sources — algoliasearch

## Official Documentation

- **Error Handling Guide**: https://www.algolia.com/doc/api-client/advanced/handling-errors/
  — Official guide on ApiError, RetryError, error status codes, and recommended handling patterns

- **API Client v5 Getting Started**: https://www.algolia.com/doc/api-client/getting-started/install/javascript/
  — Installation, basic usage, and v5 API overview

- **API Client v4 Reference — Search**: https://www.algolia.com/doc/api-client/methods/search/
  — v4 index.search() method documentation including error behavior

- **API Client v4 Reference — Indexing**: https://www.algolia.com/doc/api-client/methods/indexing/
  — v4 saveObject, saveObjects, deleteObject, deleteObjects documentation

- **v4 to v5 Migration Guide**: https://www.algolia.com/doc/api-client/getting-started/upgrade-guides/javascript/
  — Documents breaking changes including index-based → client-based API and error class changes

## npm Package

- **algoliasearch on npm**: https://www.npmjs.com/package/algoliasearch
  — Version history, weekly downloads, README

## GitHub Source

- **algoliasearch-client-javascript (monorepo)**: https://github.com/algolia/algoliasearch-client-javascript
  — Source code for both v4 and v5 clients

- **Error Classes (v5)**: https://github.com/algolia/algoliasearch-client-javascript/tree/main/packages/client-common/src/errors
  — ApiError, DetailedApiError, RetryError, DeserializationError class definitions

## Error Status Code Reference

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ApiError | Malformed request / invalid parameters |
| 401 | ApiError | Invalid API key |
| 403 | ApiError | API key lacks required ACL permissions |
| 404 | ApiError | Index or object not found |
| 422 | ApiError | Invalid settings / unprocessable entity |
| 429 | ApiError | Rate limit exceeded |
| RetryError | — | All Algolia hosts unreachable (network down or wrong appId) |

## Version History

- **v5.x** (2024+): Rewritten client. Named export `{ algoliasearch }`. No `initIndex()`. All methods on client directly. Error classes use `instanceof`.
- **v4.x** (2019-2024): Classic client. Default export. `client.initIndex()`. Error objects (not class instances), check `err.name`.
- **v3.x and below**: Deprecated. Do not use.

## Real-World Usage Patterns

Algolia is primarily used for:
1. **Documentation search** — via `react-instantsearch` / `@docsearch/react` (search-only, client-side)
2. **Product/content search** — SaaS apps index products, blog posts, help articles
3. **Server-side indexing** — webhooks, background jobs, API routes that keep Algolia in sync with database
