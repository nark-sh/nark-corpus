import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(/* connection */);

// ✅ Proper error handling
async function queryWithErrorHandling() {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

async function insertWithErrorHandling() {
  try {
    await db.insert(usersTable).values({ name: 'John', email: 'john@example.com' });
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

export { queryWithErrorHandling, insertWithErrorHandling };
