/**
 * Proper error handling for @libsql/client.
 * All calls are wrapped in try-catch.
 * Should produce ZERO violations.
 */
import { LibsqlError, createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ✅ execute with try-catch
async function addTodoWithProperHandling(description: string) {
  try {
    await db.execute({
      sql: 'INSERT INTO todos (description) VALUES (?)',
      args: [description],
    });
  } catch (error) {
    if (error instanceof LibsqlError) {
      console.error('Database error:', error.message, 'code:', error.code);
    }
    throw error;
  }
}

// ✅ SELECT with try-catch
async function getTodosWithProperHandling() {
  try {
    const { rows } = await db.execute('SELECT * FROM todos ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    throw error;
  }
}

// ✅ DELETE with try-catch
async function deleteTodoWithProperHandling(id: string) {
  try {
    await db.execute({
      sql: 'DELETE FROM todos WHERE id = ?',
      args: [id],
    });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    throw error;
  }
}

// ✅ batch with try-catch
async function batchInsertWithProperHandling(items: string[]) {
  try {
    await db.batch(
      items.map((item) => ({
        sql: 'INSERT INTO items (name) VALUES (?)',
        args: [item],
      })),
      'write'
    );
  } catch (error) {
    console.error('Batch insert failed:', error);
    throw error;
  }
}

// ✅ execute with .catch() — valid alternative
async function fetchUsersWithCatch() {
  return db
    .execute('SELECT * FROM users')
    .catch((error) => {
      console.error('Query failed:', error);
      throw error;
    });
}
