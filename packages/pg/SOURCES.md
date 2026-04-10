# PostgreSQL (pg) Behavioral Contract - Sources

## Official Documentation

### node-postgres (pg) Documentation
- **Main Documentation**: https://node-postgres.com/
- **Pooling Guide**: https://node-postgres.com/features/pooling
- **Pool API**: https://node-postgres.com/apis/pool
- **Client API**: https://node-postgres.com/apis/client
- **Queries**: https://node-postgres.com/features/queries
- **SSL Configuration**: https://node-postgres.com/features/ssl

### PostgreSQL Official Documentation
- **Error Codes (SQLSTATE)**: https://www.postgresql.org/docs/current/errcodes-appendix.html
- **Error Handling**: https://www.postgresql.org/docs/current/ecpg-errors.html
- **Security Information**: https://www.postgresql.org/support/security/

## Error Codes (SQLSTATE)

PostgreSQL uses SQLSTATE error codes defined by the SQL standard. The `pg` library exposes these via the `error.code` property.

### Common Error Classes

**Class 23 - Integrity Constraint Violation**
- **23505** - `unique_violation`: Unique constraint violated (duplicate key)
- **23503** - `foreign_key_violation`: Foreign key constraint violated
- **23502** - `not_null_violation`: NOT NULL constraint violated
- **23514** - `check_violation`: CHECK constraint violated

**Class 42 - Syntax Error or Access Rule Violation**
- **42601** - `syntax_error`: SQL syntax error
- **42P01** - `undefined_table`: Table does not exist
- **42703** - `undefined_column`: Column does not exist
- **42883** - `undefined_function`: Function does not exist

**Class 28 - Invalid Authorization Specification**
- **28P01** - `invalid_password`: Authentication failed
- **28000** - `invalid_authorization_specification`: SSL required but not used

**Class 3D - Invalid Catalog Name**
- **3D000** - `invalid_catalog_name`: Database does not exist

**Source**: https://www.postgresql.org/docs/current/errcodes-appendix.html

### Using Error Constants

Instead of hardcoding error codes, use helper libraries:

**pg-error-constants** (recommended):
```javascript
import { UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION } from 'pg-error-constants';

if (error.code === UNIQUE_VIOLATION) {
  // Handle duplicate key
}
```

**pg-error** (alternative):
Parses PostgreSQL ErrorResponse format with human-readable field names.

**Sources**:
- [pg-error-constants](https://github.com/LinusU/pg-error-constants)
- [pg-error npm package](https://www.npmjs.com/package/pg-error)

## Connection Pooling

### Pool Configuration

node-postgres ships with built-in connection pooling via the `pg-pool` module.

**Key Configuration Options**:
- `max`: Maximum number of clients in pool (default: 10)
- `connectionTimeoutMillis`: Max wait time for client checkout (default: 0 = no timeout)
- `idleTimeoutMillis`: How long client can be idle before being closed (default: 10000)
- `maxUses`: Maximum number of times to use a client before closing (optional)

**Example**:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20,                        // Max 20 connections
  idleTimeoutMillis: 30000,       // Close idle clients after 30s
  connectionTimeoutMillis: 2000,  // Wait max 2s for connection
});
```

**Source**: https://node-postgres.com/apis/pool

### Critical Pool Error Handling

**MUST add error listener to pool**:
```javascript
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Client is automatically terminated and removed from pool
});
```

**Why critical**: If a pool emits an error event and no listeners are added, Node.js will emit an uncaught error and potentially **crash the process**.

**Source**: https://node-postgres.com/apis/pool

### Client Release Management

**Most critical production issue**: Forgetting to release clients.

**Problem**: If you forget to call `client.release()`, your application will quickly exhaust available clients in the pool. All further calls to `pool.connect()` will timeout or hang indefinitely.

**Solution - ALWAYS use try/finally**:
```javascript
const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows;
} finally {
  client.release();  // ALWAYS release, even on error
}
```

**Alternative - Use pool.query() for simple queries**:
```javascript
// Automatically checks out and releases client
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**When to use Pool.connect() vs Pool.query()**:
- Use `pool.connect()`: For transactions or multiple sequential queries
- Use `pool.query()`: For single queries (automatic release)

