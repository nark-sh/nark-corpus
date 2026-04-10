/**
 * Instance-based usage patterns for @mistralai/mistralai.
 * Tests detection via class instances and service patterns.
 */
import { Mistral } from '@mistralai/mistralai';

// ❌ Class with Mistral client as property — no try-catch
class ChatService {
  private client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

  async complete(message: string) {
    // ❌ Missing try-catch
    const response = await this.client.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: message }],
    });
    return response.choices?.[0]?.message?.content ?? '';
  }

  async* stream(message: string) {
    // ❌ Missing try-catch
    const stream = await this.client.chat.stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: message }],
    });
    for await (const chunk of stream) {
      yield chunk.data.choices[0]?.delta?.content ?? '';
    }
  }
}

// ✅ Class with proper error handling
class SafeChatService {
  private client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

  async complete(message: string) {
    try {
      const response = await this.client.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: message }],
      });
      return response.choices?.[0]?.message?.content ?? '';
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}

// ❌ Function that creates client and calls without try-catch
async function queryMistral(apiKey: string, message: string) {
  const mistral = new Mistral({ apiKey });
  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: message }],
  });
  return response.choices?.[0]?.message?.content;
}
