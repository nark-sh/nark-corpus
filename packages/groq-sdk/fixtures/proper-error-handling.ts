/**
 * Proper error handling for groq-sdk.
 * All calls wrapped in try-catch — should produce 0 violations.
 */

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── chat.completions.create ────────────────────────────────────────────────

export async function chatCompletionWithCatch() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    if (err instanceof Groq.RateLimitError) {
      throw new Error('Rate limit exceeded — retry later');
    }
    if (err instanceof Groq.APIError) {
      console.error('Groq API error:', err.status, err.message);
    }
    throw err;
  }
}

export async function chatCompletionStreamWithCatch() {
  try {
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
  } catch (err) {
    if (err instanceof Groq.APIError) {
      console.error('Stream error:', err.status);
    }
    throw err;
  }
}

// ─── audio.transcriptions.create ────────────────────────────────────────────

import * as fs from 'fs';

export async function transcriptionWithCatch(filePath: string) {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });
    return transcription.text;
  } catch (err) {
    if (err instanceof Groq.BadRequestError) {
      console.error('Invalid audio file:', err.message);
    } else if (err instanceof Groq.APIError) {
      console.error('Transcription API error:', err.status);
    }
    throw err;
  }
}

// ─── audio.translations.create ──────────────────────────────────────────────

export async function translationWithCatch(filePath: string) {
  try {
    const translation = await groq.audio.translations.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });
    return translation.text;
  } catch (err) {
    if (err instanceof Groq.APIError) {
      console.error('Translation error:', err.status, err.message);
    }
    throw err;
  }
}

// ─── audio.speech.create ────────────────────────────────────────────────────

export async function speechWithCatch(text: string) {
  try {
    const speech = await groq.audio.speech.create({
      model: 'playai-tts',
      voice: 'Fritz-PlayAI',
      input: text,
    });
    return speech;
  } catch (err) {
    if (err instanceof Groq.APIError) {
      console.error('TTS error:', err.status, err.message);
    }
    throw err;
  }
}

// ─── embeddings.create ──────────────────────────────────────────────────────

export async function embeddingsWithCatch(text: string) {
  try {
    const response = await groq.embeddings.create({
      model: 'nomic-embed-text-v1_5',
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    if (err instanceof Groq.RateLimitError) {
      console.error('Embedding rate limit:', err.message);
    } else if (err instanceof Groq.APIError) {
      console.error('Embedding API error:', err.status);
    }
    throw err;
  }
}
