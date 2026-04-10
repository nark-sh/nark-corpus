/**
 * Fixture: proper-error-handling.ts
 *
 * Demonstrates CORRECT error handling for algoliasearch (v4 and v5).
 * All async Algolia operations are wrapped in try/catch.
 * Should produce ZERO violations.
 */

// ============================================================
// V4 API — index-based pattern
// ============================================================

import algoliasearch from 'algoliasearch';

const client4 = algoliasearch('APP_ID', 'API_KEY');
const index = client4.initIndex('products');

interface Product {
  objectID: string;
  name: string;
  price: number;
}

/**
 * Search with proper error handling (v4)
 */
async function searchProductsV4(query: string): Promise<Product[]> {
  try {
    const result = await index.search<Product>(query);
    return result.hits;
  } catch (error) {
    console.error('Algolia search failed:', error);
    return [];
  }
}

/**
 * Save single object with proper error handling (v4)
 */
async function indexProductV4(product: Product): Promise<void> {
  try {
    await index.saveObject(product);
  } catch (error) {
    console.error('Failed to index product:', product.objectID, error);
    throw error;
  }
}

/**
 * Save multiple objects with proper error handling (v4)
 */
async function bulkIndexProductsV4(products: Product[]): Promise<void> {
  try {
    await index.saveObjects(products);
  } catch (error) {
    console.error('Bulk indexing failed:', error);
    throw error;
  }
}

/**
 * Get object with proper error handling (v4) — handles 404
 */
async function getProductV4(objectID: string): Promise<Product | null> {
  try {
    const product = await index.getObject<Product>(objectID);
    return product;
  } catch (error: any) {
    if (error.status === 404 || error.name === 'ObjectNotFoundError') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete object with proper error handling (v4)
 */
async function deleteProductV4(objectID: string): Promise<void> {
  try {
    await index.deleteObject(objectID);
  } catch (error) {
    console.error('Failed to delete from index:', objectID, error);
    throw error;
  }
}

/**
 * Delete multiple objects with proper error handling (v4)
 */
async function deleteProductsV4(objectIDs: string[]): Promise<void> {
  try {
    await index.deleteObjects(objectIDs);
  } catch (error) {
    console.error('Bulk delete from index failed:', error);
    throw error;
  }
}

/**
 * Update settings with proper error handling (v4)
 */
async function updateIndexSettingsV4(): Promise<void> {
  try {
    await index.setSettings({
      searchableAttributes: ['name'],
      attributesForFaceting: ['price'],
    });
  } catch (error) {
    console.error('Failed to update index settings:', error);
    throw error;
  }
}

// ============================================================
// V5 API — client-based pattern
// ============================================================

import { algoliasearch as algoliasearchV5 } from 'algoliasearch';

const client5 = algoliasearchV5('APP_ID', 'API_KEY');

/**
 * Search with proper error handling (v5)
 */
async function searchProductsV5(query: string): Promise<any[]> {
  try {
    const result = await client5.searchSingleIndex({
      indexName: 'products',
      searchParams: { query },
    });
    return result.hits;
  } catch (error) {
    console.error('Algolia search failed:', error);
    return [];
  }
}

/**
 * Save single object with proper error handling (v5)
 */
async function indexProductV5(product: Product): Promise<void> {
  try {
    await client5.saveObject({
      indexName: 'products',
      body: product,
    });
  } catch (error) {
    console.error('Failed to index product:', error);
    throw error;
  }
}

/**
 * Save multiple objects with proper error handling (v5)
 */
async function bulkIndexProductsV5(products: Product[]): Promise<void> {
  try {
    await client5.saveObjects({
      indexName: 'products',
      objects: products,
    });
  } catch (error) {
    console.error('Bulk indexing failed:', error);
    throw error;
  }
}

/**
 * Get object with proper error handling (v5) — handles 404
 */
async function getProductV5(objectID: string): Promise<any | null> {
  try {
    const product = await client5.getObject({
      indexName: 'products',
      objectID,
    });
    return product;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete object with proper error handling (v5)
 */
async function deleteProductV5(objectID: string): Promise<void> {
  try {
    await client5.deleteObject({
      indexName: 'products',
      objectID,
    });
  } catch (error) {
    console.error('Failed to delete from index:', error);
    throw error;
  }
}

/**
 * Wait for task with proper error handling (v5)
 */
async function waitForIndexingV5(taskID: number): Promise<void> {
  try {
    await client5.waitForTask({
      indexName: 'products',
      taskID,
    });
  } catch (error) {
    console.error('Task wait failed:', error);
    throw error;
  }
}

/**
 * Set settings with proper error handling (v5)
 */
async function updateIndexSettingsV5(): Promise<void> {
  try {
    await client5.setSettings({
      indexName: 'products',
      indexSettings: {
        searchableAttributes: ['name'],
      },
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * Replace all objects with proper error handling (v5)
 */
async function replaceAllProductsV5(products: Product[]): Promise<void> {
  try {
    await client5.replaceAllObjects({
      indexName: 'products',
      objects: products,
    });
  } catch (error) {
    console.error('Replace all objects failed:', error);
    throw error;
  }
}

/**
 * Multi-search with proper error handling (v5)
 */
async function multiSearchV5(): Promise<any> {
  try {
    const results = await client5.search({
      requests: [
        { indexName: 'products', query: 'laptop' },
        { indexName: 'products', query: 'phone' },
      ],
    });
    return results;
  } catch (error) {
    console.error('Multi-search failed:', error);
    throw error;
  }
}

export {
  searchProductsV4,
  indexProductV4,
  bulkIndexProductsV4,
  getProductV4,
  deleteProductV4,
  deleteProductsV4,
  updateIndexSettingsV4,
  searchProductsV5,
  indexProductV5,
  bulkIndexProductsV5,
  getProductV5,
  deleteProductV5,
  waitForIndexingV5,
  updateIndexSettingsV5,
  replaceAllProductsV5,
  multiSearchV5,
};
