import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(/* connection */);

// ❌ Missing error handling
async function queryWithoutErrorHandling() {
  const users = await db.select().from(usersTable);
  return users;
}

async function insertWithoutErrorHandling() {
  await db.insert(usersTable).values({ name: 'John', email: 'john@example.com' });
}

async function updateWithoutErrorHandling() {
  await db.update(usersTable).set({ name: 'Jane' }).where(eq(usersTable.id, 1));
}

export { queryWithoutErrorHandling, insertWithoutErrorHandling, updateWithoutErrorHandling };
