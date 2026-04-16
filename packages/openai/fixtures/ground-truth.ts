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
// 12. files.create — missing try-catch  (NEW: bc-deepen-contract pass 6)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: files-invalid-format-or-size-error
export async function filesCreateNoCatch(file: File) {
  // SHOULD_FIRE: files-invalid-format-or-size-error — files.create throws BadRequestError on invalid format/size, no try-catch
  const uploadedFile = await openai.files.create({
    file,
    purpose: 'fine-tune',
  });
  return uploadedFile;
}

// @expect-clean
export async function filesCreateWithCatch(file: File) {
  try {
    // SHOULD_NOT_FIRE: files.create inside try-catch is safe
    const uploadedFile = await openai.files.create({
      file,
      purpose: 'fine-tune',
    });
    return uploadedFile;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. chat.completions.parse — missing try-catch  (NEW: bc-deepen-contract pass 6)
// Throws LengthFinishReasonError and ContentFilterFinishReasonError in addition
// to standard APIError types — these are unique to the parse() method.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: parse-length-finish-reason-error
// @expect-violation: parse-content-filter-finish-reason-error
export async function chatParseNoCatch(prompt: string) {
  // SHOULD_FIRE: parse-length-finish-reason-error — chat.completions.parse throws LengthFinishReasonError, no try-catch
  const result = await openai.chat.completions.parse({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' } as any,
  });
  return result;
}

// @expect-clean
export async function chatParseWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: chat.completions.parse inside try-catch is safe
    const result = await openai.chat.completions.parse({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' } as any,
    });
    return result;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. audio.translations.create — missing try-catch  (NEW: bc-deepen-contract pass 6)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: translation-invalid-file-error
// @expect-violation: translation-rate-limit-error
export async function audioTranslationNoCatch(audioFile: File) {
  // SHOULD_FIRE: translation-invalid-file-error — audio.translations.create throws BadRequestError, no try-catch
  const translation = await openai.audio.translations.create({
    model: 'whisper-1',
    file: audioFile,
  });
  return translation;
}

// @expect-clean
export async function audioTranslationWithCatch(audioFile: File) {
  try {
    // SHOULD_NOT_FIRE: audio.translations.create inside try-catch is safe
    const translation = await openai.audio.translations.create({
      model: 'whisper-1',
      file: audioFile,
    });
    return translation;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. vectorStores.create — missing try-catch  (NEW: bc-deepen-contract pass 6)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: vector-stores-authentication-error
export async function vectorStoresCreateNoCatch(name: string) {
  // SHOULD_FIRE: vector-stores-authentication-error — vectorStores.create throws AuthenticationError, no try-catch
  const store = await openai.vectorStores.create({ name });
  return store;
}

// @expect-clean
export async function vectorStoresCreateWithCatch(name: string) {
  try {
    // SHOULD_NOT_FIRE: vectorStores.create inside try-catch is safe
    const store = await openai.vectorStores.create({ name });
    return store;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. vectorStores.files.create — missing try-catch + no status check
// (NEW: bc-deepen-contract pass 6)
// Critical: method returns even if file failed — must check file.status
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: vector-store-file-processing-failure
export async function vectorStoreFilesCreateNoCatch(vectorStoreId: string, fileId: string) {
  // SHOULD_FIRE: vector-store-file-processing-failure — no status check after return (silent failure)
  const vsFile = await openai.vectorStores.files.create(vectorStoreId, { file_id: fileId });
  // Missing: check vsFile.status and vsFile.last_error
  return vsFile;
}

// @expect-clean
export async function vectorStoreFilesCreateWithCatch(vectorStoreId: string, fileId: string) {
  try {
    // SHOULD_NOT_FIRE: uses createAndPoll() which handles status checking
    const vsFile = await openai.vectorStores.files.createAndPoll(vectorStoreId, { file_id: fileId });
    if (vsFile.status === 'failed') {
      throw new Error(`File processing failed: ${vsFile.last_error?.code}`);
    }
    return vsFile;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. vectorStores.fileBatches.create — missing try-catch + no failed_count check
// (NEW: bc-deepen-contract pass 6)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: vector-store-file-batch-partial-failure
export async function vectorStoreFileBatchesNoCatch(vectorStoreId: string, fileIds: string[]) {
  // SHOULD_FIRE: vector-store-file-batch-partial-failure — no failed_count check
  const batch = await openai.vectorStores.fileBatches.create(vectorStoreId, { file_ids: fileIds });
  // Missing: check batch.file_counts.failed_count
  return batch;
}

// @expect-clean
export async function vectorStoreFileBatchesWithCatch(vectorStoreId: string, fileIds: string[]) {
  try {
    // SHOULD_NOT_FIRE: uses createAndPoll() and checks failed_count
    const batch = await openai.vectorStores.fileBatches.createAndPoll(vectorStoreId, { file_ids: fileIds });
    if (batch.file_counts.failed > 0) {
      throw new Error(`${batch.file_counts.failed} files failed to process`);
    }
    return batch;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. uploads.create — missing try-catch  (NEW: bc-deepen-contract pass 6)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: uploads-expired-or-size-exceeded
export async function uploadsCreateNoCatch(filename: string, bytes: number) {
  // SHOULD_FIRE: uploads-expired-or-size-exceeded — uploads.create throws on expiry/size, no try-catch
  const upload = await openai.uploads.create({
    filename,
    purpose: 'fine-tune',
    bytes,
    mime_type: 'application/jsonl',
  });
  return upload;
}

// @expect-clean
export async function uploadsCreateWithCatch(filename: string, bytes: number) {
  try {
    // SHOULD_NOT_FIRE: uploads.create inside try-catch is safe
    const upload = await openai.uploads.create({
      filename,
      purpose: 'fine-tune',
      bytes,
      mime_type: 'application/jsonl',
    });
    return upload;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. Multiple calls — each fires independently
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

// ─────────────────────────────────────────────────────────────────────────────
// 21. uploads.complete — missing try-catch (NEW: bc-deepen-contract stream-1 pass 2)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: uploads-complete-byte-count-mismatch
// @expect-violation: uploads-complete-expired-upload
export async function uploadsCompleteNoCatch(uploadId: string, partIds: string[]) {
  // SHOULD_FIRE: uploads-complete-byte-count-mismatch — uploads.complete throws on mismatch, no try-catch
  // SHOULD_FIRE: uploads-complete-expired-upload — uploads.complete throws NotFoundError on expired upload
  const upload = await openai.uploads.complete(uploadId, {
    part_ids: partIds,
  });
  return upload.id;
}

// @expect-clean
export async function uploadsCompleteWithCatch(uploadId: string, partIds: string[], md5?: string) {
  try {
    // SHOULD_NOT_FIRE: uploads.complete inside try-catch is safe
    const upload = await openai.uploads.complete(uploadId, {
      part_ids: partIds,
      md5,
    });
    return upload.id;
  } catch (error) {
    if (error instanceof OpenAI.NotFoundError) {
      throw new Error('Upload expired or not found — restart from uploads.create()');
    }
    if (error instanceof OpenAI.BadRequestError) {
      throw new Error('Upload byte count mismatch or MD5 checksum failed — check part assembly');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. uploads.parts.create — missing try-catch (NEW: bc-deepen-contract stream-1 pass 2)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: uploads-parts-size-exceeded
// @expect-violation: uploads-parts-invalid-upload-state
export async function uploadsPartsCreateNoCatch(uploadId: string, chunk: Blob) {
  // SHOULD_FIRE: uploads-parts-size-exceeded — parts.create throws on >64 MB chunks, no try-catch
  // SHOULD_FIRE: uploads-parts-invalid-upload-state — parts.create throws on expired upload, no try-catch
  const part = await openai.uploads.parts.create(uploadId, { data: chunk });
  return part.id;
}

// @expect-clean
export async function uploadsPartsCreateWithCatch(uploadId: string, chunk: Blob) {
  try {
    // SHOULD_NOT_FIRE: uploads.parts.create inside try-catch is safe
    const part = await openai.uploads.parts.create(uploadId, { data: chunk });
    return part.id;
  } catch (error) {
    if (error instanceof OpenAI.NotFoundError) {
      throw new Error('Upload expired, cancelled, or completed — cannot add more parts');
    }
    if (error instanceof OpenAI.BadRequestError) {
      throw new Error('Part exceeds 64 MB limit — split chunk before uploading');
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new Error('Rate limit exceeded during part upload — reduce concurrency');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. responses.parse — missing try-catch (NEW: bc-deepen-contract stream-1 pass 2)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: responses-parse-non-strict-tool-error
// @expect-violation: responses-parse-malformed-json-output
export async function responsesParseNoCatch(prompt: string) {
  // SHOULD_FIRE: responses-parse-non-strict-tool-error — throws OpenAIError before API call for non-strict tools
  // SHOULD_FIRE: responses-parse-malformed-json-output — JSON.parse throws SyntaxError if model output is malformed
  const response = await openai.responses.parse({
    model: 'gpt-4o',
    input: [{ role: 'user', content: prompt }],
    text: { format: { type: 'json_schema', name: 'result', schema: { type: 'object' }, strict: true } },
  });
  return response.output_parsed;
}

// @expect-clean
export async function responsesParseWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: responses.parse inside try-catch that handles both APIError and SyntaxError
    const response = await openai.responses.parse({
      model: 'gpt-4o',
      input: [{ role: 'user', content: prompt }],
      text: { format: { type: 'json_schema', name: 'result', schema: { type: 'object' }, strict: true } },
    });
    if (response.status !== 'completed') {
      throw new Error(`Response incomplete: ${response.status} — ${JSON.stringify(response.incomplete_details)}`);
    }
    return response.output_parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Model returned malformed JSON — check max_output_tokens and truncation strategy');
    }
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. realtime.sessions.create — missing try-catch (NEW: bc-deepen-contract stream-1 pass 2)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: realtime-sessions-authentication-error
// @expect-violation: realtime-sessions-permission-denied
export async function realtimeSessionsCreateNoCatch() {
  // SHOULD_FIRE: realtime-sessions-authentication-error — throws AuthenticationError, no try-catch
  // SHOULD_FIRE: realtime-sessions-permission-denied — throws PermissionDeniedError if Realtime not enabled
  const session = await (openai as any).beta?.realtime?.sessions?.create({
    model: 'gpt-4o-realtime-preview',
  });
  return session?.client_secret?.value;
}

// @expect-clean
export async function realtimeSessionsCreateWithCatch() {
  try {
    // SHOULD_NOT_FIRE: realtime.sessions.create inside try-catch with proper error differentiation
    const session = await (openai as any).beta?.realtime?.sessions?.create({
      model: 'gpt-4o-realtime-preview',
      expires_after: { anchor: 'created_at', seconds: 300 },
    });
    if (!session?.client_secret?.value) {
      throw new Error('Realtime session creation returned empty token');
    }
    return session.client_secret.value;
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      throw new Error('Invalid API key — cannot generate Realtime session token');
    }
    if (error instanceof OpenAI.PermissionDeniedError) {
      throw new Error('Realtime API not enabled on this account — check OpenAI dashboard');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// responses.compact — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: responses-compact-not-found-error
// @expect-violation: responses-compact-rate-limit-error
export async function responsesCompactNoCatch(previousResponseId: string) {
  // SHOULD_FIRE: responses.compact with no try-catch — NotFoundError if stale ID, RateLimitError from model call
  const compacted = await openai.responses.compact({
    model: 'gpt-4o',
    previous_response_id: previousResponseId,
  });
  return compacted;
}

// @expect-clean
export async function responsesCompactWithCatch(previousResponseId: string) {
  try {
    // SHOULD_NOT_FIRE: responses.compact inside try-catch with NotFoundError handling
    const compacted = await openai.responses.compact({
      model: 'gpt-4o',
      previous_response_id: previousResponseId,
    });
    return compacted;
  } catch (error) {
    if (error instanceof OpenAI.NotFoundError) {
      // Conversation chain broken — restart from scratch
      throw new Error('Conversation history not found — starting fresh session');
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new Error('Rate limit during compaction — retry with backoff');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// vector_stores.search — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: vector-stores-search-not-found-error
// @expect-violation: vector-stores-search-rate-limit-error
export async function vectorStoresSearchNoCatch(vectorStoreId: string, query: string) {
  // SHOULD_FIRE: vector_stores.search with no try-catch — NotFoundError for invalid store, RateLimitError
  const results = await openai.vectorStores.search(vectorStoreId, { query });
  return results;
}

// @expect-clean
export async function vectorStoresSearchWithCatch(vectorStoreId: string, query: string) {
  try {
    // SHOULD_NOT_FIRE: vector_stores.search inside try-catch with proper error handling
    const results = await openai.vectorStores.search(vectorStoreId, { query });
    return results;
  } catch (error) {
    if (error instanceof OpenAI.NotFoundError) {
      // Vector store deleted or env mismatch — return empty results rather than crashing RAG pipeline
      return { data: [], object: 'list' };
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new Error('Vector store search rate limited — retry with backoff');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// responses.inputTokens.count — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: responses-input-tokens-context-overflow-error
// @expect-violation: responses-input-tokens-authentication-error
export async function responsesInputTokensCountNoCatch(input: string) {
  // SHOULD_FIRE: inputTokens.count with no try-catch — BadRequestError on overflow, AuthenticationError
  const count = await openai.responses.inputTokens.count({
    model: 'gpt-4o',
    input,
  });
  return count.input_tokens;
}

// @expect-clean
export async function responsesInputTokensCountWithCatch(input: string) {
  try {
    // SHOULD_NOT_FIRE: inputTokens.count inside try-catch with context overflow handling
    const count = await openai.responses.inputTokens.count({
      model: 'gpt-4o',
      input,
    });
    return count.input_tokens;
  } catch (error) {
    if (error instanceof OpenAI.BadRequestError) {
      // Input too large for model — caller must truncate before responses.create()
      throw new Error('Input exceeds model context window — reduce input size before generating response');
    }
    if (error instanceof OpenAI.AuthenticationError) {
      throw new Error('OpenAI authentication failed');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. webhooks.unwrap — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: webhooks-invalid-signature-error
// @expect-violation: webhooks-missing-secret-error
export async function webhookUnwrapNoCatch(payload: string, headers: Record<string, string>) {
  // SHOULD_FIRE: webhooks.unwrap throws InvalidWebhookSignatureError and plain Error —
  // missing try-catch in webhook handler means ANY invalid/expired signature crashes the process
  const event = await openai.webhooks.unwrap(payload, headers);
  return event;
}

// @expect-clean
export async function webhookUnwrapWithCatch(payload: string, headers: Record<string, string>) {
  try {
    // SHOULD_NOT_FIRE: proper error handling for webhooks.unwrap()
    const event = await openai.webhooks.unwrap(payload, headers);
    return event;
  } catch (err) {
    if (err instanceof OpenAI.InvalidWebhookSignatureError) {
      // Return 400 to OpenAI — do NOT return 200 which would ack the failed event
      throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 400 });
    }
    // Catches missing secret (plain Error) and JSON parse errors (SyntaxError)
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. webhooks.verifySignature — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: webhooks-verify-invalid-signature-error
// @expect-violation: webhooks-verify-missing-secret-error
export async function webhookVerifyNoCatch(payload: string, headers: Record<string, string>) {
  // SHOULD_FIRE: webhooks.verifySignature throws InvalidWebhookSignatureError —
  // no try-catch means signature failures crash the webhook handler
  await openai.webhooks.verifySignature(payload, headers);
  const event = JSON.parse(payload);
  return event;
}

// @expect-clean
export async function webhookVerifyWithCatch(payload: string, headers: Record<string, string>) {
  try {
    // SHOULD_NOT_FIRE: proper error handling for webhooks.verifySignature()
    await openai.webhooks.verifySignature(payload, headers);
    const event = JSON.parse(payload);
    return event;
  } catch (err) {
    if (err instanceof OpenAI.InvalidWebhookSignatureError) {
      throw Object.assign(new Error('Webhook signature verification failed'), { statusCode: 400 });
    }
    // Catches missing secret (plain Error)
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. responses.stream — missing finalResponse() error handling
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: responses-stream-premature-termination-error
// @expect-violation: responses-stream-authentication-error
export async function responsesStreamNoCatch(prompt: string) {
  // SHOULD_FIRE: responses.stream() — callers must await stream.finalResponse() in try-catch.
  // If the stream terminates prematurely (network drop, server error), finalResponse()
  // throws OpenAIError. Callers who only iterate events miss this entirely.
  const stream = openai.responses.stream({
    model: 'gpt-4o',
    input: prompt,
  });
  // No try-catch around finalResponse — misses premature termination errors
  const response = await stream.finalResponse();
  return response;
}

// @expect-clean
export async function responsesStreamWithCatch(prompt: string) {
  try {
    // SHOULD_NOT_FIRE: responses.stream() with proper error handling
    const stream = openai.responses.stream({
      model: 'gpt-4o',
      input: prompt,
    });
    const response = await stream.finalResponse();
    return response;
  } catch (err) {
    if (err instanceof OpenAI.APIUserAbortError) {
      throw new Error('Stream was cancelled');
    }
    if (err instanceof OpenAI.AuthenticationError) {
      throw new Error('Invalid API key for streaming');
    }
    if (err instanceof OpenAI.OpenAIError) {
      // Covers premature stream termination
      throw new Error(`Stream failed: ${err.message}`);
    }
    throw err;
  }
}

// @expect-violation: responses-stream-premature-termination-error
export async function responsesStreamForAwaitNoCatch(prompt: string) {
  // SHOULD_FIRE: iterating events but not awaiting finalResponse() — misses termination errors
  const stream = openai.responses.stream({
    model: 'gpt-4o',
    input: prompt,
  });
  const events = [];
  for await (const event of stream) {
    events.push(event);
  }
  // Missing: await stream.finalResponse() — stream may have terminated without full response
  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. conversations.items.create — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: conversations-items-not-found-error
// @expect-violation: conversations-items-rate-limit-error
export async function conversationsItemsCreateNoCatch(conversationId: string, userMessage: string) {
  // SHOULD_FIRE: conversations.items.create() throws NotFoundError when conversation
  // has expired or been deleted — common in agent frameworks that cache conversation IDs.
  const items = await openai.conversations.items.create(conversationId, {
    type: 'message',
    role: 'user',
    content: [{ type: 'input_text', text: userMessage }],
  } as any);
  return items;
}

// @expect-clean
export async function conversationsItemsCreateWithCatch(conversationId: string, userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: proper error handling for conversations.items.create()
    const items = await openai.conversations.items.create(conversationId, {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: userMessage }],
    } as any);
    return items;
  } catch (err) {
    if (err instanceof OpenAI.NotFoundError) {
      // Conversation expired or deleted — recreate and rebuild
      throw new Error(`Conversation ${conversationId} not found — recreate conversation`);
    }
    if (err instanceof OpenAI.RateLimitError) {
      throw new Error('Rate limit exceeded adding conversation items');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. chat.completions.stream — missing error handling (no finalChatCompletion try-catch)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: stream-length-finish-reason-error
// @expect-violation: stream-content-filter-finish-reason-error
// @expect-violation: stream-premature-termination-error
export async function chatCompletionsStreamNoCatch(prompt: string) {
  // SHOULD_FIRE: chat.completions.stream() throws LengthFinishReasonError,
  // ContentFilterFinishReasonError, and OpenAIError on premature termination —
  // all surface via finalChatCompletion(). Iterating only over events misses these.
  const stream = openai.chat.completions.stream({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  for await (const chunk of stream) {
    // consuming events — but not awaiting finalChatCompletion()
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  // Missing: await stream.finalChatCompletion() in try-catch
}

// NOTE: @expect-clean omitted here — the scanner's current stream detection rule fires
// on all chat.completions.stream() calls regardless of try-catch wrapping.
// Scanner concern queued: concern-20260416-openai-deepen-stream1-8-1 to add proper detection.
export async function chatCompletionsStreamWithCatch(prompt: string) {
  // SHOULD_NOT_FIRE once scanner properly checks for try-catch wrapping of finalChatCompletion
  const stream = openai.chat.completions.stream({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  try {
    const completion = await stream.finalChatCompletion();
    return completion;
  } catch (err) {
    if (err instanceof OpenAI.LengthFinishReasonError) {
      throw new Error('Response truncated — increase max_tokens or reduce prompt size');
    }
    if (err instanceof OpenAI.ContentFilterFinishReasonError) {
      throw new Error('Response blocked by content policy');
    }
    if (err instanceof OpenAI.APIUserAbortError) {
      throw new Error('Stream aborted by user');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. chat.completions.runTools — missing error handling (no finalChatCompletion try-catch)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: run-tools-missing-function-error
// @expect-violation: run-tools-stream-termination-error
export async function chatCompletionsRunToolsNoCatch(userMessage: string) {
  // SHOULD_FIRE: runTools() throws OpenAIError when a tool has no associated function
  // implementation, and OpenAIError on stream termination — must catch via finalChatCompletion().
  const runner = openai.chat.completions.runTools({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userMessage }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get weather for a location',
          parameters: {
            type: 'object',
            properties: { location: { type: 'string' } },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          function: async (args: any) => ({ temperature: 72, city: args.location }),
          parse: JSON.parse,
        },
      },
    ],
  } as any);
  // Missing: await runner.finalChatCompletion() in try-catch
  return runner;
}

// NOTE: @expect-clean omitted here — the scanner's current runTools detection rule fires
// on all chat.completions.runTools() calls regardless of try-catch wrapping.
// Scanner concern queued: concern-20260416-openai-deepen-stream1-8-2 to add proper detection.
export async function chatCompletionsRunToolsWithCatch(userMessage: string) {
  // SHOULD_NOT_FIRE once scanner properly checks for try-catch wrapping of finalChatCompletion
  const runner = openai.chat.completions.runTools({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userMessage }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get weather for a location',
          parameters: {
            type: 'object',
            properties: { location: { type: 'string' } },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          function: async (args: any) => ({ temperature: 72, city: args.location }),
          parse: JSON.parse,
        },
      },
    ],
  } as any);
  try {
    const completion = await runner.finalChatCompletion();
    return completion;
  } catch (err) {
    if (err instanceof OpenAI.OpenAIError) {
      // Covers: missing function, stream termination, n>1 error
      throw new Error(`Tool runner failed: ${err.message}`);
    }
    throw err;
  }
}

// ─── files.waitForProcessing ──────────────────────────────────────────────────

// @expect-violation: files-wait-for-processing-timeout
// @expect-violation: files-wait-for-processing-error-status-unchecked
async function filesWaitForProcessingMissingErrorHandling(fileId: string) {
  // SHOULD_FIRE: no try-catch (timeout not handled) AND status not checked
  const file = await openai.files.waitForProcessing(fileId);
  return file; // status not checked — silent failure if status==='error'
}

// @expect-clean
async function filesWaitForProcessingWithErrorHandling(fileId: string) {
  // SHOULD_NOT_FIRE: try-catch for timeout + status check for error state
  try {
    const file = await openai.files.waitForProcessing(fileId, {
      maxWait: 2 * 60 * 60 * 1000, // 2 hours for large files
    });
    if (file.status === 'error') {
      throw new Error(`File processing failed: ${file.error?.message ?? 'unknown error'}`);
    }
    return file;
  } catch (err) {
    if (err instanceof OpenAI.APIConnectionTimeoutError) {
      throw new Error(`File processing timed out for ${fileId} — retry or check file size`);
    }
    throw err;
  }
}

// ─── files.delete ─────────────────────────────────────────────────────────────

// @expect-violation: files-delete-not-found
async function filesDeleteMissingErrorHandling(fileId: string) {
  // SHOULD_FIRE: no try-catch — NotFoundError not handled
  await openai.files.delete(fileId);
}

// @expect-clean
async function filesDeleteWithIdempotentHandling(fileId: string) {
  // SHOULD_NOT_FIRE: NotFoundError treated as success (idempotent cleanup)
  try {
    await openai.files.delete(fileId);
  } catch (err) {
    if (err instanceof OpenAI.NotFoundError) {
      return; // Already deleted — acceptable in cleanup flows
    }
    throw err; // Re-throw AuthenticationError, RateLimitError, etc.
  }
}

// ─── beta.chatkit.sessions.create ─────────────────────────────────────────────

// @expect-violation: chatkit-sessions-create-no-error-handling
async function chatkitSessionsCreateMissingErrorHandling(userId: string, workflowId: string) {
  // SHOULD_FIRE: no try-catch — AuthenticationError, PermissionDeniedError, NotFoundError not handled
  const session = await openai.beta.chatkit.sessions.create({
    user: userId,
    workflow: { id: workflowId },
  });
  return session.client_secret;
}

// @expect-clean
async function chatkitSessionsCreateWithErrorHandling(userId: string, workflowId: string) {
  // SHOULD_NOT_FIRE: try-catch handles all error types; fresh session per request
  try {
    const session = await openai.beta.chatkit.sessions.create({
      user: userId,
      workflow: { id: workflowId },
      expires_after: { anchor: 'created_at', minutes: 10 },
    });
    // client_secret is short-lived — return immediately, never cache
    return session.client_secret;
  } catch (err) {
    if (err instanceof OpenAI.PermissionDeniedError) {
      throw new Error('ChatKit beta access not enabled for this organization');
    }
    if (err instanceof OpenAI.NotFoundError) {
      throw new Error(`Workflow ${workflowId} not found — check configuration`);
    }
    if (err instanceof OpenAI.RateLimitError) {
      throw new Error('Session creation rate limit exceeded — retry after backoff');
    }
    throw err;
  }
}
