/**
 * Proper knex Error Handling
 * Should produce 0 violations
 */

import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

// ✅ Try-catch around select
async function getUsers() {
  try {
    const users = await db('users').select('*');
    return users;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ✅ Try-catch around insert
async function createUser(data: any) {
  try {
    const [id] = await db('users').insert(data).returning('id');
    return id;
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
}

// ✅ Transaction with error handling
async function transferFunds(from: number, to: number, amount: number) {
  try {
    await db.transaction(async (trx) => {
      await trx('accounts').where({ id: from }).decrement('balance', amount);
      await trx('accounts').where({ id: to }).increment('balance', amount);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ✅ Cleanup on shutdown
process.on('SIGTERM', async () => {
  await db.destroy();
});

export { getUsers, createUser, transferFunds };
