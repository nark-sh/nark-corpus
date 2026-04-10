/**
 * mysql2 Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import mysql from 'mysql2/promise';

/**
 * ❌ Missing try-catch for createConnection
 * Should trigger ERROR violation
 */
async function connectWithoutErrorHandling() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'testdb'
  });
  return connection;
}

/**
 * ❌ Missing try-catch for query
 * Should trigger ERROR violation
 */
async function queryWithoutErrorHandling() {
  const connection = await mysql.createConnection({ host: 'localhost' });
  const [rows] = await connection.query('SELECT * FROM users');
  await connection.end();
  return rows;
}

/**
 * ❌ Missing try-catch for execute
 * Should trigger ERROR violation
 */
async function executeWithoutErrorHandling(userId: number) {
  const connection = await mysql.createConnection({ host: 'localhost' });
  const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
  await connection.end();
  return rows;
}

/**
 * ❌ Missing try-catch for INSERT
 * Should trigger ERROR violation
 */
async function insertWithoutErrorHandling(name: string, email: string) {
  const connection = await mysql.createConnection({ host: 'localhost' });
  await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  await connection.end();
}

/**
 * ❌ Missing try-catch for UPDATE
 * Should trigger ERROR violation
 */
async function updateWithoutErrorHandling(userId: number, name: string) {
  const connection = await mysql.createConnection({ host: 'localhost' });
  await connection.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
  await connection.end();
}

/**
 * ❌ Missing try-catch for DELETE
 * Should trigger ERROR violation
 */
async function deleteWithoutErrorHandling(userId: number) {
  const connection = await mysql.createConnection({ host: 'localhost' });
  await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
  await connection.end();
}

/**
 * ❌ Missing try-catch for pool query
 * Should trigger ERROR violation
 */
async function poolQueryWithoutErrorHandling() {
  const pool = mysql.createPool({ host: 'localhost' });
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
}

/**
 * ❌ Missing try-catch for getConnection
 * Should trigger ERROR violation
 */
async function poolConnectionWithoutErrorHandling() {
  const pool = mysql.createPool({ host: 'localhost' });
  const connection = await pool.getConnection();
  await connection.query('SELECT * FROM users');
  connection.release();
}

/**
 * ❌ Missing try-catch for transaction
 * Should trigger ERROR violations
 */
async function transactionWithoutErrorHandling() {
  const connection = await mysql.createConnection({ host: 'localhost' });
  await connection.beginTransaction();
  await connection.execute('INSERT INTO users (name) VALUES (?)', ['Bob']);
  await connection.commit();
  await connection.end();
}
