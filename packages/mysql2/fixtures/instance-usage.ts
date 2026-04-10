/**
 * mysql2 Fixtures - Instance Usage
 *
 * Tests detection of mysql2 usage via connection and pool instances.
 */

import mysql from 'mysql2/promise';

/**
 * ❌ Connection instance without error handling
 * Should trigger ERROR violations
 */
async function useConnectionInstanceWithoutErrorHandling() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    database: 'testdb'
  });

  // ❌ Multiple operations without try-catch
  await connection.query('SELECT * FROM users');
  await connection.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);
  await connection.end();
}

/**
 * ❌ Pool instance without error handling
 * Should trigger ERROR violations
 */
async function usePoolInstanceWithoutErrorHandling() {
  const pool = mysql.createPool({
    host: 'localhost',
    database: 'testdb'
  });

  // ❌ No try-catch
  await pool.query('SELECT * FROM users');
  await pool.execute('SELECT * FROM products WHERE id = ?', [1]);
}

/**
 * ❌ Pool connection without error handling
 * Should trigger ERROR violation
 */
async function usePoolConnectionWithoutErrorHandling() {
  const pool = mysql.createPool({ host: 'localhost' });
  const conn = await pool.getConnection();

  // ❌ No try-catch
  await conn.query('SELECT * FROM users');
  conn.release();
}

/**
 * ✅ Proper error handling for instance methods
 */
async function useInstancesWithErrorHandling() {
  const pool = mysql.createPool({ host: 'localhost' });

  try {
    await pool.query('SELECT * FROM users');
    const conn = await pool.getConnection();
    try {
      await conn.execute('SELECT * FROM products');
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
