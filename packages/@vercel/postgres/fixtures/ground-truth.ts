/**
 * Ground-truth test fixtures for @vercel/postgres
 *
 * Annotations:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                           — scanner MUST NOT flag this
 *
 * Deepened: 2026-04-17 (pass 1)
 * New postconditions: createpool-missing-connection-string, createpool-wrong-connection-string-type,
 *   createclient-missing-connection-string, createclient-pooled-connection-string,
 *   createclient-query-before-connect, pool-end-not-awaited, pool-end-queries-after-shutdown,
 *   client-end-not-called
 */

import { createPool, createClient, sql } from '@vercel/postgres';

// ---------------------------------------------------------------------------
// createPool() — missing connection string
// ---------------------------------------------------------------------------

// @expect-violation: createpool-missing-connection-string
// @expect-violation: sql-query-no-error-handling
async function queryWithImplicitPoolNoEnv() {
  // ❌ createPool() called without env var set — throws VercelPostgresError('missing_connection_string')
  // ❌ Also missing try-catch
  const pool = createPool();
  const { rows } = await pool.sql`SELECT * FROM users`;
  return rows;
}

// @expect-clean
async function queryWithExplicitConnectionString() {
  // ✅ Connection string provided explicitly — createPool() succeeds
  try {
    const pool = createPool({ connectionString: process.env.POSTGRES_URL! });
    const { rows } = await pool.sql`SELECT * FROM users`;
    return rows;
  } catch (error) {
    console.error('Pool query failed:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// createClient() — query before connect()
// ---------------------------------------------------------------------------

// @expect-violation: createclient-query-before-connect
// @expect-violation: client-end-not-called
async function queryClientWithoutConnect() {
  // ❌ No client.connect() called before query
  // ❌ No client.end() called — connection leaked even if it worked
  const client = createClient({ connectionString: process.env.POSTGRES_URL_NON_POOLING! });
  const { rows } = await client.sql`SELECT * FROM users`;
  return rows;
}

// @expect-clean
async function queryClientWithProperLifecycle() {
  // ✅ Proper: connect() → query → end() in finally
  const client = createClient({ connectionString: process.env.POSTGRES_URL_NON_POOLING! });
  try {
    await client.connect();
    const { rows } = await client.sql`SELECT * FROM users`;
    return rows;
  } catch (error) {
    console.error('Client query failed:', error);
    throw error;
  } finally {
    await client.end(); // ✅ Always end in finally
  }
}

// ---------------------------------------------------------------------------
// client.end() — not called (connection leak)
// ---------------------------------------------------------------------------

// @expect-violation: client-end-not-called
async function leakDirectConnection() {
  // ❌ client.end() never called — connection leaked
  const client = createClient({ connectionString: process.env.POSTGRES_URL_NON_POOLING! });
  try {
    await client.connect();
    const { rows } = await client.query('SELECT * FROM products');
    return rows;
    // ❌ client.end() missing — if query succeeds, connection is never closed
  } catch (error) {
    console.error('Error:', error);
    throw error;
    // ❌ client.end() also missing in catch path
  }
}

// @expect-violation: client-end-not-called
async function leakDirectConnectionOnError() {
  // ❌ client.end() only in try, not in finally — leaked if query throws
  const client = createClient({ connectionString: process.env.POSTGRES_URL_NON_POOLING! });
  await client.connect();
  const { rows } = await client.query('SELECT * FROM products');
  await client.end(); // unreachable if query above throws
  return rows;
}

// @expect-clean
async function properClientEndInFinally() {
  // ✅ client.end() in finally — always called regardless of success/failure
  const client = createClient({ connectionString: process.env.POSTGRES_URL_NON_POOLING! });
  try {
    await client.connect();
    const { rows } = await client.query('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  } finally {
    await client.end(); // ✅
  }
}

// ---------------------------------------------------------------------------
// pool.end() — not awaited / queries after shutdown
// ---------------------------------------------------------------------------

// @expect-violation: pool-end-no-error-handling
async function poolEndNotAwaited() {
  // ❌ pool.end() not awaited — connections may not close cleanly
  const pool = createPool({ connectionString: process.env.POSTGRES_URL! });
  const { rows } = await pool.sql`SELECT 1`;
  pool.end(); // ❌ not awaited
  return rows;
}

// @expect-clean
async function poolEndAwaited() {
  // ✅ pool.end() awaited in finally
  const pool = createPool({ connectionString: process.env.POSTGRES_URL! });
  try {
    const { rows } = await pool.sql`SELECT 1`;
    return rows;
  } catch (error) {
    throw error;
  } finally {
    await pool.end(); // ✅
  }
}

export {
  queryWithImplicitPoolNoEnv,
  queryWithExplicitConnectionString,
  queryClientWithoutConnect,
  queryClientWithProperLifecycle,
  leakDirectConnection,
  leakDirectConnectionOnError,
  properClientEndInFinally,
  poolEndNotAwaited,
  poolEndAwaited,
};
