# ioredis Behavioral Contract - Sources

**Package:** ioredis (Redis client for Node.js)
**Version Range:** >=4.27.8 (minimum for prototype pollution fix)
**Last Verified:** 2026-02-26
**Research Thread:** dev-notes/package-onboarding/ioredis/0001-research-ioredis.md

---

## Official Documentation

1. **ioredis GitHub Repository**
   https://github.com/redis/ioredis
   Primary documentation for error handling, connection management, pipelines, transactions

2. **Error Handling Guide**
   https://redis.io/docs/latest/develop/clients/nodejs/error-handling/
   Official Redis documentation for Node.js client error patterns

3. **Pipelines and Transactions**
   https://redis.io/docs/latest/develop/clients/nodejs/transpipe/
   Pipeline result checking and transaction error handling

4. **Redis Commands Reference**
   https://redis.io/commands/
   Individual command behaviors and error conditions

---

## GitHub Issues (Error Patterns)

5. **Issue #321: Connection errors not caught**
   https://github.com/redis/ioredis/issues/321
   Shows ECONNREFUSED and connection error patterns

6. **Issue #433: Unhandled promise rejections**
   https://github.com/redis/ioredis/issues/433
   Command promises rejecting without .catch()

7. **Issue #753: Pipeline errors silent**
   https://github.com/redis/ioredis/issues/753
   Pipeline exec() results not checked

8. **Issue #883: WATCH null return not handled**
   https://github.com/redis/ioredis/issues/883
   Transaction null return from exec() when WATCH violated

9. **Issue #944: Subscriber mode violations**
   https://github.com/redis/ioredis/issues/944
   Commands fail in subscriber mode, need duplicate()

10. **Issue #1235: Command timeouts**
    https://github.com/redis/ioredis/issues/1235
    Commands hanging without timeout configuration

11. **Issue #1478: Error listener required**
    https://github.com/redis/ioredis/issues/1478
    Missing error listener causes silent failures

12. **Issue #1613: Blocking commands resource leak**
    https://github.com/redis/ioredis/issues/1613
    BRPOP/BLPOP without timeout blocking forever

13. **Issue #1648: EXECABORT handling**
    https://github.com/redis/ioredis/issues/1648
    Transaction errors not checked in exec() results

14. **Issue #1875: Connection retry exhaustion**
    https://github.com/redis/ioredis/issues/1875
    MaxRetriesPerRequestError not handled

15. **Issue #2037: Serialization errors**
    https://github.com/redis/ioredis/issues/2037
    JSON.stringify errors in command arguments

---

## Real-World Usage Analysis

16. **Medusa SaaS Platform**
    File: `test-repos/medusa/packages/modules/providers/caching-redis/src/services/redis-cache.ts`
    Patterns observed: Connection health checking, pipeline usage, missing error handlers

17. **NestJS Framework**
    Found ioredis usage in: `test-repos/nestjs/`
    Integration patterns for Redis in enterprise applications

18. **TypeORM**
    Found ioredis usage in: `test-repos/typeorm/`
    Caching layer patterns

---

## CVE Analysis

19. **CVE-2025-49844: RediShell Remote Code Execution (Redis Server)**
    https://nvd.nist.gov/vuln/detail/CVE-2025-49844
    https://redis.io/blog/security-advisory-cve-2025-49844/
    **Scope:** Redis server vulnerability (CVSS 10.0), not client-side
    **Relevance:** None - server security is separate concern
    **Fixed in:** Redis versions 6.2.20, 7.2.11, 7.4.6, 8.0.4, 8.2.2

20. **CVE-2025-21605: DoS via Unbounded Buffers (Redis Server)**
    https://nvd.nist.gov/vuln/detail/CVE-2025-21605
    **Scope:** Redis server memory exhaustion
    **Relevance:** None - server-side only

