# Sources: @neondatabase/serverless

Behavioral claims in `contract.yaml` are derived from the following sources.

## Official Documentation

| URL | Description |
|-----|-------------|
| https://neon.tech/docs/serverless/serverless-driver | Official serverless driver docs — API reference, error handling, Pool/Client lifecycle |
| https://github.com/neondatabase/serverless | GitHub repo — source code, README, changelog |
| https://github.com/neondatabase/serverless/blob/main/CONFIG.md | neonConfig configuration reference |

## Error Handling Evidence

| Source | Claim |
|--------|-------|
| https://neon.tech/docs/serverless/serverless-driver | "The Neon serverless driver... throws a NeonDbError if the query fails" |
| https://github.com/neondatabase/serverless/blob/main/src/index.ts | NeonDbError class with all PostgreSQL error fields (code, severity, detail, constraint, etc.) |
| https://github.com/neondatabase/serverless/issues/51 | Historical issue: HTTP transport NeonDbError fields were asymmetric vs WebSocket; fixed in PR #78 (all fields now parity) |

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.7.x | 2024 | Stable pre-GA releases; Pool/Client API stabilized |
| 1.0.0 | 2025-03-25 | General availability; parenthesis call syntax now throws runtime error (footgun fixed) |
| 1.0.2 | 2026 | Latest as of contract creation |

## Pool/Client Release Evidence

The client.release() requirement for Pool.connect() is documented in the Neon driver docs and mirrors
the node-postgres (pg) API which the WebSocket transport is compatible with:
- https://node-postgres.com/apis/pool (Pool.connect() + release() pattern)
- https://neon.tech/docs/serverless/serverless-driver#pool-and-client

## Scale-to-Zero Network Error Evidence

Neon databases suspend after periods of inactivity and must be activated on the next query.
This activation can fail or timeout, producing a NeonDbError with sourceError set:
- https://neon.tech/docs/introduction/auto-suspend
- Community reports of connection timeouts during cold start in high-latency environments
