/**
 * better-sqlite3 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the better-sqlite3 contract spec.
 *
 * Contracted functions:
 *   - stmt.run()           postcondition: run-constraint-error
 *   - stmt.get()           postcondition: get-execution-error
 *   - stmt.all()           postcondition: all-execution-error
 *   - db.exec()            postcondition: exec-no-rollback-error
 *   - db.backup()          postconditions: backup-unhandled-rejection, backup-directory-missing
 *   - new Database()       postconditions: database-file-must-exist-error, database-directory-missing-error
 *   - db.transaction()     postconditions: transaction-async-function-error, transaction-inner-exception-rollback
 *   - stmt.iterate()       postcondition: iterate-deferred-execution-error
 *
 * Key insight: better-sqlite3 is synchronous except for backup(). All statement
 * methods throw SqliteError directly (not rejected promises). Error handling = try/catch.
 * backup() is the only method returning a Promise.
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. Database.backup() — async, only method that returns a Promise
// ─────────────────────────────────────────────────────────────────────────────

export async function backupNoCatch(destPath: string) {
  // SHOULD_FIRE: backup-unhandled-rejection — backup() returns a Promise with no await+try/catch, no .catch()
  db.backup(destPath);
}

export async function backupWithCatch(destPath: string) {
  try {
    // SHOULD_NOT_FIRE: backup() awaited inside try/catch
    await db.backup(destPath);
  } catch (err) {
    console.error('Backup failed:', err);
    throw err;
  }
}

export async function backupWithCatchCallback(destPath: string) {
  // SHOULD_NOT_FIRE: backup() with .catch() handler
  await db.backup(destPath).catch((err: Error) => {
    console.error('Backup failed:', err);
    throw err;
  });
}

export async function backupMissingDirectory() {
  try {
    // SHOULD_NOT_FIRE: backup() inside try/catch — directory missing is caught
    await db.backup('/nonexistent/dir/backup.db');
  } catch (err) {
    console.error('Backup directory missing:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. new Database() constructor
// ─────────────────────────────────────────────────────────────────────────────

export function openDatabaseFileMustExistNoCatch(dbPath: string): Database.Database {
  // SHOULD_FIRE: database-file-must-exist-error — fileMustExist: true but no try/catch; throws SqliteError if file missing
  return new Database(dbPath, { fileMustExist: true });
}

export function openDatabaseFileMustExistWithCatch(dbPath: string): Database.Database | null {
  try {
    // SHOULD_NOT_FIRE: constructor inside try/catch
    return new Database(dbPath, { fileMustExist: true });
  } catch (err) {
    console.error('Database file not found:', err);
    return null;
  }
}

export function openDatabaseNoOptions(dbPath: string): Database.Database {
  // SHOULD_NOT_FIRE: no fileMustExist option; will create if missing
  return new Database(dbPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. db.transaction() — callable transaction wrapper
// ─────────────────────────────────────────────────────────────────────────────

export function transactionNoCatch() {
  const insertMany = db.transaction((emails: string[]) => {
    const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
    for (const email of emails) {
      stmt.run(email);
    }
  });
  // SHOULD_FIRE: transaction-inner-exception-rollback — transaction invocation without try/catch; SqliteError propagates on constraint violation
  insertMany(['a@example.com', 'a@example.com']); // duplicate will throw
}

export function transactionWithCatch() {
  const insertMany = db.transaction((emails: string[]) => {
    const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
    for (const email of emails) {
      stmt.run(email);
    }
  });
  try {
    // SHOULD_NOT_FIRE: transaction invocation inside try/catch
    insertMany(['a@example.com', 'b@example.com']);
  } catch (err) {
    console.error('Transaction failed (rolled back):', err);
  }
}

export function transactionAsyncFunctionError() {
  // SHOULD_FIRE: transaction-async-function-error — passing async function to transaction() throws TypeError on invocation
  const badTransaction = db.transaction(async (email: string) => {
    db.prepare('INSERT INTO users (email) VALUES (?)').run(email);
  });
  badTransaction('test@example.com'); // throws: "Transaction function cannot return a promise"
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Statement.iterate() — lazy iterator, deferred error surface
// ─────────────────────────────────────────────────────────────────────────────

export function iterateNoCatch(): unknown[] {
  const rows: unknown[] = [];
  // SHOULD_FIRE: iterate-deferred-execution-error — iterate() consumed in for...of without try/catch wrapping the loop
  for (const row of allStmt.iterate()) {
    rows.push(row);
  }
  return rows;
}

export function iterateWithCatch(): unknown[] {
  const rows: unknown[] = [];
  try {
    // SHOULD_NOT_FIRE: for...of loop consuming iterator is inside try/catch
    for (const row of allStmt.iterate()) {
      rows.push(row);
    }
  } catch (err) {
    console.error('Iteration failed:', err);
  }
  return rows;
}

export function iterateCatchOnlyAtCallSite(): unknown[] {
  const rows: unknown[] = [];
  // NOTE: catching at iterate() call site but NOT around the for...of loop —
  // errors during iteration will still propagate uncaught.
  // This pattern is incorrect but hard to statically detect without full data-flow.
  // SHOULD_FIRE: iterate-deferred-execution-error — try/catch does not wrap the for...of iteration loop
  const iter = allStmt.iterate();
  for (const row of iter) {
    rows.push(row);
  }
  return rows;
}
