/**
 * Instance-based usage for @libsql/client.
 * Tests detection via module-level singletons and class fields.
 */
import { createClient } from '@libsql/client';

// Module-level singleton (standard pattern)
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ❌ Module-level db, execute without try-catch — SHOULD FIRE
async function getUser(id: string) {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return rows[0];
}

// ✅ Module-level db, execute with try-catch — SHOULD NOT FIRE
async function getUserSafe(id: string) {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    });
    return rows[0];
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// ❌ batch without try-catch — SHOULD FIRE
async function seedDatabase() {
  await db.batch([
    'CREATE TABLE IF NOT EXISTS users (id TEXT, name TEXT)',
    'INSERT INTO users VALUES ("1", "Alice")',
  ], 'write');
}

// Class-based repository
class TodoRepository {
  private client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // ❌ execute without try-catch — SHOULD FIRE
  async add(description: string) {
    await this.client.execute({
      sql: 'INSERT INTO todos (description) VALUES (?)',
      args: [description],
    });
  }

  // ✅ execute with try-catch — SHOULD NOT FIRE
  async remove(id: string) {
    try {
      await this.client.execute({
        sql: 'DELETE FROM todos WHERE id = ?',
        args: [id],
      });
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
