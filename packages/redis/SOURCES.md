# Sources: redis

This document tracks all research sources used to create the behavioral contract for the `redis` npm package (node-redis v5).

---

## Official Documentation

### Primary Error Handling Documentation
- **URL:** https://redis.io/docs/latest/develop/clients/nodejs/error-handling/
- **Date Accessed:** 2026-02-25
- **Key Findings:**
  - MUST register error event listener or process will crash
  - Common error types: ECONNREFUSED, ETIMEDOUT, ECONNRESET, EAI_AGAIN
  - ReplyError types: WRONGTYPE (non-recoverable), BUSY/TRYAGAIN/LOADING (retry with backoff)
  - Four error handling patterns: fail fast, graceful degradation, retry with backoff, log and continue

### v4 to v5 Migration Guide
- **URL:** https://github.com/redis/node-redis/blob/master/docs/v4-to-v5.md
- **Date Accessed:** 2026-02-25
- **Key Changes:**
  - client.quit() → client.close() (graceful shutdown)
  - client.disconnect() → client.destroy() (force disconnect)
  - Pipeline behavior: v5 discards unwritten commands on disconnect (more predictable)
  - Return type changes: Many commands now return number instead of boolean

### npm Package Page
- **URL:** https://www.npmjs.com/package/redis
- **Date Accessed:** 2026-02-25
- **Current Version:** 5.11.0 (as of 2026-02-25)
- **Key Info:** Promise-based API, TypeScript support, automatic reconnection

### GitHub Repository
- **URL:** https://github.com/redis/node-redis
- **Date Accessed:** 2026-02-25
- **Key Info:** Official Redis client for Node.js, actively maintained

---

## Real-World Usage Analysis

### parse-server (v5.10.0)
- **Repository:** https://github.com/parse-community/parse-server
- **Files Analyzed:**
  - src/Adapters/Cache/RedisCacheAdapter.js
  - src/Adapters/PubSub/RedisPubSub.js
- **Patterns Observed:**
  - ✅ Good: Error listener registered on createClient
  - ✅ Good: get() wrapped in try-catch
  - ❌ Bad: put(), del(), clear() NOT wrapped in try-catch
  - Connection management: connect(), close()
  - Queue pattern for operation sequencing

### nestjs
- **Repository:** https://github.com/nestjs/nest
- **Files Analyzed:**
  - integration/microservices/e2e/broadcast-redis.spec.ts
  - integration/microservices/e2e/sum-redis.spec.ts
- **Patterns Observed:**
  - Redis used via Transport.REDIS abstraction
  - Connection management handled by framework
  - Host/port configuration pattern

### typeorm
- **Repository:** https://github.com/typeorm/typeorm
- **Files Analyzed:**
  - src/cache/RedisQueryResultCache.ts
  - src/platform/PlatformTools.ts
- **Patterns Observed:**
  - Redis as optional dependency
  - Dynamic require() pattern
  - Cache abstraction layer

---

## Error Categories

### 1. Connection Errors (Recoverable)
- **ECONNREFUSED:** Connection refused - Redis server not running or not reachable
- **ETIMEDOUT:** Command timeout - Network latency or server overload
- **ECONNRESET:** Connection reset by peer - Network interruption
- **EAI_AGAIN:** DNS resolution failure - Temporary DNS issue

**Recommended Handling:** Retry with exponential backoff, fallback to alternative data source

### 2. Command Errors (Non-Recoverable)
- **WRONGTYPE:** Type mismatch - Attempting wrong operation on key type
  - Example: LPUSH on a string key
  - **Fix:** Correct the data schema or command

**Recommended Handling:** Fail fast, fix code or data

### 3. Command Errors (Recoverable with Bounded Retry)
- **BUSY:** Redis is busy (e.g., during BGSAVE)
- **TRYAGAIN:** Command failed, can retry (e.g., cluster redirect)
- **LOADING:** Redis is loading data from disk

**Recommended Handling:** Retry with exponential backoff (bounded attempts)

### 4. Error Events (Critical)
- **No error listener:** If client doesn't have at least one error listener registered, any error will be thrown and the Node.js process will exit
- **AbortError:** Command not yet executed but rejected
- **InterruptError:** Executed commands that failed (e.g., network drop during execution)

**Recommended Handling:** ALWAYS register error listener on createClient

---

## Security Research

### CVE Analysis
- **Search Date:** 2026-02-25
- **Finding:** No CVEs found for node-redis npm package client library
- **Note:** Redis server CVEs (CVE-2025-49844, CVE-2025-21605) are not relevant to client behavior

**Conclusion:** Focus on error handling best practices rather than security vulnerabilities

---

## Error Handling Patterns

