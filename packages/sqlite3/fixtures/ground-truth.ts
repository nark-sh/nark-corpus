/**
 * sqlite3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions with ACTIVE detection (V2 scanner):
 *   - db.prepare()  postcondition: syntax-error
 *
 * Contracted functions PENDING detection rules (callback-based, no await):
 *   - db.each()          postconditions: each-completion-error-ignored, each-syntax-error
 *   - db.close()         postconditions: close-unfinalised-statements, close-already-closed
 *   - db.loadExtension() postconditions: loadextension-file-not-found, loadextension-security-disabled
 *   - db.backup()        postconditions: backup-cantopen-destination, backup-misuse-after-finish
 *   See scanner concerns: concern-20260417-sqlite3-deepen-1 through -4
 *
 * Detection path (prepare): new sqlite3.Database() → InstanceTracker tracks instance →
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

// ─────────────────────────────────────────────────────────────────────────────
// 3–6. db.each() / db.close() / db.loadExtension() / db.backup()
//
// Note: sqlite3 uses a callback-based API, not async/await. The V2 scanner
// analyzes await patterns and try-catch blocks. These new postconditions
// (each-completion-error-ignored, close-unfinalised-statements,
// loadextension-file-not-found, backup-cantopen-destination) require
// callback-error-check detection rules that do not yet exist in the scanner.
//
// Scanner upgrade concerns queued:
//   concern-20260417-sqlite3-deepen-1 (each completion callback)
//   concern-20260417-sqlite3-deepen-2 (close unfinalised)
//   concern-20260417-sqlite3-deepen-3 (loadExtension callback)
//   concern-20260417-sqlite3-deepen-4 (backup callback)
//
// Until those rules are implemented, these examples serve as documentation
// of the intended detection patterns.
// ─────────────────────────────────────────────────────────────────────────────

// Example: db.each() without completion callback
// Pattern to detect: db.each() with only ONE callback arg (no completion callback)
// Postcondition: each-completion-error-ignored
export function eachNoCompletionCallback(db: sqlite3.Database) {
  // Missing completion callback — any SQL error is silently swallowed
  db.each('SELECT * FROM users', (err: Error | null, row: unknown) => {
    if (err) throw err;
    console.log(row);
  });
}

// Pattern to detect: db.each() with TWO callbacks, both checking err
// This is the correct pattern and should NOT be flagged
export function eachWithCompletionCallback(db: sqlite3.Database, done: (err?: Error) => void) {
  db.each(
    'SELECT * FROM users',
    (err: Error | null, row: unknown) => {
      if (err) return done(err);
      console.log(row);
    },
    (err: Error | null, count: number) => {
      if (err) return done(err);
      done();
    }
  );
}

// Example: db.close() without finalizing statements
// Pattern to detect: db.close() called in same scope as db.prepare() without stmt.finalize()
// Postcondition: close-unfinalised-statements
export function closeWithUnfinalisedStatement(db: sqlite3.Database) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  db.close(); // stmt still active — SQLITE_BUSY: unable to close due to unfinalised statements
}

// Correct pattern: finalize before close
export function closeAfterFinalise(db: sqlite3.Database, done: () => void) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.finalize(() => {
    db.close((err?: Error | null) => {
      if (err) throw err;
      done();
    });
  });
}

// Example: db.loadExtension() without error check
// Pattern to detect: loadExtension() callback that doesn't check err
// Postcondition: loadextension-file-not-found
export function loadExtensionNoErrorCheck(db: sqlite3.Database) {
  // err ignored — file not found error silently swallowed
  db.loadExtension('./my-extension', (err: Error | null) => {
    console.log('Extension loaded'); // err ignored!
  });
}

// Correct pattern: check err in callback
export function loadExtensionWithErrorCheck(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadExtension('./my-extension', (err: Error | null) => {
      if (err) return reject(new Error(`Extension load failed: ${err.message}`));
      resolve();
    });
  });
}

// Example: db.backup() without error check
// Pattern to detect: backup() callback that doesn't check err
// Postcondition: backup-cantopen-destination
export function backupNoErrorCheck(db: sqlite3.Database) {
  // err ignored — CANTOPEN error silently swallowed
  const backup = db.backup('/nonexistent/path/backup.db', (err: Error | null) => {
    console.log('Backup complete'); // err ignored!
  });
}

// Correct pattern: check err in backup callback
export function backupWithErrorCheck(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    const backup = db.backup('./backup.db', (err: Error | null) => {
      if (err) return reject(new Error(`Backup failed: ${err.message}`));
      resolve();
    });
  });
}
