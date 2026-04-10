/**
 * Proper error handling for @pinecone-database/pinecone.
 * All index operations are wrapped in try-catch. Should produce 0 violations.
 */
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index('my-index');

// ✅ upsert with try-catch
async function upsertVectors(embedding: number[]) {
  try {
    await index.upsert([
      { id: 'doc-1', values: embedding, metadata: { text: 'hello world' } },
    ]);
  } catch (error) {
    console.error('Failed to upsert vector:', error);
    throw error;
  }
}

// ✅ query with try-catch
async function queryVectors(queryEmbedding: number[]) {
  try {
    const results = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });
    return results.matches;
  } catch (error) {
    console.error('Failed to query index:', error);
    throw error;
  }
}

// ✅ deleteOne with try-catch
async function deleteDocument(id: string) {
  try {
    await index.deleteOne(id);
  } catch (error) {
    console.error('Failed to delete vector:', error);
    throw error;
  }
}

// ✅ deleteMany with try-catch
async function deleteDocuments(ids: string[]) {
  try {
    await index.deleteMany(ids);
  } catch (error) {
    console.error('Failed to delete vectors:', error);
    throw error;
  }
}

// ✅ fetch with try-catch
async function fetchVectors(ids: string[]) {
  try {
    const result = await index.fetch(ids);
    return result.records;
  } catch (error) {
    console.error('Failed to fetch vectors:', error);
    return {};
  }
}

// ✅ listIndexes with try-catch
async function listAvailableIndexes() {
  try {
    const indexes = await pinecone.listIndexes();
    return indexes.indexes ?? [];
  } catch (error) {
    console.error('Failed to list indexes:', error);
    return [];
  }
}

// ✅ .catch() handler is also valid
async function queryWithCatch(queryEmbedding: number[]) {
  const results = await index
    .query({ vector: queryEmbedding, topK: 5 })
    .catch((error) => {
      console.error('Query failed:', error);
      return { matches: [] };
    });
  return results.matches;
}

// ✅ namespace usage with try-catch
async function upsertToNamespace(embedding: number[], ns: string) {
  const nsIndex = index.namespace(ns);
  try {
    await nsIndex.upsert([{ id: 'doc-1', values: embedding }]);
  } catch (error) {
    console.error('Failed to upsert to namespace:', error);
    throw error;
  }
}
