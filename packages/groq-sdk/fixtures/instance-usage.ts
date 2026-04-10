/**
 * Instance-based usage patterns for groq-sdk.
 * Tests detection of groq-sdk calls through class instances and factory patterns.
 */

import Groq from 'groq-sdk';
import * as fs from 'fs';

// ─── Instance stored as class field ──────────────────────────────────────────

class LlmService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateResponse(prompt: string): Promise<string> {
    // No try-catch on instance method call — should fire
    const completion = await this.groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content ?? '';
  }

  async generateSafe(prompt: string): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content ?? '';
    } catch (err) {
      console.error('LLM error:', err);
      throw err;
    }
  }
}

// ─── Instance stored as module-level variable ─────────────────────────────────

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function moduleVarChatNoCatch(text: string) {
  // Module-level groq instance, no try-catch
  const completion = await groqClient.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [{ role: 'user', content: text }],
  });
  return completion.choices[0].message.content;
}

export async function moduleVarEmbeddingNoCatch(text: string) {
  // Module-level groq instance, embedding without try-catch
  const response = await groqClient.embeddings.create({
    model: 'nomic-embed-text-v1_5',
    input: text,
  });
  return response.data[0].embedding;
}

// ─── Factory function returning Groq instance ─────────────────────────────────

function createGroqClient(apiKey: string): Groq {
  return new Groq({ apiKey });
}

export async function factoryClientNoCatch(apiKey: string, prompt: string) {
  const client = createGroqClient(apiKey);
  // No try-catch — factory pattern, still should detect
  const completion = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0].message.content;
}

// ─── Next.js API route pattern (no try-catch in route handler) ────────────────

export async function nextjsRouteHandler(request: Request) {
  // Typical Next.js app router pattern — no try-catch around groq call
  const { prompt } = await request.json();
  const completion = await groqClient.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
  });
  return Response.json({ message: completion.choices[0].message.content });
}
