/**
 * Proper typeorm Error Handling
 * Should produce 0 violations
 */

import { DataSource, Repository } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  database: 'test'
});

// ✅ Initialize with error handling
async function initializeDatabase() {
  try {
    await dataSource.initialize();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// ✅ Try-catch around find
async function findUsers(repo: Repository<any>) {
  try {
    const users = await repo.find();
    return users;
  } catch (error) {
    console.error('Find failed:', error);
    throw error;
  }
}

// ✅ Try-catch around save
async function saveUser(repo: Repository<any>, data: any) {
  try {
    const user = await repo.save(data);
    return user;
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}

// ✅ Transaction with error handling
async function transferWithTransaction() {
  try {
    await dataSource.transaction(async (manager) => {
      // Operations
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ✅ Cleanup
process.on('SIGTERM', async () => {
  await dataSource.destroy();
});

export { initializeDatabase, findUsers, saveUser };
