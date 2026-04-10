/**
 * Missing error handling for groq-sdk.
 * All calls lack try-catch — should produce ERROR violations.
 */

import Groq from 'groq-sdk';
import * as fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── chat.completions.create — no try-catch ──────────────────────────────────

export async function chatCompletionNoCatch() {
  // No try-catch: RateLimitError or AuthenticationError will crash caller
  const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: 'Hello!' }],
  });
  return completion.choices[0].message.content;
}

export async function chatStreamNoCatch() {
  // No try-catch around streaming loop — mid-stream APIError crashes
  const stream = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: 'Tell me a story' }],
    stream: true,
  });
  let result = '';
  for await (const chunk of stream) {
    result += chunk.choices[0]?.delta?.content ?? '';
  }
  return result;
}

// ─── audio.transcriptions.create — no try-catch ──────────────────────────────

export async function transcriptionNoCatch(filePath: string) {
  // No try-catch: BadRequestError or network failure will propagate
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
  });
  return transcription.text;
}

// ─── audio.translations.create — no try-catch ────────────────────────────────

export async function translationNoCatch(filePath: string) {
  // No try-catch: APIError propagates uncaught
  const translation = await groq.audio.translations.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
  });
  return translation.text;
}

// ─── audio.speech.create — no try-catch ──────────────────────────────────────

export async function speechNoCatch(text: string) {
  // No try-catch: TTS failures propagate
  const speech = await groq.audio.speech.create({
    model: 'playai-tts',
    voice: 'Fritz-PlayAI',
    input: text,
  });
  return speech;
}

// ─── embeddings.create — no try-catch ────────────────────────────────────────

export async function embeddingsNoCatch(text: string) {
  // No try-catch: rate limit or network error will crash batch pipeline
  const response = await groq.embeddings.create({
    model: 'nomic-embed-text-v1_5',
    input: text,
  });
  return response.data[0].embedding;
}
