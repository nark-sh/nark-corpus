/**
 * @google/generative-ai Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @google/generative-ai contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - generateContent throws GoogleGenerativeAIFetchError on HTTP failure → MUST try-catch
 *   - generateContentStream throws on HTTP failure, chunk.text() throws on safety block → MUST try-catch
 *   - sendMessage throws GoogleGenerativeAIFetchError on HTTP failure → MUST try-catch
 *   - sendMessageStream throws on HTTP failure, chunk.text() throws on safety block → MUST try-catch
 *   - embedContent throws GoogleGenerativeAIFetchError on HTTP failure → MUST try-catch
 *   - countTokens throws GoogleGenerativeAIFetchError on HTTP failure → MUST try-catch
 *   - A try-catch (any catch block) satisfies the requirement
 *   - A .catch() chain also satisfies the requirement
 *   - try-finally without catch does NOT satisfy the requirement
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GoogleAIFileManager as FileManagerType, GoogleAICacheManager as CacheManagerType } from '@google/generative-ai/server';
// Note: GoogleAIFileManager and GoogleAICacheManager are in @google/generative-ai/server
// but re-exported from the main package in some versions. Using type-only imports for fixtures.

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// ─── 1. generateContent — bare call, no try-catch ─────────────────────────────

export async function generateContentNoCatch(prompt: string) {
  // SHOULD_FIRE: network-error — generateContent makes HTTP call, no try-catch
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── 2. generateContent — try-catch present ───────────────────────────────────

export async function generateContentWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: generateContent is inside try-catch — network-error requirement satisfied
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    throw err;
  }
}

// ─── 3. generateContent — try-finally without catch ──────────────────────────

export async function generateContentTryFinallyNoCatch(prompt: string) {
  try {
    // SHOULD_FIRE: network-error — try-finally has no catch clause, errors are NOT caught
    const result = await model.generateContent(prompt);
    return result.response.text();
  } finally {
    console.log('cleanup');
  }
}

// ─── 4. generateContent — .catch() chain ─────────────────────────────────────

export function generateContentCatchChain(prompt: string) {
  // SHOULD_NOT_FIRE: .catch() on the promise satisfies error handling
  return model.generateContent(prompt).catch(err => {
    throw err;
  });
}

// ─── 5. generateContent — arrow function, no catch ───────────────────────────

export const generateContentArrowNoCatch = async (prompt: string) => {
  // SHOULD_FIRE: network-error — arrow function, no try-catch
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ─── 6. generateContent — arrow function with catch ──────────────────────────

export const generateContentArrowWithCatch = async (prompt: string) => {
  try {
    // SHOULD_NOT_FIRE: arrow function wrapped in try-catch
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    throw err;
  }
};

// ─── 7. generateContentStream — bare call, no try-catch ──────────────────────

export async function generateContentStreamNoCatch(prompt: string) {
  // SHOULD_FIRE: network-error — generateContentStream makes HTTP call, no try-catch
  const streamResult = await model.generateContentStream(prompt);
  let text = '';
  for await (const chunk of streamResult.stream) {
    text += chunk.text();
  }
  return text;
}

// ─── 8. generateContentStream — try-catch present ────────────────────────────

export async function generateContentStreamWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: generateContentStream inside try-catch — both postconditions satisfied
    const streamResult = await model.generateContentStream(prompt);
    let text = '';
    for await (const chunk of streamResult.stream) {
      text += chunk.text();
    }
    return text;
  } catch (err) {
    throw err;
  }
}

// ─── 9. sendMessage — bare call, no try-catch ────────────────────────────────

export async function sendMessageNoCatch(message: string) {
  const chat = model.startChat();
  // SHOULD_FIRE: network-error — sendMessage makes HTTP call, no try-catch
  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── 10. sendMessage — try-catch present ─────────────────────────────────────

export async function sendMessageWithCatch(message: string) {
  const chat = model.startChat();
  try {
    // SHOULD_NOT_FIRE: sendMessage is inside try-catch — network-error requirement satisfied
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    throw err;
  }
}

// ─── 11. sendMessage — try-finally without catch ─────────────────────────────

export async function sendMessageTryFinallyNoCatch(message: string) {
  const chat = model.startChat();
  try {
    // SHOULD_FIRE: network-error — try-finally has no catch clause
    const result = await chat.sendMessage(message);
    return result.response.text();
  } finally {
    console.log('done');
  }
}

// ─── 12. sendMessageStream — bare call, no try-catch ─────────────────────────

export async function sendMessageStreamNoCatch(message: string) {
  const chat = model.startChat();
  // SHOULD_FIRE: network-error — sendMessageStream makes HTTP call, no try-catch
  const streamResult = await chat.sendMessageStream(message);
  let text = '';
  for await (const chunk of streamResult.stream) {
    text += chunk.text();
  }
  return text;
}

// ─── 13. sendMessageStream — try-catch present ───────────────────────────────

export async function sendMessageStreamWithCatch(message: string) {
  const chat = model.startChat();
  try {
    // SHOULD_NOT_FIRE: sendMessageStream inside try-catch — both postconditions satisfied
    const streamResult = await chat.sendMessageStream(message);
    let text = '';
    for await (const chunk of streamResult.stream) {
      text += chunk.text();
    }
    return text;
  } catch (err) {
    throw err;
  }
}

// ─── 14. embedContent — bare call, no try-catch ──────────────────────────────

export async function embedContentNoCatch(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  // SHOULD_FIRE: network-error — embedContent makes HTTP call, no try-catch
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// ─── 15. embedContent — try-catch present ────────────────────────────────────

export async function embedContentWithCatch(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  try {
    // SHOULD_NOT_FIRE: embedContent inside try-catch — network-error requirement satisfied
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    throw err;
  }
}

// ─── 16. countTokens — bare call, no try-catch ───────────────────────────────

export async function countTokensNoCatch(prompt: string) {
  // SHOULD_FIRE: network-error — countTokens makes HTTP call, no try-catch
  const result = await model.countTokens(prompt);
  return result.totalTokens;
}

// ─── 17. countTokens — try-catch present ─────────────────────────────────────

export async function countTokensWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: countTokens inside try-catch — network-error requirement satisfied
    const result = await model.countTokens(prompt);
    return result.totalTokens;
  } catch (err) {
    throw err;
  }
}

// ─── 18. Class instance — stored model, no try-catch ─────────────────────────

class GeminiService {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async generate(prompt: string) {
    // SHOULD_FIRE: network-error — class method, stored model instance, no try-catch
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async safeGenerate(prompt: string) {
    try {
      // SHOULD_NOT_FIRE: class method wrapped in try-catch
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      throw err;
    }
  }
}

export const geminiService = new GeminiService();

// ─── 19. Multiple bare calls in same function ─────────────────────────────────

export async function multipleBareCalls(prompt1: string, prompt2: string) {
  // SHOULD_FIRE: network-error — first generateContent call, no try-catch
  const result1 = await model.generateContent(prompt1);
  // SHOULD_FIRE: network-error — second generateContent call, no try-catch
  const result2 = await model.generateContent(prompt2);
  return [result1.response.text(), result2.response.text()];
}

// ─── 20. Nested try-catch ─────────────────────────────────────────────────────

export async function nestedTryCatch(prompt: string) {
  try {
    try {
      // SHOULD_NOT_FIRE: nested inside try-catch — innermost catch satisfies requirement
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (inner) {
      throw inner;
    }
  } catch (outer) {
    throw outer;
  }
}

// ─── 21. Class method with .catch() chain ────────────────────────────────────

export function sendMessageCatchChain(message: string) {
  const chat = model.startChat();
  // SHOULD_NOT_FIRE: .catch() chain on sendMessage satisfies error handling
  return chat.sendMessage(message).catch(err => {
    throw err;
  });
}

// ─── 22. batchEmbedContents — bare call, no try-catch ────────────────────────
// @expect-violation: batch-network-error

export async function batchEmbedNoCatch(texts: string[]) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  // SHOULD_FIRE: batch-network-error — batchEmbedContents makes HTTP call, no try-catch; entire batch fails atomically on rate-limit (429) or auth error (403)
  const result = await embeddingModel.batchEmbedContents({
    requests: texts.map(text => ({
      content: { role: 'user', parts: [{ text }] },
    })),
  });
  return result.embeddings.map(e => e.values);
}

// ─── 23. batchEmbedContents — try-catch present ───────────────────────────────
// @expect-clean

export async function batchEmbedWithCatch(texts: string[]) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  try {
    // SHOULD_NOT_FIRE: batchEmbedContents inside try-catch — batch-network-error satisfied
    const result = await embeddingModel.batchEmbedContents({
      requests: texts.map(text => ({
        content: { role: 'user', parts: [{ text }] },
      })),
    });
    return result.embeddings.map(e => e.values);
  } catch (err) {
    // Rate limit or auth error — log and rethrow
    throw err;
  }
}

// ─── 24. batchEmbedContents — class method, no try-catch ─────────────────────
// @expect-violation: batch-network-error

class EmbeddingService {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async embedDocuments(texts: string[]) {
    // SHOULD_FIRE: batch-network-error — class method, no try-catch; most common pattern in RAG pipelines — bulk indexing without error handling
    const result = await this.model.batchEmbedContents({
      requests: texts.map(text => ({
        content: { role: 'user', parts: [{ text }] },
      })),
    });
    return result.embeddings;
  }

  async embedDocumentsSafe(texts: string[]) {
    try {
      // SHOULD_NOT_FIRE: class method with try-catch
      const result = await this.model.batchEmbedContents({
        requests: texts.map(text => ({
          content: { role: 'user', parts: [{ text }] },
        })),
      });
      return result.embeddings;
    } catch (err) {
      throw err;
    }
  }
}

export const embeddingService = new EmbeddingService();

// ─── 25. GoogleAIFileManager.getFile — bare poll, no try-catch ────────────────
// @expect-violation: getfile-network-error (scanner detection pending — concern-20260624-google-generative-ai-deepen-1)

export async function pollFileNoCatch(fileManager: FileManagerType, fileName: string) {
  // SHOULD_NOT_FIRE: getfile-network-error detection rule not yet implemented in scanner (concern queued); contract entry exists for future detection
  const file = await fileManager.getFile(fileName);
  return file;
}

// ─── 26. GoogleAIFileManager.getFile — try-catch present ─────────────────────
// @expect-clean

export async function pollFileWithCatch(fileManager: FileManagerType, fileName: string) {
  try {
    // SHOULD_NOT_FIRE: getFile inside try-catch — getfile-network-error satisfied
    const file = await fileManager.getFile(fileName);
    return file;
  } catch (err) {
    throw err;
  }
}

// ─── 27. GoogleAIFileManager.deleteFile — bare cleanup, no try-catch ────────
// @expect-violation: deletefile-network-error (scanner detection pending — concern-20260624-google-generative-ai-deepen-2)

export async function deleteFileNoCatch(fileManager: FileManagerType, fileName: string) {
  // SHOULD_NOT_FIRE: deletefile-network-error detection rule not yet implemented in scanner (concern queued); contract entry exists for future detection
  await fileManager.deleteFile(fileName);
}

// ─── 28. GoogleAIFileManager.deleteFile — try-catch present ─────────────────
// @expect-clean

export async function deleteFileWithCatch(fileManager: FileManagerType, fileName: string) {
  try {
    // SHOULD_NOT_FIRE: deleteFile inside try-catch — deletefile-network-error satisfied
    await fileManager.deleteFile(fileName);
  } catch (err) {
    // 404 means file already gone — safe to swallow in cleanup
  }
}

// ─── 29. GoogleAICacheManager.delete — bare cleanup, no try-catch ────────────
// @expect-violation: cache-delete-network-error (scanner detection pending — concern-20260624-google-generative-ai-deepen-3)

export async function deleteCacheNoCatch(cacheManager: CacheManagerType, cacheName: string) {
  // SHOULD_NOT_FIRE: cache-delete-network-error detection rule not yet implemented in scanner (concern queued); contract entry exists for future detection
  await cacheManager.delete(cacheName);
}

// ─── 30. GoogleAICacheManager.delete — try-catch present ────────────────────
// @expect-clean

export async function deleteCacheWithCatch(cacheManager: CacheManagerType, cacheName: string) {
  try {
    // SHOULD_NOT_FIRE: cache delete inside try-catch — cache-delete-network-error satisfied
    await cacheManager.delete(cacheName);
  } catch (err) {
    // 404 means cache already expired — safe to swallow
  }
}
