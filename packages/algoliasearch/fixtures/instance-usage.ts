/**
 * Fixture: instance-usage.ts
 *
 * Tests detection of algoliasearch usage via instances stored on classes.
 * Covers patterns where the index/client is created in a constructor
 * and used across methods.
 */

import algoliasearch from 'algoliasearch';
import { algoliasearch as algoliasearchV5 } from 'algoliasearch';

interface Product {
  objectID: string;
  name: string;
  price: number;
}

// ============================================================
// V4: Class-based usage — index stored on instance
// ============================================================

class ProductSearchServiceV4 {
  private index: ReturnType<ReturnType<typeof algoliasearch>['initIndex']>;

  constructor() {
    const client = algoliasearch('APP_ID', 'API_KEY');
    this.index = client.initIndex('products');
  }

  /**
   * ✅ Proper error handling — should NOT fire
   */
  async search(query: string): Promise<any[]> {
    try {
      const result = await this.index.search(query);
      return result.hits;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * ❌ Missing error handling — should fire
   */
  async indexProduct(product: Product): Promise<void> {
    await this.index.saveObject(product);
  }

  /**
   * ❌ Missing error handling — should fire
   */
  async removeProduct(objectID: string): Promise<void> {
    await this.index.deleteObject(objectID);
  }

  /**
   * ✅ Proper error handling — should NOT fire
   */
  async getProduct(objectID: string): Promise<Product | null> {
    try {
      const product = await this.index.getObject<Product>(objectID);
      return product;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

// ============================================================
// V5: Class-based usage — client stored on instance
// ============================================================

class ProductSearchServiceV5 {
  private client: ReturnType<typeof algoliasearchV5>;
  private readonly indexName = 'products';

  constructor() {
    this.client = algoliasearchV5('APP_ID', 'API_KEY');
  }

  /**
   * ✅ Proper error handling — should NOT fire
   */
  async search(query: string): Promise<any[]> {
    try {
      const result = await this.client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: { query },
      });
      return result.hits;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * ❌ Missing error handling — should fire
   */
  async indexProduct(product: Product): Promise<void> {
    await this.client.saveObject({
      indexName: this.indexName,
      body: product,
    });
  }

  /**
   * ❌ Missing error handling — should fire
   */
  async bulkIndex(products: Product[]): Promise<void> {
    await this.client.saveObjects({
      indexName: this.indexName,
      objects: products,
    });
  }

  /**
   * ✅ Proper error handling — should NOT fire
   */
  async deleteProduct(objectID: string): Promise<void> {
    try {
      await this.client.deleteObject({
        indexName: this.indexName,
        objectID,
      });
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  /**
   * ❌ Missing error handling — should fire
   */
  async replaceAll(products: Product[]): Promise<void> {
    await this.client.replaceAllObjects({
      indexName: this.indexName,
      objects: products,
    });
  }
}

// ============================================================
// Module-level client — common singleton pattern
// ============================================================

const algoliaClient = algoliasearchV5('APP_ID', 'API_KEY');

/**
 * ❌ Missing error handling — module-level client usage, no try/catch
 */
async function syncProductToAlgolia(product: Product): Promise<void> {
  await algoliaClient.saveObject({
    indexName: 'products',
    body: product,
  });
}

/**
 * ✅ Proper error handling — module-level client usage with try/catch
 */
async function deleteProductFromAlgolia(objectID: string): Promise<void> {
  try {
    await algoliaClient.deleteObject({
      indexName: 'products',
      objectID,
    });
  } catch (error) {
    console.error('Failed to delete from Algolia:', error);
    throw error;
  }
}

export {
  ProductSearchServiceV4,
  ProductSearchServiceV5,
  syncProductToAlgolia,
  deleteProductFromAlgolia,
};
