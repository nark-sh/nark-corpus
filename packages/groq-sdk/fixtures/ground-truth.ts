/**
 * groq-sdk Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the groq-sdk contract spec, NOT V1 behavior.
 *
 * Contracted functions (all namespaced `create` from import "groq-sdk"):
 *   - groq.chat.completions.create()     postcondition: api-error
 *   - groq.audio.transcriptions.create() postcondition: api-error
 *   - groq.audio.translations.create()   postcondition: api-error
 *   - groq.audio.speech.create()         postcondition: api-error
 *   - groq.embeddings.create()           postcondition: api-error
 *
 * groq-sdk uses deep property chains (3+ levels), detected by PropertyChainDetector.
 * Pattern is structurally identical to openai SDK.
 */

import Groq from 'groq-sdk';
import * as fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'test-key' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. chat.completions.create — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function chatNoCatch() {
  // SHOULD_FIRE: api-error — chat.completions.create throws on API failure, no try-catch
  const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: 'Hello!' }],
  });
  return completion.choices[0].message.content;
}

export async function chatWithCatch() {
  try {
    // SHOULD_NOT_FIRE: create inside try-catch satisfies error handling
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    if (err instanceof Groq.RateLimitError) {
      throw new Error('Rate limited');
    }
    throw err;
  }
}

export async function chatStreamNoCatch() {
  // SHOULD_FIRE: api-error — streaming create still throws, no try-catch
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

export async function chatStreamWithCatch() {
  try {
    // SHOULD_NOT_FIRE: streaming create inside try-catch is safe
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
    console.error('Stream error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. audio.transcriptions.create
// ─────────────────────────────────────────────────────────────────────────────

export async function transcriptionNoCatch(filePath: string) {
  // SHOULD_FIRE: api-error — transcriptions.create throws on bad file or network error, no try-catch
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
  });
  return transcription.text;
}

export async function transcriptionWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: transcriptions.create inside try-catch
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });
    return transcription.text;
  } catch (err) {
    console.error('Transcription failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. audio.translations.create
// ─────────────────────────────────────────────────────────────────────────────

export async function translationNoCatch(filePath: string) {
  // SHOULD_FIRE: api-error — translations.create throws, no try-catch
  const translation = await groq.audio.translations.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
  });
  return translation.text;
}

export async function translationWithCatch(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: translations.create inside try-catch
    const translation = await groq.audio.translations.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });
    return translation.text;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. audio.speech.create
// ─────────────────────────────────────────────────────────────────────────────

export async function speechNoCatch(text: string) {
  // SHOULD_FIRE: api-error — speech.create throws on TTS failure, no try-catch
  const speech = await groq.audio.speech.create({
    model: 'playai-tts',
    voice: 'Fritz-PlayAI',
    input: text,
  });
  return speech;
}

export async function speechWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: speech.create inside try-catch
    const speech = await groq.audio.speech.create({
      model: 'playai-tts',
      voice: 'Fritz-PlayAI',
      input: text,
    });
    return speech;
  } catch (err) {
    if (err instanceof Groq.APIError) {
      console.error('TTS failed:', err.status, err.message);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. embeddings.create
// ─────────────────────────────────────────────────────────────────────────────

export async function embeddingNoCatch(text: string) {
  // SHOULD_FIRE: api-error — embeddings.create throws on rate limit or network error, no try-catch
  const response = await groq.embeddings.create({
    model: 'nomic-embed-text-v1_5',
    input: text,
  });
  return response.data[0].embedding;
}

export async function embeddingWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: embeddings.create inside try-catch
    const response = await groq.embeddings.create({
      model: 'nomic-embed-text-v1_5',
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    if (err instanceof Groq.RateLimitError) {
      throw new Error('Embedding rate limited');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. batches.create — batch inference submission
// ─────────────────────────────────────────────────────────────────────────────

export async function batchCreateNoCatch(fileId: string) {
  // SHOULD_FIRE: groq-batches-no-try-catch — batches.create throws on API failure, no try-catch
  const batch = await groq.batches.create({
    input_file_id: fileId,
    endpoint: '/openai/v1/chat/completions',
    completion_window: '24h',
  });
  return batch.id;
}

export async function batchCreateWithCatch(fileId: string) {
  // SHOULD_NOT_FIRE: groq-batches-no-try-catch — properly wrapped in try-catch
  try {
    const batch = await groq.batches.create({
      input_file_id: fileId,
      endpoint: '/openai/v1/chat/completions',
      completion_window: '24h',
    });
    return batch.id;
  } catch (err) {
    if (err instanceof Groq.APIError) {
      throw new Error(`Batch submission failed: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. files.create — file upload for batch jobs
// ─────────────────────────────────────────────────────────────────────────────

export async function filesCreateNoCatch(content: Buffer) {
  // SHOULD_FIRE: groq-files-upload-no-try-catch — files.create throws on API failure, no try-catch
  const file = await groq.files.create({
    file: new File([content], 'batch.jsonl', { type: 'application/jsonl' }),
    purpose: 'batch',
  });
  return file.id;
}

export async function filesCreateWithCatch(content: Buffer) {
  // SHOULD_NOT_FIRE: groq-files-upload-no-try-catch — properly wrapped in try-catch
  try {
    const file = await groq.files.create({
      file: new File([content], 'batch.jsonl', { type: 'application/jsonl' }),
      purpose: 'batch',
    });
    return file.id;
  } catch (err) {
    if (err instanceof Groq.APIError) {
      throw new Error(`File upload failed: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. batches.cancel — cancel running batch
// ─────────────────────────────────────────────────────────────────────────────

export async function batchCancelNoCatch(batchId: string) {
  // SHOULD_FIRE: groq-batches-cancel-no-try-catch — cancel throws on not-found/network error, no try-catch
  const result = await groq.batches.cancel(batchId);
  return result.status;
}

export async function batchCancelWithCatch(batchId: string) {
  // SHOULD_NOT_FIRE: groq-batches-cancel-no-try-catch — properly wrapped
  try {
    const result = await groq.batches.cancel(batchId);
    return result.status;
  } catch (err) {
    if (err instanceof Groq.NotFoundError) {
      // batch already completed or expired — acceptable
      return 'already_complete';
    }
    if (err instanceof Groq.APIError) {
      throw new Error(`Batch cancel failed: ${err.message}`);
    }
    throw err;
  }
}
