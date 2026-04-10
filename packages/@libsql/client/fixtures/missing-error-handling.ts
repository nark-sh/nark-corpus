/**
 * Missing error handling for @libsql/client.
 * Calls are NOT wrapped in try-catch.
 * Should produce ERROR violations.
 */
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ❌ INSERT without try-catch — SHOULD FIRE
export const addTodo = async (description: string) => {
  await db.execute({
    sql: 'INSERT INTO todos (description) VALUES (?)',
    args: [description],
  });
};

// ❌ SELECT without try-catch — SHOULD FIRE
async function getTodosWithoutErrorHandling() {
  const { rows } = await db.execute('SELECT * FROM todos');
  return rows;
}

// ❌ DELETE without try-catch — SHOULD FIRE
export const removeTodo = async (id: string) => {
  await db.execute({
    sql: 'DELETE FROM todos WHERE id = ?',
    args: [id],
  });
};

// ❌ batch without try-catch — SHOULD FIRE
async function batchInsertWithoutErrorHandling(items: string[]) {
  await db.batch(
    items.map((item) => ({
      sql: 'INSERT INTO items (name) VALUES (?)',
      args: [item],
    })),
    'write'
  );
}

// ❌ UPDATE without try-catch — SHOULD FIRE
async function updateUserWithoutErrorHandling(id: string, name: string) {
  const result = await db.execute({
    sql: 'UPDATE users SET name = ? WHERE id = ?',
    args: [name, id],
  });
  return result.rowsAffected;
}
