# Sources — cross-fetch

| URL | Fetched | Summary |
|-----|---------|---------|
| https://github.com/lquixada/cross-fetch | 2026-04-02 | Official README and TypeScript types |
| https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch | 2026-04-02 | MDN Fetch API error handling documentation |
| https://github.com/lquixada/cross-fetch/index.d.ts | 2026-04-02 | TypeScript type definitions via GitHub API |

## Key Findings

- `fetch()` throws `TypeError` on network failures (DNS, connection refused, socket errors)
- HTTP error status codes (4xx/5xx) do NOT throw — must check `response.ok`
- cross-fetch proxies to `node-fetch` on Node.js, following WHATWG Fetch spec
- 0 GitHub security advisories as of 2026-04-02
