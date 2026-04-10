# Sources — @upstash/ratelimit

All URLs fetched on 2026-04-02.

## Package Metadata
- https://www.npmjs.com/package/@upstash/ratelimit — npm page, version 2.0.8
- https://github.com/upstash/ratelimit-js — GitHub repository

## Documentation
- https://upstash.com/docs/redis/sdks/ratelimit-ts/overview — Overview and quick start
- https://upstash.com/docs/redis/sdks/ratelimit-ts/features — Timeout and caching features

## Source Code (fetched directly)
- https://raw.githubusercontent.com/upstash/ratelimit-js/main/src/ratelimit.ts — Main class, limit() and blockUntilReady() implementations
- https://raw.githubusercontent.com/upstash/ratelimit-js/main/src/types.ts — RatelimitResponse, RatelimitConfig types

## Key Findings
- `TimeoutError` class is exported but `limit()` does NOT throw it — timeout resolves with `{ success: true, reason: "timeout" }`
- Underlying `@upstash/redis` HTTP calls CAN throw (network, 401 auth errors)
- Real-world usage pattern: calling `limit()` without try-catch is common (roomGPT, lagon)
- No known CVEs as of 2026-04-02 (checked socket.dev, aikido.dev)
