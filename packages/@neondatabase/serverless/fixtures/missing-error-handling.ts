/**
 * @neondatabase/serverless — Missing Error Handling Fixtures
 *
 * All patterns here demonstrate INCORRECT error handling.
 * The analyzer should produce ERROR violations for this file.
 */

import { Pool, Client } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─────────────────────────────────────────────────────────────────────────────
// Pool.query() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function fetchUsersNoCatch() {
  // ❌ No try-catch — NeonDbError will crash the handler
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
}

async function insertUserNoCatch(name: string, email: string) {
  // ❌ No try-catch — unique constraint violation (23505) will crash
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  return result.rows[0];
}

async function deleteUserNoCatch(userId: string) {
  // ❌ No try-catch — foreign key constraint violation (23503) will crash
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pool.connect() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function connectNoCatch() {
  // ❌ No try-catch — pool exhaustion or connection error will crash
  const client = await pool.connect();
  const result = await client.query('SELECT 1');
  client.release();
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client.connect() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function clientConnectNoCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  // ❌ No try-catch — NeonDbError will crash on connection failure
  await client.connect();
  const result = await client.query('SELECT * FROM products');
  await client.end();
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client.query() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

async function clientQueryNoCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
  } catch (e) {
    throw e;
  }
  // ❌ query outside try-catch — NeonDbError will crash
  const result = await client.query('SELECT * FROM orders');
  await client.end();
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// try-finally without catch (not sufficient)
// ─────────────────────────────────────────────────────────────────────────────

async function poolQueryFinallyOnlyNoCatch() {
  let result;
  try {
    // ❌ try-finally without catch — NeonDbError propagates uncaught
    result = await pool.query('SELECT * FROM sessions');
  } finally {
    // cleanup
  }
  return result?.rows;
}
