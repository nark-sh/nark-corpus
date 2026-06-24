/**
 * @google/genai Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @google/genai contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - ai.models.generateContent throws ApiError on HTTP failure → MUST try-catch
 *   - ai.models.generateContentStream throws ApiError on HTTP failure → MUST try-catch
 *   - ai.models.generateImages throws ApiError on HTTP failure → MUST try-catch
 *   - ai.models.embedContent throws ApiError on HTTP failure → MUST try-catch
 *   - chat.sendMessage throws ApiError on HTTP failure → MUST try-catch
 *   - chat.sendMessageStream throws ApiError on HTTP failure → MUST try-catch
 *   - ai.files.upload throws ApiError/Error on HTTP failure → MUST try-catch
 *   - ai.models.countTokens throws ApiError on HTTP failure → MUST try-catch
 *   - ai.caches.create throws ApiError on HTTP failure → MUST try-catch
 *   - A try-catch (any catch block) satisfies the requirement
 *   - A .catch() chain also satisfies the requirement
 *   - try-finally without catch does NOT satisfy the requirement
 */

import { GoogleGenAI, ApiError } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ─── 1. generateContent — bare call, no try-catch ────────────────────────────

export async function generateContentNoCatch(prompt: string) {
  // SHOULD_FIRE: genai-generate-content-error — generateContent makes HTTP call, no try-catch
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

// ─── 2. generateContent — try-catch present ──────────────────────────────────

export async function generateContentWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: generateContent is inside try-catch — genai-generate-content-error satisfied
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Gemini error ${error.status}`);
    }
    throw error;
  }
}

// ─── 3. generateContent — try-finally without catch ─────────────────────────

export async function generateContentTryFinallyNoCatch(prompt: string) {
  try {
    // SHOULD_FIRE: genai-generate-content-error — try-finally has no catch clause
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } finally {
    console.log("cleanup");
  }
}

// ─── 4. generateContent — .catch() chain ─────────────────────────────────────

export function generateContentCatchChain(prompt: string) {
  // SHOULD_NOT_FIRE: .catch() on the promise satisfies error handling
  return ai.models
    .generateContent({ model: "gemini-2.0-flash", contents: prompt })
    .catch((error: unknown) => {
      console.error("Error:", error);
      throw error;
    });
}

// ─── 5. generateContentStream — no try-catch ─────────────────────────────────

export async function generateContentStreamNoCatch(prompt: string) {
  // SHOULD_FIRE: genai-generate-content-stream-error — generateContentStream makes HTTP call, no try-catch
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  let result = "";
  for await (const chunk of stream) {
    result += chunk.text ?? "";
  }
  return result;
}

// ─── 6. generateContentStream — try-catch present ────────────────────────────

export async function generateContentStreamWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: generateContentStream is inside try-catch
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.text ?? "";
    }
    return result;
  } catch (error) {
    console.error("Streaming error:", error);
    throw error;
  }
}

// ─── 7. embedContent — no try-catch ──────────────────────────────────────────

export async function embedContentNoCatch(text: string) {
  // SHOULD_FIRE: genai-embed-content-error — embedContent makes HTTP call, no try-catch
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: [{ role: "user", parts: [{ text }] }],
  });
  return result.embeddings?.[0]?.values ?? [];
}

// ─── 8. embedContent — try-catch present ─────────────────────────────────────

export async function embedContentWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: embedContent is inside try-catch
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ role: "user", parts: [{ text }] }],
    });
    return result.embeddings?.[0]?.values ?? [];
  } catch (error) {
    console.error("Embedding error:", error);
    throw error;
  }
}

// ─── 9. generateImages — no try-catch ────────────────────────────────────────

export async function generateImagesNoCatch(prompt: string) {
  // SHOULD_FIRE: genai-generate-images-error — generateImages makes HTTP call, no try-catch
  const response = await ai.models.generateImages({
    model: "imagen-3.0-generate-002",
    prompt,
    config: { numberOfImages: 1 },
  });
  return response.generatedImages;
}

// ─── 10. generateImages — try-catch present ──────────────────────────────────

export async function generateImagesWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: generateImages is inside try-catch
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: { numberOfImages: 1 },
    });
    return response.generatedImages;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}

// ─── 11. chat.sendMessage — no try-catch ─────────────────────────────────────

export async function sendMessageNoCatch(userInput: string) {
  const chat = ai.chats.create({ model: "gemini-2.0-flash" });
  // SHOULD_FIRE: genai-send-message-no-error-handling — sendMessage makes HTTP call, no try-catch
  const response = await chat.sendMessage({ message: userInput });
  return response.text;
}

// ─── 12. chat.sendMessage — try-catch present ────────────────────────────────

export async function sendMessageWithCatch(userInput: string) {
  const chat = ai.chats.create({ model: "gemini-2.0-flash" });
  try {
    // SHOULD_NOT_FIRE: sendMessage is inside try-catch
    const response = await chat.sendMessage({ message: userInput });
    return response.text;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Chat error ${error.status}: ${error.message}`);
    }
    throw error;
  }
}

