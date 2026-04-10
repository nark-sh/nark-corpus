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
