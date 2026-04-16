/**
 * Ground-truth fixture for @pinecone-database/pinecone.
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited method call.
 *
 * Postcondition IDs (original):
 *   upsert-no-error-handling
 *   query-no-error-handling
 *   fetch-no-error-handling
 *   deleteone-no-error-handling
 *   deletemany-no-error-handling
 *   listindexes-no-error-handling
 *
 * Postcondition IDs (added by deepen pass 2026-04-16):
 *   update-no-error-handling
 *   update-silent-missing-id
 *   createindex-no-error-handling
 *   deleteindex-no-error-handling
 *   inference-embed-no-error-handling
 *   listpaginated-no-error-handling
 *   upsertrecords-no-error-handling
 *   searchrecords-no-error-handling
 *   startimport-no-error-handling
 */
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index('my-index');

// ──────────────────────────────────────────────────
// 1. upsert — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_upsert_missing(embedding: number[]) {
  // SHOULD_FIRE: upsert-no-error-handling — upsert without try-catch
  await index.upsert([{ id: 'doc-1', values: embedding }]);
}

// 1. upsert — with try-catch (SHOULD_NOT_FIRE)
async function gt_upsert_with_try_catch(embedding: number[]) {
  try {
    // SHOULD_NOT_FIRE: upsert has try-catch
    await index.upsert([{ id: 'doc-1', values: embedding }]);
  } catch (error) {
    throw error;
  }
}

// 1. upsert — with .catch() (SHOULD_NOT_FIRE)
async function gt_upsert_with_catch_chain(embedding: number[]) {
  // SHOULD_NOT_FIRE: upsert has .catch() handler
  await index.upsert([{ id: 'doc-1', values: embedding }]).catch((e) => {
    console.error(e);
    throw e;
  });
}

// ──────────────────────────────────────────────────
// 2. query — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_query_missing(queryVector: number[]) {
  // SHOULD_FIRE: query-no-error-handling — query without try-catch
  const result = await index.query({ vector: queryVector, topK: 10, includeMetadata: true });
  return result.matches;
}

// 2. query — with try-catch (SHOULD_NOT_FIRE)
async function gt_query_with_try_catch(queryVector: number[]) {
  try {
    // SHOULD_NOT_FIRE: query has try-catch
    const result = await index.query({ vector: queryVector, topK: 5 });
    return result.matches;
  } catch (error) {
    return [];
  }
}

// ──────────────────────────────────────────────────
// 3. fetch — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_fetch_missing(ids: string[]) {
  // SHOULD_FIRE: fetch-no-error-handling — fetch without try-catch
  const result = await index.fetch(ids);
  return result.records;
}

// 3. fetch — with try-catch (SHOULD_NOT_FIRE)
async function gt_fetch_with_try_catch(ids: string[]) {
  try {
    // SHOULD_NOT_FIRE: fetch has try-catch
    const result = await index.fetch(ids);
    return result.records;
  } catch (error) {
    console.error('Fetch failed:', error);
    return {};
  }
}

// ──────────────────────────────────────────────────
// 4. deleteOne — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteOne_missing(id: string) {
  // SHOULD_FIRE: deleteone-no-error-handling — deleteOne without try-catch
  await index.deleteOne(id);
}

