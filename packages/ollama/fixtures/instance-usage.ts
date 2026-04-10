import { Ollama } from "ollama";

/**
 * Tests instance-based usage detection.
 * Should trigger violations where try/catch is missing.
 */
class AIService {
  private client: Ollama;

  constructor(host: string) {
    this.client = new Ollama({ host });
  }

  /**
   * ❌ Should trigger violation: chat-no-try-catch
   */
  async chat(prompt: string) {
    const response = await this.client.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: prompt }],
    });
    return response.message.content;
  }

  /**
   * ✅ Should NOT trigger violation
   */
  async chatSafe(prompt: string) {
    try {
      const response = await this.client.chat({
        model: "llama3.2",
        messages: [{ role: "user", content: prompt }],
      });
      return response.message.content;
    } catch (error) {
      console.error("Chat failed:", error);
      throw error;
    }
  }

  /**
   * ❌ Should trigger violation: generate-no-try-catch
   */
  async generate(prompt: string) {
    const response = await this.client.generate({
      model: "llama3.2",
      prompt,
    });
    return response.response;
  }
}

export { AIService };
