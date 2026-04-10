/**
 * @elastic/elasticsearch — Proper Error Handling Fixtures
 *
 * All functions in this file wrap Elasticsearch client calls in try-catch.
 * verify-cli should report ZERO violations for this file.
 */

import { Client, errors } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
  auth: { apiKey: 'test-key' },
});

// ─── search ──────────────────────────────────────────────────────────────────

/**
 * Proper: search wrapped in try-catch with typed error handling.
 */
export async function searchWithErrorHandling(indexName: string, query: object) {
  try {
    const result = await client.search({
      index: indexName,
      query: query as any,
    });
    return result.hits.hits;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      console.error('Search failed (HTTP):', err.meta.statusCode, err.message);
    } else if (err instanceof errors.ConnectionError) {
      console.error('Search failed (network):', err.message);
    } else if (err instanceof errors.TimeoutError) {
      console.error('Search timed out:', err.message);
    }
    throw err;
  }
}

/**
 * Proper: search with generic catch — still satisfies try-catch requirement.
 */
export async function searchWithGenericCatch(indexName: string) {
  try {
    const result = await client.search({ index: indexName, query: { match_all: {} } });
    return result.hits.total;
  } catch (err) {
    console.error('Search error:', err);
    throw err;
  }
}

// ─── index ───────────────────────────────────────────────────────────────────

/**
 * Proper: document indexing wrapped in try-catch.
 */
export async function indexDocumentWithErrorHandling(
  indexName: string,
  id: string,
  document: object
) {
  try {
    const result = await client.index({
      index: indexName,
      id,
      document,
    });
    return result._id;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if (err.meta.statusCode === 409) {
        console.error('Version conflict on index:', id);
      } else {
        console.error('Index failed (HTTP):', err.meta.statusCode);
      }
    }
    throw err;
  }
}

// ─── get ─────────────────────────────────────────────────────────────────────

/**
 * Proper: get with 404 handling — document may not exist.
 */
export async function getDocumentWithErrorHandling(indexName: string, id: string) {
  try {
    const doc = await client.get({ index: indexName, id });
    return doc._source;
  } catch (err) {
    if (err instanceof errors.ResponseError && err.meta.statusCode === 404) {
      return null; // Document not found — expected, return null
    }
    throw err;
  }
}

// ─── delete ──────────────────────────────────────────────────────────────────

/**
 * Proper: delete with try-catch, handling 404 for idempotent delete.
 */
export async function deleteDocumentWithErrorHandling(indexName: string, id: string) {
  try {
    await client.delete({ index: indexName, id });
  } catch (err) {
    if (err instanceof errors.ResponseError && err.meta.statusCode === 404) {
      // Already deleted — idempotent behavior
      return;
    }
    throw err;
  }
}

// ─── update ──────────────────────────────────────────────────────────────────

/**
 * Proper: update wrapped in try-catch with version conflict handling.
 */
export async function updateDocumentWithErrorHandling(
  indexName: string,
  id: string,
  partialDoc: object
) {
  try {
    const result = await client.update({
      index: indexName,
      id,
      doc: partialDoc,
    });
    return result.result;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if (err.meta.statusCode === 404) {
        console.error('Document not found for update:', id);
      } else if (err.meta.statusCode === 409) {
        console.error('Version conflict on update:', id);
      }
    }
    throw err;
  }
}

// ─── bulk ────────────────────────────────────────────────────────────────────

/**
 * Proper: bulk with try-catch AND per-item error checking.
 */
export async function bulkIndexWithErrorHandling(
  indexName: string,
  documents: Array<{ id: string; data: object }>
) {
  const operations = documents.flatMap(({ id, data }) => [
    { index: { _index: indexName, _id: id } },
    data,
  ]);

  try {
    const response = await client.bulk({ operations });

    // Must check response.errors — bulk resolves even if items fail
    if (response.errors) {
      const failed = response.items
        .filter(item => item.index?.error)
        .map(item => item.index?.error);
      console.error('Bulk partial failures:', failed);
    }

    return response.items.length;
  } catch (err) {
    // Connection/HTTP failure for the bulk request itself
    console.error('Bulk request failed:', err);
    throw err;
  }
}
