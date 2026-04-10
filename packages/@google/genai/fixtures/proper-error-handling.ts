import { GoogleGenAI, ApiError } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Demonstrates PROPER error handling for ai.models.generateContent.
 * Should NOT trigger any violations.
 */
async function generateContentWithErrorHandling() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Tell me about error handling in TypeScript.",
    });
    return response.text;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Gemini API error:", error.status, error.message);
      if (error.status === 429) {
        throw new Error("Rate limited — retry later");
      }
    }
    throw error;
  }
}

/**
 * Demonstrates PROPER error handling for ai.models.generateContentStream.
 * Should NOT trigger any violations.
 */
async function generateContentStreamWithErrorHandling() {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: "Write a poem about the ocean.",
    });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.text ?? "";
    }
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Streaming error:", error.status, error.message);
    }
    throw error;
  }
}

/**
 * Demonstrates PROPER error handling for ai.models.generateImages.
 * Should NOT trigger any violations.
 */
async function generateImagesWithErrorHandling() {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: "A sunset over the mountains",
      config: { numberOfImages: 1 },
    });
    return response.generatedImages;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Image generation error:", error.status, error.message);
    }
    throw error;
  }
}

/**
 * Demonstrates PROPER error handling for ai.models.embedContent.
 * Should NOT trigger any violations.
 */
async function embedContentWithErrorHandling() {
  try {
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ role: "user", parts: [{ text: "Hello world" }] }],
    });
    return result.embeddings?.[0]?.values ?? [];
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Embedding error:", error.status, error.message);
    }
    throw error;
  }
}
