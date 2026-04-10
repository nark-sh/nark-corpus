/**
 * OpenAI Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the openai contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - openai.chat.completions.create(), openai.embeddings.create(),
 *     openai.images.generate(), etc. all have error-severity postconditions
 *     with `throws:` — each requires a try-catch
 *   - OpenAI SDK uses deep property chains: openai.chat.completions.create(...)
 *   - V2 uses PropertyChainDetector for these 3-level chains
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. chat.completions.create — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function chatCreateNoCatch() {
  // SHOULD_FIRE: authentication-error — openai.chat.completions.create throws on API error, no try-catch
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
  });
  return completion;
}

export async function chatCreateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: create inside try-catch satisfies error handling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    return completion;
  } catch (err: any) {
    if (err.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. embeddings.create — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function embeddingsCreateNoCatch(text: string) {
  // SHOULD_FIRE: embeddings-authentication-error — embeddings.create throws AuthenticationError, no try-catch
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return embedding;
}

export async function embeddingsCreateWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: embeddings.create inside try-catch is safe
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return embedding;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. images.generate — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function imagesGenerateNoCatch(prompt: string) {
  // SHOULD_FIRE: authentication-error — images.generate throws, no try-catch
  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
  });
  return image;
}

export async function imagesGenerateWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: images.generate inside try-catch is safe
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
    });
    return image;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. audio.transcriptions.create — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function audioTranscriptionNoCatch(audioFile: File) {
  // SHOULD_FIRE: transcription-invalid-file-error — audio.transcriptions.create throws on invalid file, no try-catch
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audioFile,
  });
  return transcription;
}

export async function audioTranscriptionWithCatch(audioFile: File) {
  try {
    // SHOULD_NOT_FIRE: audio.transcriptions.create inside try-catch is safe
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    });
    return transcription;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. moderations.create — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function moderationsCreateNoCatch(text: string) {
  // SHOULD_FIRE: moderation-authentication-error — moderations.create throws AuthenticationError, no try-catch
  const result = await openai.moderations.create({ input: text });
  return result;
}

export async function moderationsCreateWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: moderations.create inside try-catch is safe
    const result = await openai.moderations.create({ input: text });
    return result;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. fineTuning.jobs.create — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fineTuningJobNoCatch(trainingFileId: string) {
  // SHOULD_FIRE: fine-tuning-invalid-file-error — fineTuning.jobs.create throws on invalid file, no try-catch
  const job = await openai.fineTuning.jobs.create({
    training_file: trainingFileId,
    model: 'gpt-3.5-turbo',
  });
  return job;
}

export async function fineTuningJobWithCatch(trainingFileId: string) {
  try {
    // SHOULD_NOT_FIRE: fineTuning.jobs.create inside try-catch is safe
    const job = await openai.fineTuning.jobs.create({
      training_file: trainingFileId,
      model: 'gpt-3.5-turbo',
    });
    return job;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Class methods
// ─────────────────────────────────────────────────────────────────────────────

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(prompt: string) {
    // SHOULD_FIRE: authentication-error — class method, no try-catch
    const res = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    return res;
  }

  async safeComplete(prompt: string) {
    try {
      // SHOULD_NOT_FIRE: class method with try-catch is safe
      const res = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
      return res;
    } catch (err) {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Arrow functions
// ─────────────────────────────────────────────────────────────────────────────

export const arrowChatNoCatch = async (prompt: string) => {
  // SHOULD_FIRE: authentication-error — arrow function, no try-catch
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return res;
};

export const arrowChatWithCatch = async (prompt: string) => {
  try {
    // SHOULD_NOT_FIRE: arrow function with try-catch is safe
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    return res;
  } catch (err) {
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. audio.speech.create — missing try-catch  (NEW: bc-deepen-contract pass 1)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: speech-input-too-long-error
// @expect-violation: speech-rate-limit-error
export async function audioSpeechNoCatch(text: string) {
  // SHOULD_FIRE: speech-input-too-long-error — audio.speech.create throws BadRequestError on >4096 chars, no try-catch
  const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });
  return audio;
}

// @expect-clean
export async function audioSpeechWithCatch(text: string) {
  try {
    // SHOULD_NOT_FIRE: audio.speech.create inside try-catch is safe
    const audio = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });
    return audio;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. responses.create — missing try-catch  (NEW: bc-deepen-contract pass 1)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: responses-authentication-error
// @expect-violation: responses-rate-limit-error
export async function responsesCreateNoCatch(prompt: string) {
  // SHOULD_FIRE: responses-authentication-error — responses.create throws AuthenticationError, no try-catch
  const response = await openai.responses.create({
    model: 'gpt-4o',
    input: prompt,
  });
  return response;
}

// @expect-clean
export async function responsesCreateWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: responses.create inside try-catch is safe
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: prompt,
    });
    return response;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. batches.create — missing try-catch  (NEW: bc-deepen-contract pass 1)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: batches-invalid-file-error
export async function batchesCreateNoCatch(fileId: string) {
  // SHOULD_FIRE: batches-invalid-file-error — batches.create throws BadRequestError on invalid file, no try-catch
  const batch = await openai.batches.create({
    input_file_id: fileId,
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
  });
  return batch;
}

// @expect-clean
export async function batchesCreateWithCatch(fileId: string) {
  try {
    // SHOULD_NOT_FIRE: batches.create inside try-catch is safe
    const batch = await openai.batches.create({
      input_file_id: fileId,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    });
    return batch;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Multiple calls — each fires independently
// ─────────────────────────────────────────────────────────────────────────────

export async function multipleCallsNoCatch(text: string) {
  // SHOULD_FIRE: embeddings-authentication-error — first call (embeddings.create), no try-catch
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  // SHOULD_FIRE: moderation-authentication-error — second call (moderations.create), no try-catch
  const moderation = await openai.moderations.create({ input: text });
  return { embedding, moderation };
}
