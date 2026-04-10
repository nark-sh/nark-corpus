/**
 * @neondatabase/serverless — Instance Usage Fixtures
 *
 * Tests detection via class instances (Pool, Client) passed around as
 * variables or stored on class fields.
 */

import { Pool, Client } from '@neondatabase/serverless';

// ─────────────────────────────────────────────────────────────────────────────
// Pool instance stored on class
// ─────────────────────────────────────────────────────────────────────────────

class DatabaseService {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  // ❌ No try-catch — should trigger violation
  async getUsers() {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows;
  }

  // ✅ Proper error handling — should NOT trigger violation
  async getUserById(id: string) {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  // ❌ connect without try-catch
  async connectAndQuery() {
    const client = await this.pool.connect();
    const result = await client.query('SELECT 1');
    client.release();
    return result.rows;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pool passed as parameter
// ─────────────────────────────────────────────────────────────────────────────

// ❌ No try-catch on the passed-in pool
async function fetchWithPool(pool: Pool, tableName: string) {
  const result = await pool.query(`SELECT * FROM ${tableName}`);
  return result.rows;
}

// ✅ Proper handling on passed-in pool
async function safelyFetchWithPool(pool: Pool, userId: string) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client instance
// ─────────────────────────────────────────────────────────────────────────────

class DirectClientService {
  private client: Client;

  constructor(connectionString: string) {
    this.client = new Client({ connectionString });
  }

  // ❌ No try-catch on connect
  async initialize() {
    await this.client.connect();
  }

  // ❌ No try-catch on query
  async runQuery(sql: string) {
    const result = await this.client.query(sql);
    return result.rows;
  }

  // ✅ Proper error handling
  async safeQuery(sql: string, params: unknown[]) {
    try {
      const result = await this.client.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  // ✅ Proper end handling
  async close() {
    try {
      await this.client.end();
    } catch (error) {
      console.error('Close failed:', error);
    }
  }
}
