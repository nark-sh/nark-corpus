/**
 * sqlite3 Fixtures - Instance Usage
 *
 * Tests detection of sqlite3 usage via Database instances.
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

/**
 * ❌ Database instance without error handling
 * Should trigger ERROR violations
 */
async function useDatabaseInstanceWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));
  const all = promisify(db.all.bind(db));

  // ❌ Multiple operations without try-catch
  await run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  await run('INSERT INTO users (name) VALUES (?)', ['Alice']);
  await all('SELECT * FROM users');

  db.close();
}

/**
 * ❌ Database instance with prepared statements without error handling
 * Should trigger ERROR violations
 */
async function usePreparedStatementsWithoutErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));

  await run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');

  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  const stmtRun = promisify(stmt.run.bind(stmt));

  // ❌ No try-catch
  await stmtRun('Alice');
  await stmtRun('Bob');

  stmt.finalize();
  db.close();
}

/**
 * ✅ Proper error handling for database instance
 */
async function useDatabaseInstanceWithErrorHandling() {
  const db = new sqlite3.Database(':memory:');
  const run = promisify(db.run.bind(db));
  const all = promisify(db.all.bind(db));

  try {
    await run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
    await run('INSERT INTO users (name) VALUES (?)', ['Alice']);
    const rows = await all('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  } finally {
    db.close();
  }
}
