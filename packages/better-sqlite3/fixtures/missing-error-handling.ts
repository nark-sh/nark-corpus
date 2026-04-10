/**
 * Missing error handling for better-sqlite3.
 * Statement executions without try/catch.
 * Should produce ERROR violations for stmt.run() and db.exec() calls.
 */
import Database from 'better-sqlite3';

const db = new Database(':memory:');

// VIOLATION: stmt.run() with no try/catch — SqliteError propagates uncaught
function insertUserUnsafe(email: string): void {
  const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
  stmt.run(email); // ❌ No try/catch — SQLITE_CONSTRAINT_UNIQUE will crash
}

// VIOLATION: stmt.get() with no try/catch
function getUserUnsafe(id: number): unknown {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id); // ❌ No try/catch
}

// VIOLATION: stmt.all() with no try/catch
function getAllUsersUnsafe(): unknown[] {
  const stmt = db.prepare('SELECT * FROM users');
  return stmt.all(); // ❌ No try/catch
}

// VIOLATION: db.exec() with no try/catch — no rollback on failure
function runMigrationUnsafe(sql: string): void {
  db.exec(sql); // ❌ No try/catch — partial execution possible, no rollback
}
