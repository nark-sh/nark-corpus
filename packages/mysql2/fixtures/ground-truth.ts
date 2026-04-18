/**
 * mysql2 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "mysql2/promise"):
 *   - connection.query()   postcondition: syntax-error
 *   - pool.query()         postcondition: syntax-error
 *
 * Detection path: connection/pool created via factory methods →
 *   InstanceTracker tracks instance → ThrowingFunctionDetector fires query() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import mysql from 'mysql2/promise';

// ─────────────────────────────────────────────────────────────────────────────
// 1. connection.query() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoCatch() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  // SHOULD_FIRE: syntax-error — connection.query() throws on SQL errors. No try-catch.
  await connection.query('SELECT * FROM users');
  await connection.end();
}

export async function queryWithCatch() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  try {
    // SHOULD_NOT_FIRE: connection.query() inside try-catch satisfies error handling
    await connection.query('SELECT * FROM users');
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. pool.query() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function poolQueryNoCatch() {
  const pool = mysql.createPool({ host: 'localhost', database: 'testdb' });
  // SHOULD_FIRE: syntax-error — pool.query() throws on SQL errors. No try-catch.
  await pool.query('SELECT * FROM users');
}

export async function poolQueryWithCatch() {
  const pool = mysql.createPool({ host: 'localhost', database: 'testdb' });
  try {
    // SHOULD_NOT_FIRE: pool.query() inside try-catch satisfies error handling
    await pool.query('SELECT * FROM users');
  } catch (err) {
    console.error('Pool query failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. connection.reset() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: reset-connection-dead
export async function resetNoCatch() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  // SHOULD_FIRE: reset-connection-dead — connection.reset() can reject (PROTOCOL_CONNECTION_LOST, ECONNRESET) if the connection is no longer alive
  await connection.reset();
  await connection.end();
}

// @expect-clean
export async function resetWithCatch() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  try {
    // SHOULD_NOT_FIRE: connection.reset() inside try-catch satisfies error handling
    await connection.reset();
    await connection.query('SELECT 1');
  } catch (err) {
    // Connection is unusable after failed reset — destroy, not release
    connection.destroy();
    throw err;
  } finally {
    await connection.end().catch(() => {}); // Ignore end errors after reset
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PreparedStatementInfo.close() — resource leak pattern
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: prepared-statement-close-missing is a resource-pairing pattern (detect ABSENCE of stmt.close()).
// The V2 scanner detects unhandled throws but not missing resource cleanup calls.
// This detection requires a different static analysis pattern not yet implemented.
// See concern-20260418-mysql2-deepen-2 (rejected — beyond current scanner capability).
export async function prepareWithoutClose() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  try {
    const stmt = await connection.prepare('SELECT * FROM users WHERE id = ?');
    // NOT_YET_DETECTED: prepared-statement-close-missing — stmt.close() never called; unclosed statement occupies a server-side slot until connection closes
    await stmt.execute([1]);
    // Missing: await stmt.close();
  } finally {
    await connection.end();
  }
}

// @expect-clean
export async function prepareWithClose() {
  const connection = await mysql.createConnection({ host: 'localhost', database: 'testdb' });
  const stmt = await connection.prepare('SELECT * FROM users WHERE id = ?');
  try {
    // SHOULD_NOT_FIRE: stmt.execute() inside try with stmt.close() in finally
    const [rows] = await stmt.execute([1]);
    return rows;
  } finally {
    await stmt.close(); // Always close — fire-and-forget, always resolves
    await connection.end();
  }
}
