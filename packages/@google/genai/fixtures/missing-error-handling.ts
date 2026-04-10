import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * MISSING error handling for ai.models.generateContent.
 * Should trigger ERROR violation — ApiError will propagate uncaught.
 */
async function generateContentWithoutErrorHandling() {
  // ❌ No try-catch — ApiError will propagate as unhandled exception
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Tell me about error handling in TypeScript.",
  });
  return response.text;
}

/**
 * MISSING error handling for ai.models.generateContentStream.
 * Should trigger ERROR violation.
 */
async function generateContentStreamWithoutErrorHandling() {
  // ❌ No try-catch — ApiError will propagate as unhandled exception
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: "Write a poem.",
  });
  let result = "";
  for await (const chunk of stream) {
    result += chunk.text ?? "";
  }
  return result;
}

/**
 * MISSING error handling for ai.models.generateImages.
 * Should trigger ERROR violation.
 */
async function generateImagesWithoutErrorHandling() {
  // ❌ No try-catch — ApiError will propagate as unhandled exception
  const response = await ai.models.generateImages({
    model: "imagen-3.0-generate-002",
    prompt: "A sunset",
    config: { numberOfImages: 1 },
  });
  return response.generatedImages;
}

/**
 * MISSING error handling for ai.models.embedContent.
 * Should trigger ERROR violation — common antipattern in real codebases.
 */
async function embedContentWithoutErrorHandling() {
  // ❌ No try-catch — ApiError will propagate as unhandled exception
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: [{ role: "user", parts: [{ text: "Hello world" }] }],
  });
  return result.embeddings?.[0]?.values ?? [];
}