// 4. deleteOne — with try-catch (SHOULD_NOT_FIRE)
async function gt_deleteOne_with_try_catch(id: string) {
  try {
    // SHOULD_NOT_FIRE: deleteOne has try-catch
    await index.deleteOne(id);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. deleteMany — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteMany_missing(ids: string[]) {
  // SHOULD_FIRE: deletemany-no-error-handling — deleteMany without try-catch
  await index.deleteMany(ids);
}

// 5. deleteMany — with try-catch (SHOULD_NOT_FIRE)
async function gt_deleteMany_with_try_catch(ids: string[]) {
  try {
    // SHOULD_NOT_FIRE: deleteMany has try-catch
    await index.deleteMany(ids);
  } catch (error) {
    console.error('Delete many failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. listIndexes — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_listIndexes_missing() {
  // SHOULD_FIRE: listindexes-no-error-handling — listIndexes without try-catch
  const result = await pinecone.listIndexes();
  return result.indexes ?? [];
}

// 6. listIndexes — with try-catch (SHOULD_NOT_FIRE)
async function gt_listIndexes_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: listIndexes has try-catch
    const result = await pinecone.listIndexes();
    return result.indexes ?? [];
  } catch (error) {
    console.error('List indexes failed:', error);
    return [];
  }
}

// ──────────────────────────────────────────────────
// 7. update — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_update_missing(id: string) {
  // SHOULD_FIRE: update-no-error-handling — update without try-catch
  await index.update({ id, metadata: { status: 'processed' } });
}

// 7. update — with try-catch (SHOULD_NOT_FIRE)
async function gt_update_with_try_catch(id: string) {
  try {
    // SHOULD_NOT_FIRE: update has try-catch
    await index.update({ id, metadata: { status: 'processed' } });
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 8. createIndex — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createIndex_missing() {
  // SHOULD_FIRE: createindex-no-error-handling — createIndex without try-catch
  await pinecone.createIndex({
    name: 'my-new-index',
    dimension: 1536,
    metric: 'cosine',
    spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
  });
}

// 8. createIndex — with try-catch (SHOULD_NOT_FIRE)
async function gt_createIndex_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: createIndex has try-catch
    await pinecone.createIndex({
      name: 'my-new-index',
      dimension: 1536,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
      suppressConflicts: true,
    });
  } catch (error) {
    console.error('Create index failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 9. deleteIndex — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteIndex_missing() {
  // SHOULD_FIRE: deleteindex-no-error-handling — deleteIndex without try-catch
  await pinecone.deleteIndex('my-old-index');
}

// 9. deleteIndex — with try-catch (SHOULD_NOT_FIRE)
async function gt_deleteIndex_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: deleteIndex has try-catch
    await pinecone.deleteIndex('my-old-index');
  } catch (error) {
    console.error('Delete index failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 10. inference.embed — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_inferenceEmbed_missing(text: string) {
  // SHOULD_FIRE: inference-embed-no-error-handling — embed without try-catch
  const embeddings = await pinecone.inference.embed({
    model: 'multilingual-e5-large',
    inputs: [text],
    parameters: { inputType: 'passage', truncate: 'END' },
  });
  return embeddings.data[0];
}

// 10. inference.embed — with try-catch (SHOULD_NOT_FIRE)
async function gt_inferenceEmbed_with_try_catch(text: string) {
  try {
    // SHOULD_NOT_FIRE: embed has try-catch
    const embeddings = await pinecone.inference.embed({
      model: 'multilingual-e5-large',
      inputs: [text],
      parameters: { inputType: 'passage', truncate: 'END' },
    });
    return embeddings.data[0];
  } catch (error) {
    console.error('Embedding failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 11. listPaginated — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_listPaginated_missing() {
  // SHOULD_FIRE: listpaginated-no-error-handling — listPaginated without try-catch
  const result = await index.listPaginated({ prefix: 'doc1#' });
  return result.vectors ?? [];
}

// 11. listPaginated — with try-catch (SHOULD_NOT_FIRE)
async function gt_listPaginated_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: listPaginated has try-catch
    const result = await index.listPaginated({ prefix: 'doc1#' });
    return result.vectors ?? [];
  } catch (error) {
    console.error('listPaginated failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 12. upsertRecords — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_upsertRecords_missing() {
  // SHOULD_FIRE: upsertrecords-no-error-handling — upsertRecords without try-catch
  await index.upsertRecords({
    records: [{ id: 'rec1', chunk_text: 'Hello world' }],
  });
}

// 12. upsertRecords — with try-catch (SHOULD_NOT_FIRE)
async function gt_upsertRecords_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: upsertRecords has try-catch
    await index.upsertRecords({
      records: [{ id: 'rec1', chunk_text: 'Hello world' }],
    });
  } catch (error) {
    console.error('upsertRecords failed:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 13. searchRecords — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_searchRecords_missing() {
  // SHOULD_FIRE: searchrecords-no-error-handling — searchRecords without try-catch
  const response = await index.searchRecords({
    query: { inputs: { text: 'disease prevention' }, topK: 4 },
    fields: ['chunk_text'],
  });
  return response.result.hits;
}

// 13. searchRecords — with try-catch (SHOULD_NOT_FIRE)
async function gt_searchRecords_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: searchRecords has try-catch
    const response = await index.searchRecords({
      query: { inputs: { text: 'disease prevention' }, topK: 4 },
      fields: ['chunk_text'],
    });
    return response.result.hits;
  } catch (error) {
    console.error('searchRecords failed:', error);
    return [];
  }
}

// ──────────────────────────────────────────────────
// 14. startImport — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_startImport_missing() {
  // SHOULD_FIRE: startimport-no-error-handling — startImport without try-catch
  const result = await index.startImport({
    uri: 's3://my-bucket/embeddings/',
    errorMode: 'CONTINUE',
  });
  return result.id;
}

// 14. startImport — with try-catch (SHOULD_NOT_FIRE)
async function gt_startImport_with_try_catch() {
  try {
    // SHOULD_NOT_FIRE: startImport has try-catch
    const result = await index.startImport({
      uri: 's3://my-bucket/embeddings/',
      errorMode: 'CONTINUE',
    });
    return result.id;
  } catch (error) {
    console.error('startImport failed:', error);
    throw error;
  }
}
