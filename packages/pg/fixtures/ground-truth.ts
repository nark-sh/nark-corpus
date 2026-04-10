/**
 * pg Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "pg"):
 *   - pool.query()     postcondition: syntax-error, unique-violation, connection-error
 *   - pool.connect()   postcondition: pool-exhausted, client-not-released
 *   - pool.end()       postcondition: pool-end-called-twice, pool-query-after-end
 *   - client.release() postcondition: double-release-throws
 *   - transaction      postcondition: transaction-not-rolled-back-on-error, transaction-on-pool-query
 *
 * Detection path: pool created via new Pool() →
 *   InstanceTracker tracks pool → ThrowingFunctionDetector fires pool.query() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { Pool } from 'pg';

// ─────────────────────────────────────────────────────────────────────────────
// 1. pool.query() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoCatch(id: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // SHOULD_FIRE: syntax-error — pool.query() throws on SQL errors. No try-catch.
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows;
}

export async function queryWithCatch(id: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  try {
    // SHOULD_NOT_FIRE: pool.query() inside try-catch satisfies error handling
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows;
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. pool.query() — second pattern (INSERT)
// ─────────────────────────────────────────────────────────────────────────────

export async function insertNoCatch(name: string, email: string) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // SHOULD_FIRE: syntax-error — pool.query() throws on constraint violations. No try-catch.
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
    [name, email]
  );
  return result.rows[0];
}

export async function insertWithCatch(name: string, email: string) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  try {
    // SHOULD_NOT_FIRE: pool.query() inside try-catch satisfies error handling
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      [name, email]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Insert failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. pool.end() — correct shutdown pattern
// Detection pending: concern-20260402-pg-deepen-1 (pool-end-called-twice)
// ─────────────────────────────────────────────────────────────────────────────

// No SHOULD_FIRE for pool-end: scanner rule not yet implemented (concern-20260402-pg-deepen-1)
export async function poolEndNoCatch() {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // (no annotation — pool.end() detection pending scanner upgrade)
  await pool.end();
}

export async function poolEndWithCatch() {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  try {
    // (no SHOULD_NOT_FIRE annotation — pool.end() detection not yet implemented)
    await pool.end();
  } catch (err) {
    console.error('Pool end failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. pool.connect() + client.release() — correct client lifecycle
// Detection pending: concern-20260402-pg-deepen-2 (client-not-released)
// ─────────────────────────────────────────────────────────────────────────────

// No SHOULD_FIRE for client-not-released: scanner rule not yet implemented (concern-20260402-pg-deepen-2)
export async function connectNoRelease(id: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // (no annotation — client.release() tracking detection pending scanner upgrade)
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows;
}

export async function connectWithRelease(id: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // (no SHOULD_NOT_FIRE annotation — pool.connect() without catch still fires
  //  pool-exhausted; client.release() tracking requires future scanner upgrade)
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. transaction — correct ROLLBACK pattern
// Detection pending: concern-20260402-pg-deepen-3 (transaction-not-rolled-back-on-error)
// ─────────────────────────────────────────────────────────────────────────────

// No SHOULD_FIRE for transaction-not-rolled-back: scanner rule not yet implemented (concern-20260402-pg-deepen-3)
export async function transactionNoRollback(userId: number, amount: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // (no annotation — BEGIN-without-ROLLBACK detection pending scanner upgrade)
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, userId]);
    await client.query('COMMIT');
  } catch (err) {
    // Missing: await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function transactionWithRollback(userId: number, amount: number) {
  const pool = new Pool({ host: 'localhost', database: 'myapp' });
  // (no SHOULD_NOT_FIRE annotation — pool.connect() without catch still fires
  //  pool-exhausted postcondition; transaction ROLLBACK detection requires future upgrade)
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
