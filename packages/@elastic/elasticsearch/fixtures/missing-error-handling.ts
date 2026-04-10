/**
 * @elastic/elasticsearch — Missing Error Handling Fixtures
 *
 * All functions in this file call Elasticsearch methods WITHOUT try-catch.
 * verify-cli should report ERROR violations for each function.
 */

import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
  auth: { apiKey: 'test-key' },
});

// ─── search ──────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * search() makes an HTTP request and throws on connection or HTTP errors.
 */
export async function searchMissingErrorHandling(indexName: string, query: object) {
  // should trigger violation
  const result = await client.search({
    index: indexName,
    query: query as any,
  });
  return result.hits.hits;
}

// ─── index ───────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * index() writes a document and throws on version conflicts and HTTP errors.
 */
export async function indexDocumentMissingErrorHandling(
  indexName: string,
  id: string,
  document: object
) {
  // should trigger violation
  const result = await client.index({ index: indexName, id, document });
  return result._id;
}

// ─── get ─────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * get() throws ResponseError(404) when document not found — not just a connection error.
 */
export async function getDocumentMissingErrorHandling(indexName: string, id: string) {
  // should trigger violation
  const doc = await client.get({ index: indexName, id });
  return doc._source;
}

// ─── delete ──────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * delete() throws on 404 (document absent) and connection errors.
 */
export async function deleteDocumentMissingErrorHandling(indexName: string, id: string) {
  // should trigger violation
  await client.delete({ index: indexName, id });
}

// ─── update ──────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * update() throws on 404 (document not found) and 409 (version conflict).
 */
export async function updateDocumentMissingErrorHandling(
  indexName: string,
  id: string,
  partialDoc: object
) {
  // should trigger violation
  const result = await client.update({ index: indexName, id, doc: partialDoc });
  return result.result;
}

// ─── bulk ────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * bulk() throws on connection/HTTP failure for the request itself.
 */
export async function bulkIndexMissingErrorHandling(
  indexName: string,
  documents: object[]
) {
  const operations = documents.flatMap(doc => [
    { index: { _index: indexName } },
    doc,
  ]);
  // should trigger violation
  const response = await client.bulk({ operations });
  return response.items.length;
}