**Sources**:
- [Pooling Guide](https://node-postgres.com/features/pooling)
- [GitHub Issue: Client Release](https://github.com/brianc/node-postgres/issues/2641)

## Common Production Issues

### Issue 1: Pool Exhaustion (MOST COMMON - 30% of Projects)
**Severity**: Critical - Application hangs
**Prevalence**: Affects approximately 30% of mid-sized projects

**Symptoms**:
- `timeout exceeded when trying to connect` errors
- Application hangs waiting for database connections
- All pool clients show as busy

**Root Causes**:
1. **Forgot to release client**: Most common cause (missing client.release() in finally)
2. **Pool size too small**: Not enough connections for load
3. **Long-running queries**: Queries hold connections too long
4. **Connection leaks**: Clients not released on error paths

**Solutions**:
1. ALWAYS use try/finally with client.release()
2. Use pool.query() for simple queries
3. Monitor pool metrics:
   ```javascript
   console.log('Total clients:', pool.totalCount);
   console.log('Idle clients:', pool.idleCount);
   console.log('Waiting clients:', pool.waitingCount);
   ```
4. Increase pool size if needed: `max: 20`
5. Configure connection timeout: `connectionTimeoutMillis: 5000`

**Sources**:
- [GitHub Issue: Pool Exhaustion](https://github.com/brianc/node-postgres/issues/2758)
- [GitHub Issue: Connection Leaks](https://github.com/brianc/node-postgres/issues/1882)
- [GitHub Issue: Pool Leaking #1777](https://github.com/brianc/node-postgres/issues/1777)
- [Connection Pooling Guide (2026)](https://oneuptime.com/blog/post/2026-01-06-nodejs-connection-pooling-postgresql-mysql/view)

### Issue 2: SQL Injection Vulnerabilities
**Severity**: Critical - Security risk

**Problem**: Using string concatenation instead of parameterized queries

**Vulnerable Code**:
```javascript
// ❌ DANGEROUS: SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;
await pool.query(query);
```

**Secure Code**:
```javascript
// ✅ SAFE: Parameterized query
await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

**Additional Protection**: Recent CVEs show even `libpq` quoting functions can have injection risks. Always use parameterized queries.

**Sources**:
- [node-postgres Queries](https://node-postgres.com/features/queries)
- [CVE-2025-1094](https://www.postgresql.org/support/security/CVE-2025-1094/)

### Issue 3: Uncaught Pool Errors
**Severity**: High - Process crash

**Problem**: Not adding error listener to pool causes Node.js to crash on background errors

**Solution**:
```javascript
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Log to monitoring system
  // Client is automatically removed from pool
});
```

**Common background errors**:
- Network disconnections
- Database restart
- Connection timeouts

**Source**: https://node-postgres.com/apis/pool

### Issue 4: Connection String Misconfigurations
**Severity**: High - Connection failures

**Common issues**:
- Wrong host/port
- Missing database name
- Invalid credentials
- SSL required but not configured

**Error codes**:
- `ECONNREFUSED`: Server not running or wrong host/port
- `28P01`: Authentication failed (invalid password)
- `3D000`: Database does not exist
- `28000`: SSL required

**Solutions**:
- Use connection strings for simplicity: `postgresql://user:pass@host:5432/db`
- Enable SSL for production: `ssl: { rejectUnauthorized: false }`
- Validate configuration on startup

**Source**: https://node-postgres.com/features/ssl

### Issue 5: Missing Error Code Handling
**Severity**: Medium - Poor error messages

**Problem**: Not checking `error.code` to provide specific error handling

**Solution**:
```javascript
try {
  await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);
} catch (error) {
  if (error.code === '23505') {
    // Unique violation - user already exists
    throw new Error(`User with email ${email} already exists`);
  } else if (error.code === '23502') {
    // Not null violation
    throw new Error(`Missing required field: ${error.column}`);
  }
  throw error; // Re-throw unexpected errors
}
```

**Useful error properties**:
- `error.code`: SQLSTATE code
- `error.constraint`: Constraint name (for violations)
- `error.table`: Table name
- `error.column`: Column name
- `error.position`: Error position in query (for syntax errors)

**Sources**:
- [GitHub Issue: Error Handling](https://github.com/brianc/node-postgres/issues/2492)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)

## Security Advisories

**Last Checked**: 2026-02-26

### npm pg Package CVE

**CVE-2017-16082** - Arbitrary Code Execution
- **Impact**: Specially crafted column names could execute arbitrary code during query result parsing
- **Severity**: HIGH
- **Affected Versions**: All versions < 7.2.0
- **Fixed Version**: 7.2.0+
- **Current Status**: ✅ All modern versions (8.x) are safe
- **Minimum Safe Version**: 8.0.0 (recommended)
- **Source**: [Snyk Security Advisory](https://security.snyk.io/vuln/npm:pg:20170813)

### PostgreSQL Server CVEs (2025-2026)

These affect PostgreSQL server, not the npm `pg` package specifically, but are relevant for node-postgres users:

**CVE-2025-8715** - pg_dump Newline Injection (Critical)
- **Impact**: Arbitrary code execution via malicious object names in dumps
- **Severity**: High
- **Mitigation**: Update PostgreSQL server to patched version
- **Source**: [CVE-2025-8715](https://www.postgresql.org/support/security/CVE-2025-8715/)

**CVE-2025-8714** - pg_dump Superuser Code Injection (Critical)
- **Impact**: Malicious superuser can inject code via psql meta-commands
- **Severity**: High
- **Mitigation**: Trust only dumps from trusted sources
- **Source**: [CVE-2025-8714](https://www.postgresql.org/support/security/CVE-2025-8714/)

**CVE-2026-2005** - pgcrypto Heap Buffer Overflow (Critical)
- **Impact**: Arbitrary code execution in pgcrypto extension
- **Severity**: Critical
- **Mitigation**: Update PostgreSQL server
- **Source**: [CVE-2026-2005](https://www.postgresql.org/support/security/CVE-2026-2005/)

**CVE-2025-1094** - libpq Quoting Syntax Neutralization Failure
- **Impact**: SQL injection in certain usage patterns
- **Severity**: Medium
- **Mitigation**: Always use parameterized queries, not string escaping
- **Source**: [CVE-2025-1094](https://www.postgresql.org/support/security/CVE-2025-1094/)

**CVE Statistics**:
- 2024: Multiple vulnerabilities
- 2025: 9 vulnerabilities
- 2026: 0 vulnerabilities (as of Feb 2026)

**Source**: [PostgreSQL Security Vulnerabilities](https://stack.watch/product/postgresql/)

**Summary**:
- 1 direct CVE in pg package (CVE-2017-16082, fixed in 7.2.0+)
- Multiple PostgreSQL server CVEs (affect server, not pg package directly)
- All production apps should use pg@8.0.0 or later

**Recommendation**: Keep both PostgreSQL server and npm `pg` package updated.

## Best Practices Summary

### 1. Always Use Parameterized Queries
```javascript
// ✅ CORRECT
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ WRONG - SQL injection vulnerability
await pool.query(`SELECT * FROM users WHERE id = '${userId}'`);
```

### 2. Always Release Clients
```javascript
// ✅ CORRECT - Using try/finally
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users (name) VALUES ($1)', ['Alice']);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();  // ALWAYS release
}
```

### 3. Handle Pool Errors
```javascript
// ✅ REQUIRED
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
```

### 4. Check Error Codes
```javascript
// ✅ RECOMMENDED
import { UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION } from 'pg-error-constants';

try {
  await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);
} catch (error) {
  if (error.code === UNIQUE_VIOLATION) {
    return { error: 'Email already exists' };
  }
  throw error;
}
```

### 5. Configure Pool Properly
```javascript
// ✅ PRODUCTION CONFIGURATION
const pool = new Pool({
  max: 20,                        // Adjust based on load
  idleTimeoutMillis: 30000,       // Close idle connections
  connectionTimeoutMillis: 2000,  // Don't wait forever
});

// Monitor pool health
setInterval(() => {
  console.log('Pool status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
}, 60000);
```

## Verification Date
**Last Verified**: 2026-02-26
**pg Package Version**: 8.18.0 (latest stable)
**PostgreSQL Version**: 12+
**Documentation Version**: Current as of February 2026
**Downloads**: 16,050,446 per week
**Status**: Production Ready ✅
