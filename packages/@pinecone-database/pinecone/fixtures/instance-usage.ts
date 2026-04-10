/**
 * Instance-based usage patterns for @pinecone-database/pinecone.
 * Tests detection via class instances, class properties, and service patterns.
 */
import { Pinecone } from '@pinecone-database/pinecone';

// ❌ Class with Pinecone index as property — no try-catch
class VectorStore {
  private pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  private index = this.pinecone.index('my-index');

  async addDocument(id: string, values: number[]) {
    // ❌ Missing try-catch on instance method call
    await this.index.upsert([{ id, values }]);
  }

  async search(queryVector: number[]) {
    // ❌ Missing try-catch
    const results = await this.index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });
    return results.matches;
  }

  async remove(id: string) {
    // ❌ Missing try-catch
    await this.index.deleteOne(id);
  }
}

// ✅ Class with proper error handling
class SafeVectorStore {
  private pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  private index = this.pinecone.index('safe-index');

  async addDocument(id: string, values: number[]) {
    try {
      await this.index.upsert([{ id, values }]);
    } catch (error) {
      console.error('Upsert failed:', error);
      throw error;
    }
  }

  async search(queryVector: number[]) {
    try {
      const results = await this.index.query({
        vector: queryVector,
        topK: 5,
      });
      return results.matches;
    } catch (error) {
      console.error('Query failed:', error);
      return [];
    }
  }
}

// ❌ Service function that receives index via parameter — should still detect
async function storeEmbedding(
  pineconeClient: Pinecone,
  indexName: string,
  id: string,
  values: number[]
) {
  const idx = pineconeClient.index(indexName);
  // ❌ Missing try-catch
  await idx.upsert([{ id, values }]);
}

// ❌ Inline chain: pinecone.index().upsert() without try-catch
async function inlineChain(embedding: number[]) {
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  // ❌ Missing try-catch on chained call
  await client.index('docs').upsert([{ id: 'doc-1', values: embedding }]);
}

// ✅ Inline chain WITH try-catch
async function safeInlineChain(embedding: number[]) {
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  try {
    await client.index('docs').upsert([{ id: 'doc-1', values: embedding }]);
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}
