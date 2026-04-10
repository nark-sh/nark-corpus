/**
 * Missing error handling for @planetscale/database.
 * Calls are NOT wrapped in try-catch.
 * Should produce ERROR violations.
 */
import { Client, connect } from '@planetscale/database';

const client = new Client({ url: process.env.DATABASE_URL! });

// ❌ connect + execute without try-catch — SHOULD FIRE
async function fetchUserWithoutErrorHandling(userId: string) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  const { rows } = await conn.execute(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  return rows;
}

// ❌ Client-based execute without try-catch — SHOULD FIRE
async function fetchProductsWithoutErrorHandling() {
  const conn = client.connection();
  const { rows } = await conn.execute('SELECT * FROM products');
  return rows;
}

// ❌ transaction without try-catch — SHOULD FIRE
async function createOrderWithoutErrorHandling(userId: string, itemId: string) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  await conn.transaction(async (tx) => {
    await tx.execute('INSERT INTO orders (user_id) VALUES (?)', [userId]);
    await tx.execute('UPDATE inventory SET count = count - 1 WHERE id = ?', [itemId]);
  });
}

// ❌ execute in API route handler without try-catch — SHOULD FIRE
export async function GET(request: Request) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  const { rows } = await conn.execute('SELECT * FROM posts ORDER BY created_at DESC');
  return Response.json(rows);
}

// ❌ execute with assignment without try-catch — SHOULD FIRE
async function deleteUserWithoutErrorHandling(userId: string) {
  const conn = client.connection();
  const result = await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
  return result.rowsAffected;
}
