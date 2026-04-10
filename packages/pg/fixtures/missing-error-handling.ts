/**
 * PostgreSQL (pg) Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import { Client, Pool } from 'pg';

/**
 * ❌ Missing try-catch for Client.query()
 * Should trigger ERROR violation
 */
async function queryWithoutErrorHandling() {
  const client = new Client({
    host: 'localhost',
    database: 'testdb',
  });

  await client.connect();
  const result = await client.query('SELECT * FROM users');
  await client.end();
  
  return result.rows;
}

/**
 * ❌ Missing try-catch for Pool.query()
 * Should trigger ERROR violation
 */
async function queryPoolWithoutErrorHandling() {
  const pool = new Pool();
  const result = await pool.query('SELECT * FROM products');
  return result.rows;
}

/**
 * ❌ Missing try-catch for parameterized query
 * Should trigger ERROR violation
 */
async function parameterizedQueryWithoutErrorHandling(userId: number) {
  const pool = new Pool();
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

/**
 * ❌ Missing try-catch for INSERT
 * Should trigger ERROR violation
 */
async function insertWithoutErrorHandling(name: string, email: string) {
  const client = new Client();
  await client.connect();
  await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
  await client.end();
}

/**
 * ❌ Missing try-catch for UPDATE
 * Should trigger ERROR violation
 */
async function updateWithoutErrorHandling(userId: number, name: string) {
  const pool = new Pool();
  await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
}

/**
 * ❌ Missing try-catch for DELETE
 * Should trigger ERROR violation
 */
async function deleteWithoutErrorHandling(userId: number) {
  const pool = new Pool();
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

/**
 * ❌ Missing try-catch for transaction
 * Should trigger ERROR violation (multiple violations for each query)
 */
async function transactionWithoutErrorHandling() {
  const client = new Client();
  await client.connect();
  
  await client.query('BEGIN');
  await client.query('INSERT INTO users (name) VALUES ($1)', ['Bob']);
  await client.query('INSERT INTO profiles (user_id) VALUES ($1)', [2]);
  await client.query('COMMIT');
  
  await client.end();
}

/**
 * ❌ Missing try-catch for connection
 * Should trigger ERROR violation
 */
async function connectWithoutErrorHandling() {
  const client = new Client({
    connectionString: 'postgresql://localhost/testdb',
  });
  
  await client.connect();
  const result = await client.query('SELECT NOW()');
  await client.end();
  
  return result.rows[0];
}

/**
 * ❌ Missing try-catch for bulk operations
 * Should trigger ERROR violations
 */
async function bulkInsertWithoutErrorHandling(users: Array<{ name: string }>) {
  const pool = new Pool();
  
  for (const user of users) {
    await pool.query('INSERT INTO users (name) VALUES ($1)', [user.name]);
  }
}
