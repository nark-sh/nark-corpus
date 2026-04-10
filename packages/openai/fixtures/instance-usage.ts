/**
 * OpenAI Fixtures - Instance Usage
 *
 * These examples test detection of OpenAI usage via instances.
 */

import OpenAI from 'openai';

/**
 * Service class using OpenAI instance
 */
class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * ❌ Missing try-catch on instance method
   * Should trigger ERROR violation
   */
  async generateCompletion(prompt: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion;
  }

  /**
   * ✅ Proper error handling on instance method
   * Should NOT trigger violation
   */
  async generateCompletionSafely(prompt: string) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
      return completion;
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError) {
        console.error('Rate limit exceeded');
      }
      throw error;
    }
  }

  /**
   * ❌ Missing try-catch for embeddings
   * Should trigger ERROR violation
   */
  async createEmbedding(text: string) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return embedding;
  }

  /**
   * ❌ Missing try-catch for image generation
   * Should trigger ERROR violation
   */
  async generateImage(prompt: string) {
    const image = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
    });
    return image;
  }
}

/**
 * Dependency injection pattern
 */
class ChatService {
  constructor(private readonly client: OpenAI) {}

  /**
   * ❌ Missing try-catch
   * Should trigger ERROR violation
   */
  async chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages,
    });
    return completion;
  }

  /**
   * ✅ With error handling
   * Should NOT trigger violation
   */
  async chatSafely(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages,
      });
      return completion;
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        console.error('Auth failed');
      }
      throw error;
    }
  }
}

/**
 * Module-level instance
 */
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy',
});

/**
 * ❌ Missing try-catch on module-level instance
 * Should trigger ERROR violation
 */
async function askQuestionWithModuleInstance(question: string) {
  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: question }],
  });
  return completion.choices[0].message.content;
}

/**
 * ❌ Missing try-catch for image generation with module instance
 * Should trigger ERROR violation
 */
async function generateImageWithModuleInstance(prompt: string) {
  const image = await openaiClient.images.generate({
    model: 'dall-e-3',
    prompt,
  });
  return image.data[0].url;
}
