/**
 * @google/generative-ai — Instance Usage Fixtures
 *
 * Tests that verify-cli detects violations through instance-based usage patterns.
 * The Gemini SDK uses a two-level factory pattern:
 *   GoogleGenerativeAI → GenerativeModel → ChatSession
 *
 * Violations should be detected even when the model/chat are stored as class fields.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Class with stored GenerativeModel instance ───────────────────────────────

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * MISSING: No try-catch on instance method. Should trigger violation.
   */
  async generateText(prompt: string) {
    // should trigger violation
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  /**
   * MISSING: No try-catch on streaming instance method. Should trigger violation.
   */
  async streamText(prompt: string) {
    // should trigger violation
    const streamResult = await this.model.generateContentStream(prompt);
    let text = '';
    for await (const chunk of streamResult.stream) {
      text += chunk.text();
    }
    return text;
  }

  /**
   * Proper: instance method with try-catch. Should NOT trigger violation.
   */
  async safeGenerateText(prompt: string) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini error:', error);
      throw error;
    }
  }
}

// ─── Module-level model instance ──────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const sharedModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * MISSING: Module-level instance, no try-catch. Should trigger violation.
 */
export async function callSharedModelNoCatch(prompt: string) {
  // should trigger violation
  const result = await sharedModel.generateContent(prompt);
  return result.response.text();
}

/**
 * MISSING: embedContent via module-level instance. Should trigger violation.
 */
export async function embedWithSharedModelNoCatch(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  // should trigger violation
  const result = await embeddingModel.embedContent(text);
  return result.embedding;
}

// ─── ChatSession stored as class field ────────────────────────────────────────

export class ChatService {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * MISSING: sendMessage via locally-created chat, no try-catch. Should trigger violation.
   */
  async chat(message: string) {
    const session = this.model.startChat();
    // should trigger violation
    const result = await session.sendMessage(message);
    return result.response.text();
  }

  /**
   * Proper: sendMessage with try-catch. Should NOT trigger violation.
   */
  async safeChat(message: string) {
    const session = this.model.startChat();
    try {
      const result = await session.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}
