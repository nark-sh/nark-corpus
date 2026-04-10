/**
 * Proper error handling for better-sqlite3.
 * All statement executions wrapped in try/catch.
 * Should produce 0 violations.
 */
import Database from 'better-sqlite3';

const db = new Database(':memory:');

db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)');

// Proper: stmt.run() wrapped in try/catch
function insertUser(email: string): boolean {
  const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
  try {
    stmt.run(email);
    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if ((error as NodeJS.ErrnoException).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error('Duplicate email:', email);
        return false;
      }
    }
    throw error;
  }
}

// Proper: stmt.get() wrapped in try/catch
function getUserByEmail(email: string): unknown {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  try {
    return stmt.get(email);
  } catch (error) {
    console.error('Failed to query user:', error);
    throw error;
  }
}

// Proper: stmt.all() wrapped in try/catch
function getAllUsers(): unknown[] {
  const stmt = db.prepare('SELECT * FROM users');
  try {
    return stmt.all();
  } catch (error) {
    console.error('Failed to list users:', error);
    throw error;
  }
}

// Proper: db.exec() wrapped in try/catch
function runMigration(sql: string): void {
  try {
    db.exec(sql);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
