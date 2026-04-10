# @pinecone-database/pinecone — Contract Sources

## Official Documentation

- **Node.js SDK Overview**: https://docs.pinecone.io/reference/node-sdk
  - Top-level entry point for the TypeScript/JavaScript SDK documentation.

- **Upsert Vectors**: https://docs.pinecone.io/reference/api/data-plane/upsert
  - Confirms `index.upsert()` makes HTTPS POST to `/vectors/upsert`. Returns void.
  - Errors: 401 (bad API key), 400 (bad request), 429 (rate limit), 5xx (server error).

- **Query Vectors**: https://docs.pinecone.io/reference/api/data-plane/query
  - Confirms `index.query()` makes HTTPS POST to `/query`. Returns `QueryResponse`.
  - Errors: 401, 400 (dimension mismatch, bad namespace), 429, 5xx.

- **Fetch Vectors**: https://docs.pinecone.io/reference/api/data-plane/fetch
  - Confirms `index.fetch()` makes HTTPS GET to `/vectors/fetch`. Returns `FetchResponse`.

- **Delete Vectors**: https://docs.pinecone.io/reference/api/data-plane/deletevectors
  - Covers `deleteOne()` (single ID) and `deleteMany()` (ID array or metadata filter).

- **List Indexes**: https://docs.pinecone.io/reference/api/control-plane/list_indexes
  - Confirms `pinecone.listIndexes()` makes HTTPS GET to `/databases`. Returns index list.

- **Quickstart Guide**: https://docs.pinecone.io/guides/getting-started/quickstart
  - Official quickstart — notably OMITS try-catch in upsert/query examples. This is the
    source of the antipattern in production code.

- **Error Reference**: https://docs.pinecone.io/troubleshooting/error-reference
  - Error types: `PineconeApiError` (non-2xx HTTP), `PineconeConnectionError` (network),
    `PineconeConfigurationError` (SDK misconfiguration).

## GitHub Repository

- **pinecone-ts-client**: https://github.com/pinecone-io/pinecone-ts-client
  - SDK source. Error classes defined in `src/errors/`.
  - Index class implementation in `src/data/index.ts`.

## Real-World Evidence

| Repo | Stars | Usage |
|------|-------|-------|
| joschan21/quill | 2,011 | `pinecone.Index('quill')` — no try-catch (old API) |
| Oneirocom/Magick | 835 | `pinecone.Index(...)` with try-catch in initialize() |
| n8n/n8n | 90k+ | `client.listIndexes()` — no try-catch in listSearch.ts |

## Version Notes

- v0.x: `PineconeClient` class with `await client.init({apiKey, environment})` — **EOL, not covered**
- v1.0.0: New `Pinecone` class, `pinecone.index('name')` synchronous factory, environment no longer required
- v1.0.0+: All index methods unchanged through v7.x (current)
- Contract covers `>=1.0.0`

## Why try-catch is Required

1. **Network calls**: All index methods make HTTPS requests to Pinecone's hosted API
2. **Auth errors**: Invalid or expired API keys throw immediately
3. **Rate limits**: Pinecone enforces per-project and per-index rate limits (429)
4. **Dimension mismatch**: query() throws if vector dimension != index dimension
5. **Network failures**: DNS, connectivity, timeout errors throw PineconeConnectionError

The official quickstart omits try-catch in code examples, which is the primary
source of the antipattern appearing in real codebases.
