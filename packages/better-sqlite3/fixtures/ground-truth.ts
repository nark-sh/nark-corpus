/**
 * better-sqlite3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the better-sqlite3 contract spec.
 *
 * Contracted functions:
 *   - stmt.run()   postcondition: run-constraint-error
 *   - stmt.get()   postcondition: get-execution-error
 *   - stmt.all()   postcondition: all-execution-error
 *   - db.exec()    postcondition: exec-no-rollback-error
 *
 * Key insight: better-sqlite3 is synchronous. All statement methods throw
 * SqliteError directly (not rejected promises). Error handling = try/catch.
 */

import Database from 'better-sqlite3';

const db = new Database(':memory:');
db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)');
const insertStmt = db.prepare('INSERT INTO users (email) VALUES (?)');
const selectStmt = db.prepare('SELECT * FROM users WHERE id = ?');
const allStmt = db.prepare('SELECT * FROM users');

// ─────────────────────────────────────────────────────────────────────────────
// 1. stmt.run() — write operations
// ─────────────────────────────────────────────────────────────────────────────

export function runNoCatch(email: string) {
  // SHOULD_FIRE: run-constraint-error — stmt.run() throws SqliteError on SQLITE_CONSTRAINT_UNIQUE, no try-catch
  insertStmt.run(email);
}

export function runWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: run() inside try-catch satisfies error handling
    insertStmt.run(email);
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

export function runInlineNoCatch(email: string) {
  // SHOULD_FIRE: run-constraint-error — inline prepare+run without try-catch
  db.prepare('INSERT INTO users (email) VALUES (?)').run(email);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. stmt.get() — single-row reads
// ─────────────────────────────────────────────────────────────────────────────

export function getNoCatch(id: number): unknown {
  // SHOULD_FIRE: get-execution-error — stmt.get() throws SqliteError on locked DB, no try-catch
  return selectStmt.get(id);
}

export function getWithCatch(id: number): unknown {
  try {
    // SHOULD_NOT_FIRE: get() inside try-catch
    return selectStmt.get(id);
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. stmt.all() — multi-row reads
// ─────────────────────────────────────────────────────────────────────────────

export function allNoCatch(): unknown[] {
  // SHOULD_FIRE: all-execution-error — stmt.all() throws SqliteError, no try-catch
  return allStmt.all();
}

export function allWithCatch(): unknown[] {
  try {
    // SHOULD_NOT_FIRE: all() inside try-catch
    return allStmt.all();
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. db.exec() — raw SQL execution (no rollback on error)
// ─────────────────────────────────────────────────────────────────────────────

export function execNoCatch(sql: string) {
  // SHOULD_FIRE: exec-no-rollback-error — db.exec() throws SqliteError, no rollback, no try-catch
  db.exec(sql);
}

export function execWithCatch(sql: string) {
  try {
    // SHOULD_NOT_FIRE: exec() inside try-catch
    db.exec(sql);
  } catch (error) {
    console.error('exec failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Class instance patterns
// ─────────────────────────────────────────────────────────────────────────────

class UserRepo {
  private stmt = db.prepare('INSERT INTO users (email) VALUES (?)');

  insertNoCatch(email: string) {
    // SHOULD_NOT_FIRE: this.stmt is a class property (db.prepare result) —
    // scanner does not trace stmt identity through class property assignments.
    // Detection gap: class-property pattern requires instance-tracker extension.
    this.stmt.run(email);
  }

  insertWithCatch(email: string) {
    try {
      // SHOULD_NOT_FIRE: run() inside try-catch on class instance
      this.stmt.run(email);
    } catch (e) {
      throw e;
    }
  }
}
