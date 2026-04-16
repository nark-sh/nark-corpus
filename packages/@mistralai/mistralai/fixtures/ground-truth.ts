/**
 * Ground-truth fixture for @mistralai/mistralai.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   complete-no-error-handling
 *   stream-no-error-handling
 *   embeddings-create-no-error-handling
 *   ocr-process-no-error-handling
 *   files-upload-no-error-handling
 *   agents-complete-no-error-handling
 *   audio-transcriptions-no-error-handling
 *   audio-speech-no-error-handling
 *   fim-complete-no-error-handling
 *   classifiers-moderate-no-error-handling
 *   batch-jobs-create-no-error-handling
 */
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// ──────────────────────────────────────────────────
// 1. chat.complete — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_complete_missing(userMessage: string) {
  // SHOULD_FIRE: complete-no-error-handling — chat.complete without try-catch
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.choices?.[0]?.message?.content ?? '';
}

// 1. chat.complete — with try-catch (SHOULD_NOT_FIRE)
async function gt_complete_with_try_catch(userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: chat.complete has try-catch
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 1. chat.complete — with .catch() (SHOULD_NOT_FIRE)
async function gt_complete_with_catch_chain(userMessage: string) {
  // SHOULD_NOT_FIRE: chat.complete has .catch() handler
  const response = await client.chat
    .complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
  return response.choices?.[0]?.message?.content ?? '';
}

// ──────────────────────────────────────────────────
// 2. chat.stream — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_stream_missing(userMessage: string) {
  // SHOULD_FIRE: stream-no-error-handling — chat.stream without try-catch
  const stream = await client.chat.stream({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  return stream;
}

// 2. chat.stream — with try-catch (SHOULD_NOT_FIRE)
async function gt_stream_with_try_catch(userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: chat.stream has try-catch
    const stream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    return stream;
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// 2. chat.stream — with .catch() (SHOULD_NOT_FIRE) — pattern from cline
async function gt_stream_with_catch_chain(userMessage: string) {
  // SHOULD_NOT_FIRE: chat.stream has .catch() handler
  const stream = await client.chat
    .stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
  return stream;
}

// ──────────────────────────────────────────────────
// 3. embeddings.create — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: embeddings-create-no-error-handling
async function gt_embeddings_create_missing(texts: string[]) {
  // SHOULD_FIRE: embeddings-create-no-error-handling — embeddings.create without try-catch
  const response = await client.embeddings.create({
    model: 'mistral-embed',
    inputs: texts,
  });
  return response.data.map((e: { embedding: number[] }) => e.embedding);
}

// 3. embeddings.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_embeddings_create_with_try_catch(texts: string[]) {
  try {
    // SHOULD_NOT_FIRE: embeddings.create has try-catch
    const response = await client.embeddings.create({
      model: 'mistral-embed',
      inputs: texts,
    });
    return response.data.map((e: { embedding: number[] }) => e.embedding);
  } catch (error) {
    console.error('Embeddings error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 4. ocr.process — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: ocr-process-no-error-handling
async function gt_ocr_process_missing(documentUrl: string) {
  // SHOULD_FIRE: ocr-process-no-error-handling — ocr.process without try-catch
  const result = await client.ocr.process({
    model: 'mistral-ocr-latest',
    document: { type: 'document_url', documentUrl },
  } as Parameters<typeof client.ocr.process>[0]);
  return (result as { pages: Array<{ markdown: string }> }).pages.map((p) => p.markdown).join('\n');
}

// 4. ocr.process — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_ocr_process_with_try_catch(documentUrl: string) {
  try {
    // SHOULD_NOT_FIRE: ocr.process has try-catch
    const result = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: { type: 'document_url', documentUrl },
    } as Parameters<typeof client.ocr.process>[0]);
    return (result as { pages: Array<{ markdown: string }> }).pages.map((p) => p.markdown).join('\n');
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. files.upload — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// @expect-violation: files-upload-no-error-handling
async function gt_files_upload_missing(fileBlob: Blob) {
  // SHOULD_FIRE: files-upload-no-error-handling — files.upload without try-catch
  const fileObj = await client.files.upload({
    file: { name: 'training_data.jsonl', data: fileBlob },
  } as Parameters<typeof client.files.upload>[0]);
  return (fileObj as { id: string }).id;
}

// 5. files.upload — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_files_upload_with_try_catch(fileBlob: Blob) {
  try {
    // SHOULD_NOT_FIRE: files.upload has try-catch
    const fileObj = await client.files.upload({
      file: { name: 'training_data.jsonl', data: fileBlob },
    } as Parameters<typeof client.files.upload>[0]);
    return (fileObj as { id: string }).id;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. agents.complete — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_agents_complete_missing(agentId: string, userMessage: string) {
  // SHOULD_FIRE: complete-no-error-handling — agents.complete without try-catch (scanner matches "complete" function name)
  const response = await client.agents.complete({
    agentId,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.choices?.[0]?.message?.content ?? '';
}

// 6. agents.complete — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_agents_complete_with_try_catch(agentId: string, userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: agents.complete has try-catch
    const response = await client.agents.complete({
      agentId,
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('Agent error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 7. fim.complete — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_fim_complete_missing(prompt: string, suffix: string) {
  // SHOULD_FIRE: complete-no-error-handling — fim.complete without try-catch (scanner matches "complete" function name)
  const response = await client.fim.complete({
    model: 'codestral-latest',
    prompt,
    suffix,
  });
  return response.choices?.[0]?.message?.content ?? '';
}

// 7. fim.complete — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_fim_complete_with_try_catch(prompt: string, suffix: string) {
  try {
    // SHOULD_NOT_FIRE: fim.complete has try-catch
    const response = await client.fim.complete({
      model: 'codestral-latest',
      prompt,
      suffix,
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('FIM error:', error);
    throw error;
  }
}
