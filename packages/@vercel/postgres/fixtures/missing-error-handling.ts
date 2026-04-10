import { sql, createPool } from '@vercel/postgres';

// ❌ Missing try-catch on sql query
async function queryWithoutErrorHandling() {
  const { rows } = await sql`SELECT * FROM users WHERE id = ${123}`;
  return rows;
}

// ❌ Missing connection cleanup
async function withoutConnectionCleanup() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();
  
  const result = await client.query('SELECT * FROM products');
  // ❌ client.release() never called
  return result.rows;
}

// ❌ No error handling on insert
async function insertWithoutErrorHandling() {
  await sql`INSERT INTO users (name, email) VALUES (${'John'}, ${'john@example.com'})`;
}

export { queryWithoutErrorHandling, withoutConnectionCleanup, insertWithoutErrorHandling };
