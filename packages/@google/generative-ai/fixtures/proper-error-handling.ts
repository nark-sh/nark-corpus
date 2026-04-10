/**
 * @google/generative-ai — Proper Error Handling Fixtures
 *
 * All functions in this file demonstrate CORRECT usage.
 * verify-cli should report ZERO violations.
 */

import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// ─── generateContent ──────────────────────────────────────────────────────────

/**
 * Proper: generateContent wrapped in try-catch.
 * Handles both network errors and safety-blocked responses.
 */
export async function generateContentWithErrorHandling(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
      console.error(`API error ${error.status}: ${error.message}`);
      if (error.status === 429) {
        throw new Error('Quota exceeded — retry later');
      }
    }
    throw error;
  }
}

/**
 * Proper: generateContent with generic catch — still satisfies the requirement.
 */
export async function generateContentGenericCatch(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    throw error;
  }
}

/**
 * Proper: .catch() chain on generateContent — satisfies error handling.
 */
export function generateContentCatchChain(prompt: string) {
  return model
    .generateContent(prompt)
    .then(result => result.response.text())
    .catch(error => {
      console.error('Gemini error:', error);
      throw error;
    });
}

// ─── generateContentStream ────────────────────────────────────────────────────

/**
 * Proper: generateContentStream with try-catch wrapping both the await and the stream loop.
 */
export async function streamContentWithErrorHandling(prompt: string) {
  try {
    const streamResult = await model.generateContentStream(prompt);
    let text = '';
    for await (const chunk of streamResult.stream) {
      text += chunk.text();
    }
    return text;
  } catch (error) {
    if (error instanceof GoogleGenerativeAIResponseError) {
      console.error('Safety block during streaming:', error.message);
    }
    throw error;
  }
}

// ─── sendMessage (ChatSession) ────────────────────────────────────────────────

/**
 * Proper: sendMessage wrapped in try-catch.
 */
export async function sendChatMessageWithErrorHandling(message: string) {
  const chat = model.startChat({
    history: [{ role: 'user', parts: [{ text: 'Hello' }] }],
  });
  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
      console.error(`Chat error ${error.status}: ${error.message}`);
    }
    throw error;
  }
}

// ─── sendMessageStream ────────────────────────────────────────────────────────

/**
 * Proper: sendMessageStream with try-catch around the entire streaming block.
 */
export async function sendStreamingMessageWithErrorHandling(message: string) {
  const chat = model.startChat();
  try {
    const streamResult = await chat.sendMessageStream(message);
    let text = '';
    for await (const chunk of streamResult.stream) {
      text += chunk.text();
    }
    return text;
  } catch (error) {
    console.error('Streaming chat error:', error);
    throw error;
  }
}

// ─── embedContent ─────────────────────────────────────────────────────────────

/**
 * Proper: embedContent wrapped in try-catch.
 */
export async function embedContentWithErrorHandling(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
      console.error(`Embedding error ${error.status}: ${error.message}`);
    }
    throw error;
  }
}

// ─── countTokens ──────────────────────────────────────────────────────────────

/**
 * Proper: countTokens wrapped in try-catch.
 */
export async function countTokensWithErrorHandling(prompt: string) {
  try {
    const result = await model.countTokens(prompt);
    return result.totalTokens;
  } catch (error) {
    console.error('Token counting error:', error);
    throw error;
  }
}