// ─── 13. chat.sendMessageStream — no try-catch ───────────────────────────────

export async function sendMessageStreamNoCatch(userInput: string) {
  const chat = ai.chats.create({ model: "gemini-2.0-flash" });
  // SHOULD_FIRE: genai-send-message-stream-no-error-handling — sendMessageStream no try-catch
  const stream = await chat.sendMessageStream({ message: userInput });
  let result = "";
  for await (const chunk of stream) {
    result += chunk.text ?? "";
  }
  return result;
}

// ─── 14. chat.sendMessageStream — try-catch present ──────────────────────────

export async function sendMessageStreamWithCatch(userInput: string) {
  const chat = ai.chats.create({ model: "gemini-2.0-flash" });
  try {
    // SHOULD_NOT_FIRE: sendMessageStream is inside try-catch
    const stream = await chat.sendMessageStream({ message: userInput });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.text ?? "";
    }
    return result;
  } catch (error) {
    console.error("Chat streaming error:", error);
    throw error;
  }
}

// ─── 15. ai.files.upload — no try-catch ──────────────────────────────────────

export async function filesUploadNoCatch(filePath: string) {
  // SHOULD_FIRE: genai-files-upload-no-error-handling — upload makes HTTP call, no try-catch
  const file = await ai.files.upload({
    file: filePath,
    config: { mimeType: "text/plain" },
  });
  return file.name;
}

// ─── 16. ai.files.upload — try-catch present ─────────────────────────────────

export async function filesUploadWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: files.upload is inside try-catch
    const file = await ai.files.upload({
      file: filePath,
      config: { mimeType: "text/plain" },
    });
    return file.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new Error("File storage quota exceeded");
    }
    throw error;
  }
}

// ─── 17. ai.models.countTokens — no try-catch ────────────────────────────────

