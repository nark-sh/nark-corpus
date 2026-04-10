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
