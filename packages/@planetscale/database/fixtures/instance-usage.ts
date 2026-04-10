/**
 * Instance-based usage patterns for @planetscale/database.
 * Tests detection via class instances and module-level singletons.
 */
import { Client, connect } from '@planetscale/database';

// Module-level client singleton (common pattern)
const db = new Client({ url: process.env.DATABASE_URL! });

// ❌ Module-level client, execute without try-catch — SHOULD FIRE
async function getUser(id: string) {
  const conn = db.connection();
  const { rows } = await conn.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

// ✅ Module-level client, execute with try-catch — SHOULD NOT FIRE
async function getUserSafe(id: string) {
  const conn = db.connection();
  try {
    const { rows } = await conn.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// Class-based service (common in NestJS/service layer)
class UserRepository {
  private conn = connect({ url: process.env.DATABASE_URL! });

  // ❌ execute without try-catch — SHOULD FIRE
  async findAll() {
    const { rows } = await this.conn.execute('SELECT * FROM users');
    return rows;
  }

  // ✅ execute with try-catch — SHOULD NOT FIRE
  async findById(id: string) {
    try {
      const { rows } = await this.conn.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] ?? null;
    } catch (error) {
      console.error('Database error in findById:', error);
      throw error;
    }
  }

  // ❌ transaction without try-catch — SHOULD FIRE
  async createWithProfile(name: string, email: string) {
    await this.conn.transaction(async (tx) => {
      await tx.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
      await tx.execute('INSERT INTO profiles (user_name) VALUES (?)', [name]);
    });
  }
}
