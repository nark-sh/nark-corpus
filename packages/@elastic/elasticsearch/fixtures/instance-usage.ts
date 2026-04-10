/**
 * @elastic/elasticsearch — Instance Usage Fixtures
 *
 * Tests that verify-cli detects violations through instance-based usage
 * (Client instances passed around between functions and classes).
 *
 * Both cases with and without error handling are included.
 */

import { Client, errors } from '@elastic/elasticsearch';

// ─── Class-based instance tracking ───────────────────────────────────────────

class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
  }

  /**
   * Missing error handling on instance method — should trigger violation.
   */
  async search(indexName: string, query: object) {
    // should trigger violation — no try-catch on this.client.search()
    const result = await this.client.search({
      index: indexName,
      query: query as any,
    });
    return result.hits.hits;
  }

  /**
   * Missing error handling on instance method — should trigger violation.
   */
  async indexDocument(indexName: string, id: string, doc: object) {
    // should trigger violation — no try-catch on this.client.index()
    await this.client.index({ index: indexName, id, document: doc });
  }

  /**
   * Proper: instance method with try-catch — should NOT trigger violation.
   */
  async getDocument(indexName: string, id: string) {
    try {
      const doc = await this.client.get({ index: indexName, id });
      return doc._source;
    } catch (err) {
      if (err instanceof errors.ResponseError && err.meta.statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Missing error handling on delete — should trigger violation.
   */
  async deleteDocument(indexName: string, id: string) {
    // should trigger violation
    await this.client.delete({ index: indexName, id });
  }

  /**
   * Proper: bulk with try-catch — should NOT trigger violation.
   */
  async bulkIndex(indexName: string, docs: object[]) {
    const operations = docs.flatMap(doc => [
      { index: { _index: indexName } },
      doc,
    ]);
    try {
      const response = await this.client.bulk({ operations });
      if (response.errors) {
        console.warn('Some bulk operations failed');
      }
    } catch (err) {
      console.error('Bulk failed:', err);
      throw err;
    }
  }
}

// ─── Factory function pattern ─────────────────────────────────────────────────

function createElasticsearchClient() {
  return new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    maxRetries: 3,
  });
}

const esClient = createElasticsearchClient();

/**
 * Missing error handling on factory-created instance — should trigger violation.
 */
export async function searchViaFactoryClient(query: object) {
  // should trigger violation
  const result = await esClient.search({ index: 'products', query: query as any });
  return result.hits.hits;
}

/**
 * Proper: factory-created instance with try-catch — should NOT trigger violation.
 */
export async function searchViaFactoryClientSafe(query: object) {
  try {
    const result = await esClient.search({ index: 'products', query: query as any });
    return result.hits.hits;
  } catch (err) {
    console.error('Search error:', err);
    throw err;
  }
}

export { SearchService };
