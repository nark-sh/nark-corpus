/**
 * Fixture: missing-error-handling.ts
 *
 * Demonstrates INCORRECT error handling for algoliasearch.
 * All async Algolia operations are missing try/catch.
 * Should produce MULTIPLE ERROR violations.
 */

import algoliasearch from 'algoliasearch';
import { algoliasearch as algoliasearchV5 } from 'algoliasearch';

const client4 = algoliasearch('APP_ID', 'API_KEY');
const index = client4.initIndex('products');
const client5 = algoliasearchV5('APP_ID', 'API_KEY');

interface Product {
  objectID: string;
  name: string;
  price: number;
}

// ============================================================
// V4 API — missing try/catch
// ============================================================

/**
 * ❌ Missing error handling — search can throw ApiError/RetryError
 * Violation: search-no-try-catch
 */
async function searchProductsV4Missing(query: string): Promise<any[]> {
  const result = await index.search(query);
  return result.hits;
}

/**
 * ❌ Missing error handling — saveObject throws on auth/network errors
 * Violation: saveObject-no-try-catch
 */
async function indexProductV4Missing(product: Product): Promise<void> {
  await index.saveObject(product);
}

/**
 * ❌ Missing error handling — saveObjects throws on auth/network/413 errors
 * Violation: saveObjects-no-try-catch
 */
async function bulkIndexProductsV4Missing(products: Product[]): Promise<void> {
  await index.saveObjects(products);
}

/**
 * ❌ Missing error handling — getObject throws 404 when object doesn't exist
 * Violation: getObject-no-try-catch
 */
async function getProductV4Missing(objectID: string): Promise<any> {
  const product = await index.getObject(objectID);
  return product;
}

/**
 * ❌ Missing error handling — deleteObject throws on auth/network errors
 * Violation: deleteObject-no-try-catch
 */
async function deleteProductV4Missing(objectID: string): Promise<void> {
  await index.deleteObject(objectID);
}

/**
 * ❌ Missing error handling — deleteObjects throws on auth/network errors
 * Violation: deleteObjects-no-try-catch
 */
async function deleteProductsV4Missing(objectIDs: string[]): Promise<void> {
  await index.deleteObjects(objectIDs);
}

/**
 * ❌ Missing error handling — setSettings throws on invalid settings/auth
 * Violation: setSettings-no-try-catch
 */
async function updateIndexSettingsV4Missing(): Promise<void> {
  await index.setSettings({
    searchableAttributes: ['name'],
  });
}

// ============================================================
// V5 API — missing try/catch
// ============================================================

/**
 * ❌ Missing error handling — searchSingleIndex throws
 * Violation: searchSingleIndex-no-try-catch
 */
async function searchProductsV5Missing(query: string): Promise<any[]> {
  const result = await client5.searchSingleIndex({
    indexName: 'products',
    searchParams: { query },
  });
  return result.hits;
}

/**
 * ❌ Missing error handling — saveObject throws
 * Violation: saveObject-no-try-catch
 */
async function indexProductV5Missing(product: Product): Promise<void> {
  await client5.saveObject({
    indexName: 'products',
    body: product,
  });
}

/**
 * ❌ Missing error handling — saveObjects throws
 * Violation: saveObjects-no-try-catch
 */
async function bulkIndexProductsV5Missing(products: Product[]): Promise<void> {
  await client5.saveObjects({
    indexName: 'products',
    objects: products,
  });
}

/**
 * ❌ Missing error handling — getObject throws 404
 * Violation: getObject-no-try-catch
 */
async function getProductV5Missing(objectID: string): Promise<any> {
  const product = await client5.getObject({
    indexName: 'products',
    objectID,
  });
  return product;
}

/**
 * ❌ Missing error handling — deleteObject throws
 * Violation: deleteObject-no-try-catch
 */
async function deleteProductV5Missing(objectID: string): Promise<void> {
  await client5.deleteObject({
    indexName: 'products',
    objectID,
  });
}

/**
 * ❌ Missing error handling — waitForTask throws
 * Violation: waitForTask-no-try-catch
 */
async function waitForTaskV5Missing(taskID: number): Promise<void> {
  await client5.waitForTask({
    indexName: 'products',
    taskID,
  });
}

/**
 * ❌ Missing error handling — setSettings throws
 * Violation: setSettings-no-try-catch
 */
async function updateIndexSettingsV5Missing(): Promise<void> {
  await client5.setSettings({
    indexName: 'products',
    indexSettings: { searchableAttributes: ['name'] },
  });
}

/**
 * ❌ Missing error handling — replaceAllObjects throws
 * Violation: replaceAllObjects-no-try-catch
 */
async function replaceAllProductsV5Missing(products: Product[]): Promise<void> {
  await client5.replaceAllObjects({
    indexName: 'products',
    objects: products,
  });
}

/**
 * ❌ Missing error handling — multi-search throws
 * Violation: search-no-try-catch
 */
async function multiSearchV5Missing(): Promise<any> {
  const results = await client5.search({
    requests: [{ indexName: 'products', query: 'laptop' }],
  });
  return results;
}

export {
  searchProductsV4Missing,
  indexProductV4Missing,
  bulkIndexProductsV4Missing,
  getProductV4Missing,
  deleteProductV4Missing,
  deleteProductsV4Missing,
  updateIndexSettingsV4Missing,
  searchProductsV5Missing,
  indexProductV5Missing,
  bulkIndexProductsV5Missing,
  getProductV5Missing,
  deleteProductV5Missing,
  waitForTaskV5Missing,
  updateIndexSettingsV5Missing,
  replaceAllProductsV5Missing,
  multiSearchV5Missing,
};