export async function countTokensNoCatch(prompt: string) {
  // SHOULD_FIRE: genai-count-tokens-no-error-handling — countTokens makes HTTP call, no try-catch
  const result = await ai.models.countTokens({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return result.totalTokens;
}

// ─── 18. ai.models.countTokens — try-catch present ───────────────────────────

export async function countTokensWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: countTokens is inside try-catch
    const result = await ai.models.countTokens({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return result.totalTokens;
  } catch (error) {
    console.error("Token count error:", error);
    throw error;
  }
}

// ─── 19. ai.caches.create — no try-catch ─────────────────────────────────────

export async function cachesCreateNoCatch(systemInstruction: string) {
  // SHOULD_FIRE: genai-caches-create-no-error-handling — caches.create makes HTTP call, no try-catch
  const cache = await ai.caches.create({
    model: "gemini-2.5-flash",
    config: {
      contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
      ttl: "3600s",
    },
  });
  return cache.name;
}

// ─── 20. ai.caches.create — try-catch present ────────────────────────────────

export async function cachesCreateWithCatch(systemInstruction: string) {
  try {
    // SHOULD_NOT_FIRE: caches.create is inside try-catch
    const cache = await ai.caches.create({
      model: "gemini-2.5-flash",
      config: {
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
        ttl: "3600s",
      },
    });
    return cache.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      throw new Error("Model does not support caching or content below minimum token threshold");
    }
    throw error;
  }
}

// ─── 21. ai.fileSearchStores.uploadToFileSearchStore — no try-catch ─────────

export async function uploadToFileSearchStoreNoCatch(filePath: string) {
  // SHOULD_FIRE: genai-file-search-stores-upload-error
  const op = await ai.fileSearchStores.uploadToFileSearchStore({
    fileSearchStoreName: "fileSearchStores/foo-bar",
    file: filePath,
    config: { mimeType: "application/pdf" },
  });
  return op.name;
}

// ─── 22. ai.fileSearchStores.uploadToFileSearchStore — try-catch ────────────

export async function uploadToFileSearchStoreWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: uploadToFileSearchStore inside try-catch
    const op = await ai.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: "fileSearchStores/foo-bar",
      file: filePath,
      config: { mimeType: "application/pdf" },
    });
    return op.name;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`RAG upload failed ${error.status}`);
    }
    throw error;
  }
}

// ─── 23. ai.fileSearchStores.importFile — no try-catch ──────────────────────

export async function importFileNoCatch(storeName: string, fileName: string) {
  // SHOULD_FIRE: genai-file-search-stores-import-file-error
  const op = await ai.fileSearchStores.importFile({
    fileSearchStoreName: storeName,
    fileName,
  });
  return op.name;
}

// ─── 24. ai.fileSearchStores.importFile — try-catch ─────────────────────────

export async function importFileWithCatch(storeName: string, fileName: string) {
  try {
    // SHOULD_NOT_FIRE: importFile inside try-catch
    const op = await ai.fileSearchStores.importFile({
      fileSearchStoreName: storeName,
      fileName,
    });
    return op.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error("File search store or source file not found");
    }
    throw error;
  }
}

// ─── 25. ai.tunings.tune — no try-catch ─────────────────────────────────────

export async function tuneNoCatch(gcsUri: string) {
  // SHOULD_FIRE: genai-tunings-tune-error
  const job = await ai.tunings.tune({
    baseModel: "models/gemini-2.0-flash",
    trainingDataset: { gcsUri },
    config: { tunedModelDisplayName: "my-tuned-model" },
  });
  return job.name;
}

// ─── 26. ai.tunings.tune — try-catch present ────────────────────────────────

export async function tuneWithCatch(gcsUri: string) {
  try {
    // SHOULD_NOT_FIRE: tune inside try-catch
    const job = await ai.tunings.tune({
      baseModel: "models/gemini-2.0-flash",
      trainingDataset: { gcsUri },
      config: { tunedModelDisplayName: "my-tuned-model" },
    });
    return job.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new Error("Fine-tuning quota exceeded or permission denied");
    }
    throw error;
  }
}

// ─── 27. ai.batches.createEmbeddings — no try-catch ─────────────────────────

export async function createEmbeddingsNoCatch(inputFileName: string) {
  // SHOULD_FIRE: genai-batches-create-embeddings-error
  const job = await ai.batches.createEmbeddings({
    model: "text-embedding-004",
    src: { fileName: inputFileName },
  });
  return job.name;
}

// ─── 28. ai.batches.createEmbeddings — try-catch present ────────────────────

export async function createEmbeddingsWithCatch(inputFileName: string) {
  try {
    // SHOULD_NOT_FIRE: createEmbeddings inside try-catch
    const job = await ai.batches.createEmbeddings({
      model: "text-embedding-004",
      src: { fileName: inputFileName },
    });
    return job.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      throw new Error("Batch embedding rate limited");
    }
    throw error;
  }
}
