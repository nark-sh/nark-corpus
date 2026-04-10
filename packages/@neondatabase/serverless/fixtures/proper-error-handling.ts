/**
 * @neondatabase/serverless — Proper Error Handling Fixtures
 *
 * All patterns here demonstrate CORRECT error handling.
 * The analyzer should produce ZERO error violations for this file.
 * (Warnings on .end() in finally blocks are expected and acceptable.)
 */

import { Pool, Client } from '@neondatabase/serverless';

// ─────────────────────────────────────────────────────────────────────────────
// Pool.query() — try-catch patterns
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fetchUsersWithPoolQuery() {
  try {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('DB query failed:', error);
    throw error;
  }
}

async function insertUserWithPoolQuery(name: string, email: string) {
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pool.connect() → client.query() → client.release()
// The connect() call must be in the same try-catch as the query.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchUsersWithPoolConnect() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Pool operation failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

async function runTransactionWithPool() {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query('INSERT INTO orders (status) VALUES ($1)', ['pending']);
    await client.query('UPDATE inventory SET stock = stock - 1 WHERE id = $1', [1]);
    await client.query('COMMIT');
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    throw error;
  } finally {
    if (client) client.release();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client.connect() / Client.query() / Client.end()
// ─────────────────────────────────────────────────────────────────────────────

async function fetchUsersWithDirectClient() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Client query failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function runTransactionWithDirectClient() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query('INSERT INTO events (type) VALUES ($1)', ['purchase']);
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pool.end() with error handling
// ─────────────────────────────────────────────────────────────────────────────

async function gracefulShutdown() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Pool close error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Outer try-catch covering the entire async block
// ─────────────────────────────────────────────────────────────────────────────

async function apiHandler(userId: string) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return { user: result.rows[0] };
  } catch (error) {
    return { error: 'Database error' };
  }
}
