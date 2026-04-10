/**
 * @neondatabase/serverless Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - Pool.query() and Client.query() can throw NeonDbError → try-catch required (severity: error)
 *   - Pool.connect() and Client.connect() can throw NeonDbError → try-catch required (severity: error)
 *   - Pool.end() and Client.end() can throw → try-catch recommended (severity: warning)
 *   - A try-catch wrapper (any catch block) satisfies the requirement
 *   - try-finally WITHOUT catch does NOT satisfy the requirement for error-severity postconditions
 *
 * Contracted functions: query (neon-db-error), connect (connection-error), end (close-error)
 */

import { Pool, Client, neon } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─────────────────────────────────────────────────────────────────────────────
// 1. Pool.query — bare calls (no try-catch)
// ─────────────────────────────────────────────────────────────────────────────

export async function barePoolQueryNoCatch() {
  // SHOULD_FIRE: neon-db-error — pool.query can throw NeonDbError, no try-catch
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
}

export async function barePoolQueryWithParamsNoCatch(userId: string) {
  // SHOULD_FIRE: neon-db-error — pool.query can throw NeonDbError, no try-catch
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

export async function barePoolQueryInsertNoCatch(name: string, email: string) {
  // SHOULD_FIRE: neon-db-error — pool.query insert can throw NeonDbError on unique violation, no try-catch
  await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Pool.query — properly wrapped (should NOT fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function poolQueryWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: neon-db-error — pool.query wrapped in try-catch
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

export async function poolQueryInOuterTryCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: neon-db-error — outer try-catch covers pool.query
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pool.connect — bare calls
// ─────────────────────────────────────────────────────────────────────────────

export async function barePoolConnectNoCatch() {
  // SHOULD_FIRE: connection-error — pool.connect can throw NeonDbError, no try-catch
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT 1');
    return result.rows;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pool.connect — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function poolConnectWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: connection-error — pool.connect wrapped in try-catch
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1');
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Connect failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Client.connect — bare calls
// ─────────────────────────────────────────────────────────────────────────────

export async function bareClientConnectNoCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  // SHOULD_FIRE: connection-error — client.connect can throw NeonDbError, no try-catch
  await client.connect();
  const result = await client.query('SELECT 1');
  await client.end();
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Client.connect — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function clientConnectWithTryCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    // SHOULD_NOT_FIRE: connection-error — client.connect wrapped in try-catch
    await client.connect();
    const result = await client.query('SELECT 1');
    return result.rows;
  } catch (error) {
    console.error('Client connect failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Client.query — bare calls
// ─────────────────────────────────────────────────────────────────────────────

export async function bareClientQueryNoCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
  } catch (e) { throw e; }
  // SHOULD_FIRE: neon-db-error — client.query outside try-catch
  const result = await client.query('SELECT * FROM products');
  await client.end();
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Client.query — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function clientQueryWithTryCatch() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    // SHOULD_NOT_FIRE: neon-db-error — client.query wrapped in try-catch
    const result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    await client.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. try-finally without catch (NOT sufficient for error-severity)
// ─────────────────────────────────────────────────────────────────────────────

export async function poolQueryFinallyNoCatch() {
  let result;
  try {
    // SHOULD_FIRE: neon-db-error — try-finally without catch does not satisfy error-severity postcondition
    result = await pool.query('SELECT * FROM sessions');
  } finally {
    // cleanup only
  }
  return result?.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Class instance patterns
// ─────────────────────────────────────────────────────────────────────────────

class DbService {
  private pool: Pool;
  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  async getAll() {
    // SHOULD_FIRE: neon-db-error — this.pool.query with no try-catch
    const result = await this.pool.query('SELECT * FROM items');
    return result.rows;
  }

  // SHOULD_NOT_FIRE: neon-db-error — this.pool.query wrapped in try-catch
  async getById(id: string) {
    try {
      const result = await this.pool.query('SELECT * FROM items WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    } catch {
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. neon() tagged template — bare calls (no try-catch)
// ─────────────────────────────────────────────────────────────────────────────

const sqlFn = neon(process.env.DATABASE_URL || '');

export async function neonTaggedTemplateBareNoCatch() {
  // SHOULD_FIRE: neon-db-error — tagged template sql`...` can throw NeonDbError, no try-catch
  const rows = await sqlFn`SELECT * FROM users`;
  return rows;
}

export async function neonTaggedTemplateWithParamsNoCatch(id: string) {
  // SHOULD_FIRE: neon-db-error — tagged template with params can throw NeonDbError, no try-catch
  const rows = await sqlFn`SELECT * FROM users WHERE id = ${id}`;
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. neon() tagged template — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function neonTaggedTemplateWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: neon-db-error — tagged template wrapped in try-catch
    const rows = await sqlFn`SELECT * FROM users`;
    return rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}
