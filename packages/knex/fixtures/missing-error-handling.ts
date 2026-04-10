/**
 * Missing knex Error Handling
 * Should produce ERROR violations
 */

import knex from 'knex';

const db = knex({ client: 'pg', connection: {} });

// ❌ No try-catch
async function getUsersNoErrorHandling() {
  const users = await db('users').select('*');
  return users;
}

// ❌ No try-catch on insert
async function createUserNoErrorHandling(data: any) {
  const [id] = await db('users').insert(data);
  return id;
}

// ❌ Transaction without error handling
async function transferNoErrorHandling(from: number, to: number, amount: number) {
  await db.transaction(async (trx) => {
    await trx('accounts').where({ id: from }).decrement('balance', amount);
    await trx('accounts').where({ id: to }).increment('balance', amount);
  });
}

// ❌ No destroy() on shutdown
export { getUsersNoErrorHandling, createUserNoErrorHandling, transferNoErrorHandling };
