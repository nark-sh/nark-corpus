/**
 * Ground-truth fixture for @pinecone-database/pinecone.
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited method call.
 *
 * Postcondition IDs:
 *   upsert-no-error-handling
 *   query-no-error-handling
 *   fetch-no-error-handling
 *   deleteone-no-error-handling
 *   deletemany-no-error-handling
 *   listindexes-no-error-handling
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
