/**
 * Missing typeorm Error Handling
 * Should produce ERROR violations
 */

import { DataSource, Repository } from 'typeorm';

const dataSource = new DataSource({ type: 'postgres' });

// ❌ No error handling
async function initializeNoErrorHandling() {
  await dataSource.initialize();
}

// ❌ No try-catch
async function findNoErrorHandling(repo: Repository<any>) {
  const users = await repo.find();
  return users;
}

// ❌ No try-catch on save
async function saveNoErrorHandling(repo: Repository<any>, data: any) {
  const user = await repo.save(data);
  return user;
}

// ❌ Transaction without error handling
async function transactionNoErrorHandling() {
  await dataSource.transaction(async (manager) => {
    // Operations without error handling
  });
}

export { initializeNoErrorHandling, findNoErrorHandling, saveNoErrorHandling };