### Pattern 1: Fail Fast (Non-Recoverable Errors)
```typescript
try {
  await client.get(key);
} catch (err) {
  if (err.name === 'ReplyError' && /WRONGTYPE|ERR /.test(err.message)) {
    throw err; // Fix code or data type
  }
  throw err;
}
```

### Pattern 2: Graceful Degradation (Connection Errors)
```typescript
try {
  const val = await client.get(key);
  if (val != null) return val;
} catch (err) {
  if (['ECONNREFUSED','ECONNRESET','ETIMEDOUT','EAI_AGAIN'].includes(err.code)) {
    logger.warn('Cache unavailable; falling back to DB');
    return database.get(key);
  }
  throw err;
}
return database.get(key);
```

### Pattern 3: Retry with Backoff (Temporary Errors)
```typescript
async function getWithRetry(key, { attempts = 3, baseDelayMs = 100 } = {}) {
  let delay = baseDelayMs;
  for (let i = 0; i < attempts; i++) {
    try {
      return await client.get(key);
    } catch (err) {
      if (
        i < attempts - 1 &&
        (['ETIMEDOUT','ECONNRESET','EAI_AGAIN'].includes(err.code) ||
         (err.name === 'ReplyError' && /(BUSY|TRYAGAIN|LOADING)/.test(err.message)))
      ) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}
```

### Pattern 4: Log and Continue (Non-Critical Operations)
```typescript
try {
  await client.setEx(key, 3600, value);
} catch (err) {
  if (['ECONNREFUSED','ECONNRESET','ETIMEDOUT','EAI_AGAIN'].includes(err.code)) {
    logger.warn(`Failed to cache ${key}, continuing without cache`);
  } else {
    throw err;
  }
}
```

---

## Behavioral Contract Rationale

### Why These Functions?

1. **createClient()**: Entry point - error listener is critical for process stability
2. **client.connect()**: Connection establishment - common point of failure (ECONNREFUSED, ETIMEDOUT)
3. **client.get()**: Most common read operation - connection/timeout errors
4. **client.set()**: Most common write operation - data loss risk without error handling
5. **client.del()**: Common deletion operation - connection errors

### Why These Postconditions?

1. **missing-error-listener** (ERROR):
   - Without error listener, ANY error will crash the Node.js process
   - Severity: ERROR - process crash is unacceptable
   - Real-world evidence: All production code registers error listeners

2. **connect-no-error-handling** (ERROR):
   - Connection failures are common (server down, network issues)
   - Unhandled promise rejection can crash process
   - Severity: ERROR - application cannot function without connection handling

3. **get-no-error-handling** (ERROR):
   - Read operations critical for application logic
   - Unhandled errors cause crashes or incorrect behavior
   - Severity: ERROR - must handle connection/timeout errors

4. **set-no-error-handling** (ERROR):
   - Write operations risk data loss without error handling
   - Silent failures can corrupt application state
   - Severity: ERROR - data integrity depends on error handling

5. **del-no-error-handling** (ERROR):
   - Deletion operations affect application state
   - Unhandled errors can lead to inconsistent state
   - Severity: ERROR - state consistency requires error handling

### Deferred for Future Versions

- **Pub/Sub patterns**: subscribe(), publish(), pSubscribe()
- **Transaction commands**: multi(), exec(), watch()
- **Pipeline operations**: Batched command execution
- **Cluster support**: Cluster-specific commands and error handling
- **Stream commands**: xAdd(), xRead(), xRange()
- **Advanced commands**: keys(), scan(), eval()

**Rationale:** Starting with core CRUD operations that cover 80% of use cases

---

## Version Compatibility

- **Target Version Range:** ^5.0.0
- **Tested Against:** v5.10.0, v5.11.0
- **Breaking Changes from v4:**
  - API method renames (quit→close, disconnect→destroy)
  - Pipeline behavior changes
  - Return type changes (boolean→number)

---

## References

1. [Error handling | Redis Node.js Docs](https://redis.io/docs/latest/develop/clients/nodejs/error-handling/)
2. [node-redis v4 to v5 Migration](https://github.com/redis/node-redis/blob/master/docs/v4-to-v5.md)
3. [redis - npm](https://www.npmjs.com/package/redis)
4. [GitHub - redis/node-redis](https://github.com/redis/node-redis)
5. [parse-server RedisCacheAdapter](https://github.com/parse-community/parse-server)
6. [NestJS Redis Transport](https://github.com/nestjs/nest)
7. [TypeORM Redis Cache](https://github.com/typeorm/typeorm)

---

**Last Updated:** 2026-02-25
**Researcher:** Claude Sonnet 4.5
**Contract Version:** 1.0.0
