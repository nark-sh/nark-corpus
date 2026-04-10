/**
 * mysql2 Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling.
 * Should NOT trigger violations.
 */

import mysql from 'mysql2/promise';

/**
 * ✅ Proper error handling for createConnection
 */
async function connectWithErrorHandling() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'testdb'
    });
    return connection;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for query
 */
async function queryWithErrorHandling() {
  const connection = await mysql.createConnection({ host: 'localhost' });

  try {
    const [rows] = await connection.query('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * ✅ Proper error handling for execute (prepared statement)
 */
async function executeWithErrorHandling(userId: number) {
  const connection = await mysql.createConnection({ host: 'localhost' });

  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
    return rows;
  } catch (error) {
    console.error('Execute failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * ✅ Proper error handling for pool operations
 */
async function poolQueryWithErrorHandling() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'testdb'
  });

  try {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Pool query failed:', error);
    throw error;
  }
}

/**
 * ✅ Proper error handling for transactions
 */
async function transactionWithErrorHandling() {
  const connection = await mysql.createConnection({ host: 'localhost' });

  try {
    await connection.beginTransaction();
    await connection.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);
    await connection.execute('INSERT INTO profiles (user_id) VALUES (?)', [1]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * ✅ Proper error handling for getConnection from pool
 */
async function poolConnectionWithErrorHandling() {
  const pool = mysql.createPool({ host: 'localhost' });

  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('SELECT * FROM users');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Pool connection failed:', error);
    throw error;
  }
}
