import { sql, createPool } from '@vercel/postgres';

// ✅ Proper: sql query with try-catch
async function queryWithErrorHandling() {
  try {
    const { rows } = await sql`SELECT * FROM users WHERE id = ${123}`;
    return rows;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ✅ Proper: Connection cleanup in finally
async function withPoolConnection() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    client.release(); // ✅ Always release
  }
}

export { queryWithErrorHandling, withPoolConnection };
