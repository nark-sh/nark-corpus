/**
 * Instance-based usage patterns for better-sqlite3.
 * Tests detection of prepared statement instances.
 * Should produce violations for unprotected stmt calls.
 */
import Database from 'better-sqlite3';

class UserRepository {
  private db: Database.Database;
  private insertStmt: Database.Statement;
  private findStmt: Database.Statement;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)');
    this.insertStmt = this.db.prepare('INSERT INTO users (email) VALUES (?)');
    this.findStmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
  }

  // VIOLATION: using stored statement instance without try/catch
  insert(email: string): Database.RunResult {
    return this.insertStmt.run(email); // ❌ No try/catch
  }

  // VIOLATION: stored get statement without try/catch
  findById(id: number): unknown {
    return this.findStmt.get(id); // ❌ No try/catch
  }

  // Proper: wrapped in try/catch
  safeInsert(email: string): boolean {
    try {
      this.insertStmt.run(email);
      return true;
    } catch (error) {
      console.error('Insert failed:', error);
      return false;
    }
  }
}
