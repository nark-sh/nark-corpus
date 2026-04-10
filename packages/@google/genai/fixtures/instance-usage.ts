import { GoogleGenAI } from "@google/genai";

/**
 * Tests detection of instance-based usage patterns.
 * The ai.models.* calls should be detected via the client instance.
 */
class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Instance method calling generateContent — MISSING try-catch.
   * Should trigger ERROR violation.
   */
  async generateText(prompt: string): Promise<string> {
    // ❌ No try-catch — ApiError propagates uncaught
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text ?? "";
  }

  /**
   * Instance method calling embedContent — MISSING try-catch.
   * Should trigger ERROR violation.
   */
  async getEmbedding(text: string): Promise<number[]> {
    // ❌ No try-catch — ApiError propagates uncaught
    const result = await this.ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ role: "user", parts: [{ text }] }],
    });
    return result.embeddings?.[0]?.values ?? [];
  }

  /**
   * Instance method calling generateContentStream — MISSING try-catch.
   * Should trigger ERROR violation.
   */
  async streamText(prompt: string): Promise<string> {
    // ❌ No try-catch — ApiError propagates uncaught
    const stream = await this.ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    let result = "";
    for await (const chunk of stream) {
      result += chunk.text ?? "";
    }
    return result;
  }
}
