# mysql2 - Behavioral Contract Sources

## Package Overview

- **Package:** mysql2
- **npm:** https://www.npmjs.com/package/mysql2
- **GitHub:** https://github.com/sidorares/node-mysql2
- **Official Documentation:** https://sidorares.github.io/node-mysql2/docs
- **Type:** MySQL driver for Node.js (promise-based and callback-based)
- **Category:** Database driver (throws exceptions on errors)

## Error Handling Philosophy

mysql2 is a MySQL driver that throws exceptions for all error conditions. Unlike libraries that use error callbacks exclusively, mysql2's promise API requires explicit error handling with try-catch blocks. The driver passes through MySQL server errors, Node.js network errors, and internal protocol errors.

## Connection Methods

### 1. createConnection()
Creates a single persistent connection to MySQL server.

**Source:** [MySQL2 Quickstart](https://sidorares.github.io/node-mysql2/docs)

**Usage:**
```javascript
import mysql from 'mysql2/promise';
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});
```

**Error Codes:**
- `ECONNREFUSED` - MySQL server not running or unreachable
- `ER_ACCESS_DENIED_ERROR` (1045) - Invalid credentials
- `ETIMEDOUT` - Connection timeout
- `PROTOCOL_CONNECTION_LOST` - Connection dropped during use

### 2. createPool()
Creates a connection pool for better resource management.

**Source:** [createPool Documentation](https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool)

**Configuration Options:**
- `connectionLimit` (default: 10) - Maximum number of connections
- `maxIdle` (default: same as connectionLimit) - Maximum idle connections
- `idleTimeout` (default: 60000ms) - Time before idle connections are closed
- `queueLimit` (default: 0 = unlimited) - Maximum queued connection requests
- `waitForConnections` (default: true) - Queue requests when pool is full
- `enableKeepAlive` (default: true) - Maintain connections with keepalive packets
- `keepAliveInitialDelay` (default: 0ms) - Delay before first keepalive

**Pool Methods:**
- `pool.execute()` - Execute query using any available connection
- `pool.query()` - Execute query without prepared statements
- `pool.getConnection()` - Get dedicated connection for transactions

**Source:** [Connection Pooling Best Practices](https://oneuptime.com/blog/post/2026-01-06-nodejs-connection-pooling-postgresql-mysql/view)

### 3. createPoolCluster()
Creates cluster of connection pools for read/write splitting or load balancing.

**Error Management:**
- Tracks `errorCount` per node
- Removes node when `errorCount > removeNodeErrorCount`

## Query Methods

### query() vs execute()

**Critical Security Difference:**

**Source:** [Query vs Execute Discussion](https://github.com/sidorares/node-mysql2/discussions/1601)

#### query() - String-based queries
```javascript
const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Security Risk:** If not using placeholders (`?`), vulnerable to SQL injection:
```javascript
// DANGEROUS - DO NOT DO THIS
const [rows] = await connection.query(`SELECT * FROM users WHERE id = ${userId}`);
```

**Use Case:** Simple queries, or when hitting prepared statement syntax limitations.

#### execute() - Prepared statements
```javascript
const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

**Security Benefit:** Parameters are serialized server-side, preventing SQL injection.

**How it works:**
1. Statement sent to server once and parsed
2. Server stores compiled statement
3. Subsequent calls send only parameters
4. Parameters treated as literal data, not SQL code

**Source:** [SQL Injection Prevention Guide](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

**Recommendation:** Use `execute()` by default for all parameterized queries.

## Error Codes Reference

### Connection Errors

#### ECONNREFUSED
**Type:** Node.js network error
**Meaning:** Connection refused by server
**Cause:** MySQL server not running or wrong host/port
**Retry:** Yes, with exponential backoff
**Source:** [ECONNREFUSED Issue](https://github.com/mysqljs/mysql/issues/874)

#### ER_ACCESS_DENIED_ERROR (1045)
**Type:** MySQL server error
**SQLSTATE:** 28000
**Message:** Access denied for user 'username'@'host' (using password: YES/NO)
**Cause:** Invalid username, password, or host permissions
**Retry:** No, fix credentials
**Source:** [MySQL Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

#### ETIMEDOUT
**Type:** Node.js network error
**Meaning:** Connection attempt timed out
**Cause:** Network issues, firewall, or slow server
**Retry:** Yes, with exponential backoff

#### PROTOCOL_CONNECTION_LOST
**Type:** mysql2 internal error
**Meaning:** Connection lost during query execution
**Cause:** Server restart, timeout (wait_timeout exceeded), network interruption
**Retry:** Yes, reconnect and retry query
**Source:** [Lost Connection Reference](https://dev.mysql.com/doc/refman/8.4/en/error-lost-connection.html)

**Common Causes:**
- Server `wait_timeout` setting (default 28800 seconds)
- Large result sets exceeding `net_read_timeout` (default 30 seconds)
- Server crash or restart
- Network interruption

**Solution:** Increase `net_read_timeout` for large queries or implement connection retry logic.

### SQL Syntax Errors

#### ER_PARSE_ERROR (1064)
**Type:** MySQL server error
**SQLSTATE:** 42000
**Message:** You have an error in your SQL syntax
**Cause:** Invalid SQL statement
**Retry:** No, fix SQL syntax
**Source:** [MySQL Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

### Schema Errors

#### ER_NO_SUCH_TABLE (1146)
**Type:** MySQL server error
**SQLSTATE:** 42S02
**Message:** Table 'database.table_name' doesn't exist
**Cause:** Table not created or wrong database selected
**Retry:** No, create table or check schema
**Source:** [MySQL Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

### Constraint Violations

#### ER_DUP_ENTRY (1062)
**Type:** MySQL server error
**SQLSTATE:** 23000
**Message:** Duplicate entry 'value' for key 'key_name'
**Cause:** Unique or primary key constraint violation
**Retry:** No, handle duplicate appropriately (ignore, update, or error)
**Source:** [ER_DUP_ENTRY Discussion](https://github.com/mysqljs/mysql/issues/2161)

**Error Object Properties:**
```javascript
{
  code: 'ER_DUP_ENTRY',
  errno: 1062,
  sqlState: '23000',
  sqlMessage: "Duplicate entry 'john@example.com' for key 'email'",
  sql: 'INSERT INTO users (email) VALUES (?)'
}
```

**Handling Pattern:**
```javascript
try {
  await connection.execute('INSERT INTO users (email) VALUES (?)', [email]);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    // Handle duplicate: return existing user or show error
    console.log('User already exists');
  }
  throw error;
}
```

#### ER_NO_REFERENCED_ROW_2 (1452)
**Type:** MySQL server error
**SQLSTATE:** 23000
**Message:** Cannot add or update a child row: a foreign key constraint fails
**Cause:** Foreign key references non-existent parent row
**Retry:** No, ensure parent row exists
**Source:** [MySQL Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

#### ER_BAD_NULL_ERROR (1048)
**Type:** MySQL server error
**SQLSTATE:** 23000
**Message:** Column 'column_name' cannot be null
**Cause:** Attempting to insert NULL into NOT NULL column
**Retry:** No, provide non-null value
**Source:** [MySQL Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)

## Transaction Handling

### Best Practices

**Source:** [MySQL Transactions Guide](https://dev.mysql.com/doc/refman/8.4/en/commit.html)

**Pattern for Transactions:**
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();

  // Execute multiple queries
  await connection.execute('INSERT INTO orders (user_id) VALUES (?)', [userId]);
  await connection.execute('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?', [itemId]);

  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release(); // CRITICAL: Always release connection
}
```

**Source:** [Transaction Best Practices](https://medium.com/@alxkm/the-complete-guide-to-database-transactions-how-commit-and-rollback-really-work-in-mysql-and-36d1ce81b9eb)

### Transaction Rules

1. **Always end transactions:** Every transaction MUST end with COMMIT or ROLLBACK
2. **Keep transactions short:** Minimize lock contention
3. **Implement error handling:** Catch errors and decide commit vs rollback
4. **Avoid user interaction:** No prompts within transactions
5. **Release connections:** Use `finally` block to ensure `connection.release()`

**Source:** [autocommit and Transaction Behavior](https://dev.mysql.com/doc/refman/8.0/en/innodb-autocommit-commit-rollback.html)

### Lock Management
- Both COMMIT and ROLLBACK release all InnoDB locks
- Autocommit is enabled by default (each statement is a transaction)
- Disable autocommit when using explicit transactions

## Connection Pool Issues

### Common Bugs

**Source:** [Pool Connection Issues](https://github.com/sidorares/node-mysql2/issues/2362)

#### 1. Connection Leaks
**Problem:** Forgetting to call `connection.release()`
**Symptom:** "Too many connections" error after N requests
**Solution:** Always use `finally` block to release connections

**Source:** [Pool Execute Won't Release](https://github.com/sidorares/node-mysql2/issues/837)

#### 2. Multiple release() Calls
**Problem:** Calling `connection.release()` multiple times
**Impact:** Pool inconsistency, same connection assigned to multiple requests
**Solution:** Track release state, call release() exactly once

**Source:** [Repeated release() Issue](https://github.com/sidorares/node-mysql2/issues/3559)

#### 3. Pool Exhaustion
**Problem:** All connections busy, queue timeout exceeded
**Error:** "Pool is closed" or timeout error
**Root Causes:**
1. Connections not released (connection leaks)
2. Pool size too small (`connectionLimit`)
3. Queries taking too long

**Source:** [Too Many Connections Issue](https://github.com/sidorares/node-mysql2/issues/840)

#### 4. Stale Connections
**Problem:** Pool doesn't detect disconnected idle connections
**Error:** `ECONNRESET` on newly acquired connection
**Solution:** Configure `enableKeepAlive: true` and appropriate `idleTimeout`

**Source:** [Idle Connection Issue](https://github.com/sidorares/node-mysql2/issues/683)

### Promise API with Pools

**Correct usage:**
```javascript
const pool = mysql.createPool(config).promise();

// Method 1: Direct pool execution (connection managed automatically)
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

// Method 2: Manual connection for transactions
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  // ... queries
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release(); // REQUIRED
}
```

**Source:** [Promise Pool Discussion](https://github.com/sidorares/node-mysql2/discussions/2282)

**Important:** `pool.execute()` cannot be used for transactions because each call may use a different connection. Transactions require holding the same connection for the entire sequence: `getConnection` → `beginTransaction` → queries → `commit`/`rollback` → `release`.

## Common Production Mistakes

### 1. SQL Injection via String Concatenation
```javascript
// WRONG - Vulnerable to SQL injection
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// CORRECT - Use placeholders
await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
```

### 2. Forgetting to Release Connections
```javascript
// WRONG - Connection leaked if error occurs
const connection = await pool.getConnection();
await connection.execute('SELECT * FROM users');
connection.release();

// CORRECT - Always release in finally
const connection = await pool.getConnection();
try {
  await connection.execute('SELECT * FROM users');
} finally {
  connection.release();
}
```

### 3. No Error Handling for Constraints
```javascript
// WRONG - Unhandled ER_DUP_ENTRY crashes server
await connection.execute('INSERT INTO users (email) VALUES (?)', [email]);

// CORRECT - Handle duplicate gracefully
try {
  await connection.execute('INSERT INTO users (email) VALUES (?)', [email]);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return { error: 'Email already registered' };
  }
  throw error;
}
```

### 4. Using query() Instead of execute()
```javascript
// LESS SECURE - Parameters serialized client-side
await pool.query('SELECT * FROM users WHERE id = ?', [id]);

// MORE SECURE - Parameters serialized server-side
await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
```

**Source:** [Query vs Execute Security](https://github.com/sidorares/node-mysql2/discussions/1601)

### 5. Pool Closed During Execution
```javascript
// WRONG - pool.end() closes pool while queries running
pool.query('SELECT ...');
pool.end(); // Kills active queries

// CORRECT - Wait for queries to finish
await pool.query('SELECT ...');
await pool.end();
```

**Source:** [Pool End Issue](https://github.com/sidorares/node-mysql2/issues/1698)

## Error Handling FAQs

**Source:** [How to Handle Errors](https://sidorares.github.io/node-mysql2/docs/faq/how-to-handle-errors)

### Promise API Error Handling

**Connection Errors:**
```javascript
try {
  const connection = await mysql.createConnection(config);
} catch (err) {
  console.log('Connection error:', err.code); // ECONNREFUSED, etc.
}
```

**Query Errors:**
```javascript
try {
  const [rows] = await connection.execute('SELECT * FROM users');
} catch (err) {
  console.log('Query error:', err.code, err.sqlMessage);
}
```

### Error Object Properties

```javascript
{
  code: 'ER_DUP_ENTRY',           // Error code
  errno: 1062,                    // MySQL error number
  sqlState: '23000',              // SQL standard error code
  sqlMessage: 'Duplicate entry...', // MySQL error message
  sql: 'INSERT INTO...'           // Original SQL query
}
```

## TypeScript Support

**Source:** [TypeScript Examples](https://sidorares.github.io/node-mysql2/docs/documentation/typescript-examples)

mysql2 provides TypeScript type definitions:
- `ConnectionOptions` - Connection configuration
- `PoolOptions` - Pool configuration
- `Connection` - Connection interface
- `Pool` - Pool interface
- `RowDataPacket` - Query result type
- `ResultSetHeader` - INSERT/UPDATE result type

```typescript
import mysql, { ConnectionOptions, PoolOptions } from 'mysql2/promise';

const config: PoolOptions = {
  host: 'localhost',
  user: 'root',
  database: 'test',
  connectionLimit: 10
};

const pool = mysql.createPool(config);
```

## Performance Considerations

### Connection Pooling vs Single Connection

**Use createPool() for:**
- Web applications with concurrent requests
- Applications with sporadic database access
- Better resource management

**Use createConnection() for:**
- Long-running processes with continuous DB access
- Background workers with dedicated DB operations
- Lower overhead for single-threaded apps

### Prepared Statement Performance

**Source:** [MySQL Prepared Statements](https://dev.mysql.com/doc/refman/8.4/en/sql-prepared-statements.html)

**Benefits of execute():**
- Statement parsed once, executed multiple times
- More efficient for repeated queries
- Prevents SQL injection

**Overhead:**
- Small overhead for single-execution queries
- Benefits increase with query complexity and repetition

## Related Documentation

- [MySQL 8.0 Error Reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)
- [mysql2 npm Package](https://www.npmjs.com/package/mysql2)
- [mysql2 GitHub Repository](https://github.com/sidorares/node-mysql2)
- [Snyk mysql2 Security](https://snyk.io/advisor/npm-package/mysql2)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
