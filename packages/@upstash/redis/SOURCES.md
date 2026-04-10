# Sources — @upstash/redis

## Primary Documentation

- **SDK Overview:** https://upstash.com/docs/redis/sdks/ts/overview
- **Troubleshooting:** https://upstash.com/docs/redis/sdks/ts/troubleshooting
- **GitHub Repository:** https://github.com/upstash/upstash-redis
- **npm Package:** https://www.npmjs.com/package/@upstash/redis

## Error Behavior Evidence

The error types (`UpstashError`, `UpstashJSONParseError`, `UrlError`) and when they are thrown are documented in the source code at:
- `pkg/error.ts` in the GitHub repository
- `pkg/http.ts` — where `UpstashError` is thrown for non-2xx HTTP responses

Key code paths (verified in installed package `nodejs.js`):

1. **Non-2xx response** (line ~225 in nodejs.js):
   ```javascript
   throw new UpstashError(`${body.error}, command was: ${JSON.stringify(req.body)}`);
   ```

2. **Network exhaustion** (line ~244 in nodejs.js):
   ```javascript
   throw error ?? new Error("Exhausted all retries");
   ```

3. **Pipeline command error** (line ~434 in nodejs.js):
   ```javascript
   throw new UpstashError(`Command failed: ${commandResult.error}`);
   ```

## Real-World Usage References

- **dub** (https://github.com/dubinc/dub) — uses @upstash/redis extensively for link caching, click tracking, rate limiting. See `apps/web/lib/upstash/redis.ts`.
- **cal.com** (https://github.com/calcom/cal.com) — uses @upstash/redis via `RedisService` wrapper for caching. See `packages/features/redis/RedisService.ts`.

## Upstash Error Messages (from docs)

From https://upstash.com/docs/llms.txt:
- `"WRONGPASS invalid or missing auth token"` — authentication failure
- `"ERR max daily request limit exceeded"` — quota exhaustion
- `"ERR max concurrent connections exceeded"` — connection limit
- `"NOAUTH Authentication Required"` — missing auth token
- Standard Redis error codes for type mismatches (`WRONGTYPE`)
