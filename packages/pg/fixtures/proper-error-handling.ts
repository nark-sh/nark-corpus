/**
 * PostgreSQL (pg) Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling for pg.
 * Should NOT trigger any violations.
 */

import { Client, Pool } from 'pg';

/**
 * Proper error handling with Client.query()
 */
async function queryWithProperErrorHandling() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    user: 'testuser',
    password: 'testpass',
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [1]);
    return result.rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Proper error handling with Pool.query()
 */
async function queryPoolWithProperErrorHandling() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'testdb',
  });

  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [100]);
    return result.rows;
  } catch (error) {
    console.error('Pool query failed:', error);
    throw error;
  }
}

/**
 * Proper error handling for transactions
 */
async function transactionWithProperErrorHandling() {
  const client = new Client();
  
  try {
    await client.connect();
    await client.query('BEGIN');
    
    await client.query('INSERT INTO users (name) VALUES ($1)', ['Alice']);
    await client.query('INSERT INTO profiles (user_id, bio) VALUES ($1, $2)', [1, 'Bio']);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Proper error handling for parameterized queries
 */
async function parameterizedQueryWithProperErrorHandling(userId: number) {
  const pool = new Pool();
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND active = $2',
      [userId, true]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Query failed for user:', userId, error);
    throw error;
  }
}

/**
 * Proper error handling for connection errors
 */
async function connectWithProperErrorHandling() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Connected at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Proper error handling for bulk operations
 */
async function bulkInsertWithProperErrorHandling(users: Array<{ name: string; email: string }>) {
  const pool = new Pool();
  
  try {
    const promises = users.map(user =>
      pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [user.name, user.email])
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Bulk insert failed:', error);
    throw error;
  }
}
