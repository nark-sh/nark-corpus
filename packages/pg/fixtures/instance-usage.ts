/**
 * PostgreSQL (pg) Fixtures - Instance Usage
 *
 * These examples test detection of pg usage via instances.
 */

import { Client, Pool } from 'pg';

/**
 * Database service class using Pool instance
 */
class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      database: 'myapp',
    });
  }

  /**
   * ❌ Missing try-catch on instance method
   * Should trigger ERROR violation
   */
  async getUser(id: number) {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * ✅ Proper error handling on instance method
   * Should NOT trigger violation
   */
  async getUserSafely(id: number) {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  /**
   * ❌ Missing try-catch for insert
   * Should trigger ERROR violation
   */
  async createUser(name: string, email: string) {
    const result = await this.pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }

  /**
   * ❌ Missing try-catch for update
   * Should trigger ERROR violation
   */
  async updateUser(id: number, name: string) {
    await this.pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
  }
}

/**
 * Repository pattern using Client instance
 */
class UserRepository {
  constructor(private readonly client: Client) {}

  /**
   * ❌ Missing try-catch
   * Should trigger ERROR violation
   */
  async findById(id: number) {
    const result = await this.client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * ✅ With error handling
   * Should NOT trigger violation
   */
  async findByIdSafely(id: number) {
    try {
      const result = await this.client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Find failed:', error);
      return null;
    }
  }

  /**
   * ❌ Missing try-catch for transaction
   * Should trigger ERROR violations
   */
  async createWithProfile(name: string, bio: string) {
    await this.client.query('BEGIN');
    
    const userResult = await this.client.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING id',
      [name]
    );
    const userId = userResult.rows[0].id;
    
    await this.client.query(
      'INSERT INTO profiles (user_id, bio) VALUES ($1, $2)',
      [userId, bio]
    );
    
    await this.client.query('COMMIT');
  }
}

/**
 * Module-level pool instance
 */
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * ❌ Missing try-catch on module-level pool
 * Should trigger ERROR violation
 */
async function getAllUsersWithModulePool() {
  const result = await dbPool.query('SELECT * FROM users');
  return result.rows;
}

/**
 * ❌ Missing try-catch for parameterized query
 * Should trigger ERROR violation
 */
async function findUserByEmailWithModulePool(email: string) {
  const result = await dbPool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}
