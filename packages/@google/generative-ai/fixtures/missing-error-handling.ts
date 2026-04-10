/**
 * @google/generative-ai — Missing Error Handling Fixtures
 *
 * All functions in this file demonstrate INCORRECT usage.
 * verify-cli should report ERROR violations for each uncovered call.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// ─── generateContent ──────────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around generateContent. Should trigger violation.
 */
export async function generateContentNoErrorHandling(prompt: string) {
  // should trigger violation
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * MISSING: try-finally without catch. Should trigger violation.
 */
export async function generateContentTryFinallyNoCatch(prompt: string) {
  try {
    // should trigger violation — try-finally has no catch
    const result = await model.generateContent(prompt);
    return result.response.text();
  } finally {
    console.log('cleanup');
  }
}

// ─── generateContentStream ────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around generateContentStream. Should trigger violation.
 */
export async function streamContentNoErrorHandling(prompt: string) {
  // should trigger violation
  const streamResult = await model.generateContentStream(prompt);
  let text = '';
  for await (const chunk of streamResult.stream) {
    text += chunk.text();
  }
  return text;
}

// ─── sendMessage ──────────────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around sendMessage. Should trigger violation.
 */
export async function sendChatMessageNoErrorHandling(message: string) {
  const chat = model.startChat();
  // should trigger violation
  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── sendMessageStream ────────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around sendMessageStream. Should trigger violation.
 */
export async function sendStreamingMessageNoErrorHandling(message: string) {
  const chat = model.startChat();
  // should trigger violation
  const streamResult = await chat.sendMessageStream(message);
  let text = '';
  for await (const chunk of streamResult.stream) {
    text += chunk.text();
  }
  return text;
}

// ─── embedContent ─────────────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around embedContent. Should trigger violation.
 */
export async function embedContentNoErrorHandling(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  // should trigger violation
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// ─── countTokens ──────────────────────────────────────────────────────────────

/**
 * MISSING: No try-catch around countTokens. Should trigger violation.
 */
export async function countTokensNoErrorHandling(prompt: string) {
  // should trigger violation
  const result = await model.countTokens(prompt);
  return result.totalTokens;
}
