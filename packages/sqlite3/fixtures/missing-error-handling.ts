/**
 * sqlite3 Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations.
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

/**
 * ❌ Missing try-catch for run
 * Should trigger ERROR violation
 */
async function runWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  await run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  await run('INSERT INTO users (name) VALUES (?)', ['Alice']);

  db.close();
}

/**
 * ❌ Missing try-catch for get
 * Should trigger ERROR violation
 */
async function getWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const get = promisify(db.get.bind(db));

  const row = await get('SELECT * FROM users WHERE id = ?', [1]);
  db.close();
  return row;
}

/**
 * ❌ Missing try-catch for all
 * Should trigger ERROR violation
 */
async function allWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const all = promisify(db.all.bind(db));

  const rows = await all('SELECT * FROM users');
  db.close();
  return rows;
}

/**
 * ❌ Missing try-catch for exec
 * Should trigger ERROR violation
 */
async function execWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const exec = promisify(db.exec.bind(db));

  await exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  db.close();
}

/**
 * ❌ Missing try-catch for INSERT with constraint violation
 * Should trigger ERROR violation
 */
async function insertUniqueViolationWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  await run('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)');
  await run('INSERT INTO users (email) VALUES (?)', ['test@example.com']);
  // ❌ This will violate unique constraint
  await run('INSERT INTO users (email) VALUES (?)', ['test@example.com']);

  db.close();
}

/**
 * ❌ Missing try-catch for UPDATE
 * Should trigger ERROR violation
 */
async function updateWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  await run('UPDATE users SET name = ? WHERE id = ?', ['Bob', 1]);
  db.close();
}

/**
 * ❌ Missing try-catch for DELETE
 * Should trigger ERROR violation
 */
async function deleteWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  await run('DELETE FROM users WHERE id = ?', [1]);
  db.close();
}

/**
 * ❌ Missing try-catch for prepared statement
 * Should trigger ERROR violation
 */
async function preparedStatementWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  const stmtRun = promisify(stmt.run.bind(stmt));

  await stmtRun('Alice');
  stmt.finalize();
  db.close();
}
