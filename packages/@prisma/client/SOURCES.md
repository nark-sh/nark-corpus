# Prisma Behavioral Contract - Sources

## Official Documentation

### Error Reference
- **Main Error Reference**: https://www.prisma.io/docs/reference/api-reference/error-reference
- **Error Handling Guide**: https://www.prisma.io/docs/concepts/components/prisma-client/handling-exceptions-and-errors
- **Client API Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

### Core Concepts
- **CRUD Operations**: https://www.prisma.io/docs/concepts/components/prisma-client/crud
- **Transactions**: https://www.prisma.io/docs/concepts/components/prisma-client/transactions
- **Connection Management**: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management

## Error Types

### PrismaClientKnownRequestError
Query engine returns a known error with specific error code.

**Common Error Codes:**
- **P2001**: Record not found in WHERE condition
- **P2002**: Unique constraint violation (duplicate key)
- **P2003**: Foreign key constraint violation
- **P2014**: Cannot delete record due to dependent records
- **P2024**: Transaction timeout exceeded
- **P2025**: Operation failed because required records not found
- **P2034**: Transaction deadlock detected

**Source**: https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientknownrequesterror

### PrismaClientUnknownRequestError
Query engine returned an error without a standardized code.

**Source**: https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientunknownrequesterror

### PrismaClientValidationError
Client-side validation failed before reaching the database (missing fields, type mismatches).

**Source**: https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientvalidationerror

### PrismaClientInitializationError
Engine startup or database connection failed.

**Common Codes:**
- **P1000**: Authentication failed
- **P1001**: Can't reach database server
- **P1002**: Database connection timeout

**Source**: https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientinitializationerror

## Common Production Issues

### Connection Pool Timeouts
**Severity**: High - Very common in production

**GitHub Issues:**
- [Connection pool timeout (#20537)](https://github.com/prisma/prisma/discussions/20537)
- [Pool timeout with higher connection_limit (#9622)](https://github.com/prisma/prisma/issues/9622)
- [Pool timeout but DB pooler never under load (#24846)](https://github.com/prisma/prisma/discussions/24846)
- [Connections not returned to pool (#12510)](https://github.com/prisma/prisma/issues/12510)

**Root Causes:**
1. **Connection Pool Exhaustion**: Long-running queries hold connections, exhausting the pool
2. **Connection Leak**: Under error conditions, connections aren't returned to the pool
3. **Simultaneous Query Limit**: More concurrent queries than pool size can handle

**Recommended Solutions:**
- Increase `connection_limit` in datasource configuration
- Increase `pool_timeout` to allow queries to wait longer
- Use Prisma Client Metrics to diagnose performance issues
- Ensure transactions are properly closed even on error

### Transaction Deadlocks
**Severity**: Medium - Occurs under high concurrency

**Issue**: Database detects circular lock dependencies (P2034 error)

**Recommended Handling:**
- Implement retry with exponential backoff + jitter
- Reduce transaction duration and scope
- Order lock acquisition consistently across transactions

**Source**: https://www.prisma.io/docs/reference/api-reference/error-reference#p2034

### Serverless Connection Issues
**Severity**: Medium - Common in Lambda/Vercel environments

**Issue**: Each function instance creates its own connection pool, exhausting database connections

**Recommended Solutions:**
- Use connection pooler (PgBouncer, RDS Proxy)
- DO NOT call `$disconnect()` in every invocation
- Reuse Prisma Client instance across invocations

**Source**: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments-faas

## Security Advisories

**Last Checked**: 2026-02-23

No major CVEs found for `@prisma/client` package itself. The CVEs found were for unrelated products:
- Prisma Cloud by Palo Alto Networks (different product)
- Prisma Access Browser (different product)

## Behavioral Gotchas

### 1. `findUnique` Returns Null
Unlike `findUniqueOrThrow`, the standard `findUnique` returns `null` when no record is found. Code must null-check before accessing properties.

**Source**: https://www.prisma.io/docs/concepts/components/prisma-client/crud#findunique

### 2. Transactions Cannot Be Nested
Prisma does not support nested transactions. All operations must be in a single top-level `$transaction()` call.

**Source**: https://www.prisma.io/docs/concepts/components/prisma-client/transactions#nested-transactions

### 3. Auto-Connect on First Query
Prisma Client automatically connects on the first query. Explicit `$connect()` is usually unnecessary.

**Source**: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect

### 4. Idempotency for Transaction Retries
When retrying transactions (e.g., after deadlock), ensure operations are idempotent to prevent duplicate effects on retry.

**Source**: https://www.prisma.io/docs/concepts/components/prisma-client/transactions#transaction-timeouts

## Verification Process

### Best Practices Verified
1. ✅ Use `instanceof` checks for type-safe error handling
2. ✅ Match on `error.code` for specific error conditions
3. ✅ Handle connection errors separately from business logic errors
4. ✅ Implement exponential backoff for transient errors
5. ✅ Always null-check `findUnique` results

### Error Handling Pattern
```typescript
import { Prisma } from "@prisma/client";

try {
  const user = await prisma.user.create({ data: { email } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      // Unique constraint violation
      const target = e.meta?.target; // Field that caused violation
      // Handle duplicate key error
    }
  }
  throw e; // Re-throw unexpected errors
}
```

**Source**: https://www.prisma.io/docs/concepts/components/prisma-client/handling-exceptions-and-errors

## Last Verified
**Date**: 2026-02-23
**Prisma Version Range**: 4.0.0 to 6.x
**Documentation Version**: Current as of February 2026
