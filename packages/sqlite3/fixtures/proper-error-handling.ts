/**
 * sqlite3 Fixtures - Proper Error Handling
 *
 * These examples demonstrate CORRECT error handling.
 * Should NOT trigger violations.
 *
 * Note: sqlite3 uses callbacks, shown with promisified versions
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

/**
 * ✅ Proper error handling for run (INSERT/UPDATE/DELETE)
 */
async function runWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  try {
    await run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
    await run('INSERT INTO users (name) VALUES (?)', ['Alice']);
  } catch (error) {
    console.error('Run failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * ✅ Proper error handling for get (SELECT single row)
 */
async function getWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const get = promisify(db.get.bind(db));

  try {
    const row = await get('SELECT * FROM users WHERE id = ?', [1]);
    return row;
  } catch (error) {
    console.error('Get failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * ✅ Proper error handling for all (SELECT multiple rows)
 */
async function allWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const all = promisify(db.all.bind(db));

  try {
    const rows = await all('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('All failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * ✅ Proper error handling for exec (multiple statements)
 */
async function execWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const exec = promisify(db.exec.bind(db));

  try {
    await exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
      INSERT INTO users (name) VALUES ('Alice');
      INSERT INTO users (name) VALUES ('Bob');
    `);
  } catch (error) {
    console.error('Exec failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * ✅ Proper error handling for prepared statement
 */
async function preparedStatementWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');

  try {
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    const stmtRun = promisify(stmt.run.bind(stmt));

    await stmtRun('Alice');
    await stmtRun('Bob');

    stmt.finalize();
  } catch (error) {
    console.error('Prepared statement failed:', error);
    throw error;
  } finally {
    db.close();
  }
}
