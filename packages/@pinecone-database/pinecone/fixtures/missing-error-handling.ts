/**
 * Missing error handling for @pinecone-database/pinecone.
 * All index operations lack try-catch. Should produce multiple ERROR violations.
 */
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index('my-index');

// ❌ upsert without try-catch — violation
async function upsertVectors(embedding: number[]) {
  await index.upsert([
    { id: 'doc-1', values: embedding, metadata: { text: 'hello' } },
  ]);
}

// ❌ query without try-catch — violation
async function queryVectors(queryEmbedding: number[]) {
  const results = await index.query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
  });
  return results.matches;
}

// ❌ deleteOne without try-catch — violation
async function deleteDocument(id: string) {
  await index.deleteOne(id);
}

// ❌ deleteMany without try-catch — violation
async function deleteDocuments(ids: string[]) {
  await index.deleteMany(ids);
}

// ❌ fetch without try-catch — violation
async function fetchVectors(ids: string[]) {
  const result = await index.fetch(ids);
  return result.records;
}

// ❌ listIndexes without try-catch — violation
async function listAvailableIndexes() {
  const indexes = await pinecone.listIndexes();
  return indexes.indexes ?? [];
}

// ❌ Real-world pattern from Quill/similar apps — typical RAG setup
async function processDocument(text: string, embedding: number[], docId: string) {
  // Store embedding — no error handling
  await index.upsert([{ id: docId, values: embedding, metadata: { text } }]);
  console.log('Document stored');
}

// ❌ Querying in API route without try-catch — very common antipattern
async function searchDocuments(queryVector: number[]) {
  const results = await index.query({
    vector: queryVector,
    topK: 5,
    includeMetadata: true,
  });
  return results.matches?.map(m => m.metadata?.text) ?? [];
}