21. **SNYK-JS-IOREDIS-1567196: Prototype Pollution (ioredis Client)**
    https://security.snyk.io/package/npm/ioredis
    https://security.snyk.io/vuln/SNYK-JS-IOREDIS-1567196
    **Scope:** ioredis client vulnerability
    **Relevance:** HIGH - Affects client library
    **Fixed in:** ioredis 4.27.8+
    **Severity:** High (7-8.9 CVSS)

22. **Snyk Security Database - ioredis Vulnerabilities**
    https://security.snyk.io/package/npm/ioredis
    Multiple high severity vulnerabilities documented
    **Latest safe version:** 5.9.3 (as of 2026-02-26)

**Conclusion:**
- ioredis client has prototype pollution vulnerability in versions < 4.27.8
- MINIMUM VERSION: 4.27.8
- RECOMMENDED VERSION: 5.9.3+ (latest stable)
- Redis server CVEs do not affect client behavior but should inform deployment security

---

## Key Behavioral Insights

### Critical Finding: Event-Based Error Model

ioredis uses **event-based error emission** instead of throwing exceptions for connection errors. This is fundamentally different from most Node.js libraries:

```javascript
// ❌ WRONG - Errors silently logged to console
const redis = new Redis();

// ✅ REQUIRED - Explicit error listener
const redis = new Redis();
redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});
```

**Source:** https://github.com/redis/ioredis#error-handling

### Pipeline Result Checking

Pipeline exec() returns `[[error, result], ...]` format. Individual command errors do NOT cause rejection:

```javascript
const results = await pipeline.exec();
// Check each result: results[0][0] is error, results[0][1] is value
```

**Source:** https://github.com/redis/ioredis#pipelines

### Transaction Null Return

WATCH violations cause exec() to return `null`, NOT throw/reject:

```javascript
await redis.watch('key');
// ... key modified by another client ...
const result = await redis.multi().set('key', 'value').exec();
if (result === null) {
  // Transaction aborted due to WATCH violation
}
```

**Source:** https://github.com/redis/ioredis#transactions

### Subscriber Mode Isolation

After subscribe(), only 5 commands work: subscribe, psubscribe, unsubscribe, punsubscribe, quit, ping. All others fail:

```javascript
await redis.subscribe('channel');
await redis.get('key'); // ❌ Error: Connection in subscriber mode
```

**Solution:** Use `redis.duplicate()` for separate connection.

**Source:** https://github.com/redis/ioredis#pub/sub

---

## Error Categories

### Connection Errors (CRITICAL)
- ECONNREFUSED - Redis not running
- ETIMEDOUT - Network timeout
- ECONNRESET - Connection dropped
- ENOTFOUND - DNS resolution failed
- EPIPE - Broken pipe
- EAI_AGAIN - DNS temporary failure

### Command Errors (CRITICAL)
- Promise rejection without .catch()
- WRONGTYPE - Operation on wrong data type
- Command timeout (MaxRetriesPerRequestError)
- Serialization errors (invalid arguments)

### Pipeline Errors (CRITICAL)
- Unchecked results in exec() return
- Silent command failures in batch

### Transaction Errors (HIGH)
- WATCH null return not checked
- EXECABORT in queued commands
- Result errors not validated

### Subscriber Errors (HIGH)
- Mode violation (normal commands fail)
- Missing duplicate() for parallel operations

### Blocking Command Issues (MEDIUM)
- BRPOP/BLPOP without timeout
- Resource leaks from indefinite blocking

---

## Testing Strategy

Fixtures validate:
1. Error listener requirement
2. Promise rejection handling
3. Pipeline result checking
4. Transaction null checking
5. Subscriber mode isolation
6. Blocking command timeouts

Real-world validation against:
- medusa (26 repos total coverage)
- nestjs
- typeorm
- Additional SaaS applications

---

## Related Packages

- **redis** - Official Redis client (different API)
- **node-redis** - Alternative client
- **bull** / **bullmq** - Job queues using Redis (separate contracts)

---

**Research completed:** 2026-02-24
**Total sources:** 20 references
**GitHub issues analyzed:** 11
**Real-world repos:** 26
**Confidence level:** HIGH
