/**
 * Proper error handling for @planetscale/database.
 * All calls are wrapped in try-catch.
 * Should produce ZERO violations.
 */
import { Client, DatabaseError, connect } from '@planetscale/database';

const client = new Client({ url: process.env.DATABASE_URL! });

// ✅ connect + execute with try-catch
async function fetchUserWithProperHandling(userId: string) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  try {
    const { rows } = await conn.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return rows;
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error('Database error:', error.message, 'status:', error.status);
    }
    throw error;
  }
}

// ✅ Client-based execute with try-catch
async function fetchProductsWithProperHandling() {
  const conn = client.connection();
  try {
    const { rows } = await conn.execute('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

// ✅ transaction with try-catch
async function createOrderWithProperHandling(userId: string, itemId: string) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  try {
    await conn.transaction(async (tx) => {
      await tx.execute('INSERT INTO orders (user_id) VALUES (?)', [userId]);
      await tx.execute('UPDATE inventory SET count = count - 1 WHERE id = ?', [itemId]);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ✅ execute with .catch() — valid alternative
async function fetchWithCatch(query: string) {
  const conn = connect({ url: process.env.DATABASE_URL! });
  return conn.execute(query).catch((error) => {
    console.error('Query failed:', error);
    throw error;
  });
}

// ✅ Client.execute with try-catch
async function insertUserWithProperHandling(name: string, email: string) {
  const conn = client.connection();
  try {
    const result = await conn.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return result;
  } catch (error) {
    if (error instanceof DatabaseError) {
      // Handle duplicate email (MySQL error code 1062)
      if (error.body?.code === 'ALREADY_EXISTS') {
        throw new Error('Email already in use');
      }
    }
    throw error;
  }
}
