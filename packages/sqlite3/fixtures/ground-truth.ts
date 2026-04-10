/**
 * sqlite3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "sqlite3"):
 *   - db.prepare()  postcondition: syntax-error
 *
 * Detection path: new sqlite3.Database() → InstanceTracker tracks instance →
 *   ThrowingFunctionDetector fires prepare() → ContractMatcher checks try-catch →
 *   postcondition fires
 */

import sqlite3 from 'sqlite3';

// ─────────────────────────────────────────────────────────────────────────────
// 1. db.prepare() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function prepareNoCatch() {
  const db = new sqlite3.Database(':memory:');
  // SHOULD_FIRE: syntax-error — db.prepare() throws on SQL syntax errors. No try-catch.
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.finalize();
  db.close();
}

export async function prepareWithCatch() {
  const db = new sqlite3.Database(':memory:');
  try {
    // SHOULD_NOT_FIRE: db.prepare() inside try-catch satisfies error handling
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.finalize();
  } catch (err) {
    console.error('Prepare failed:', err);
    throw err;
  } finally {
    db.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. db.prepare() — second pattern (INSERT)
// ─────────────────────────────────────────────────────────────────────────────

export async function prepareInsertNoCatch() {
  const db = new sqlite3.Database(':memory:');
  // SHOULD_FIRE: syntax-error — db.prepare() throws on bad SQL. No try-catch.
  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  stmt.finalize();
  db.close();
}

export async function prepareInsertWithCatch() {
  const db = new sqlite3.Database(':memory:');
  try {
    // SHOULD_NOT_FIRE: db.prepare() inside try-catch satisfies error handling
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    stmt.finalize();
  } catch (err) {
    console.error('Prepare failed:', err);
    throw err;
  } finally {
    db.close();
  }
}
