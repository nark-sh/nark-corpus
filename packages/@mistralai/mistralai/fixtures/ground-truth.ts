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
 *   conversations-start-no-error-handling   (added pass 2)
 *   conversations-append-no-error-handling  (added pass 2)
 *   workflows-execute-no-error-handling     (added pass 2)
 *   libraries-create-no-error-handling      (added pass 2)
 *   libraries-documents-upload-no-error-handling (added pass 2)
 *   classifiers-classify-no-error-handling  (added pass 2)
 *   fine-tuning-jobs-create-no-error-handling (added pass 3)
 *   fine-tuning-jobs-start-no-error-handling  (added pass 3)
 *   connectors-call-tool-no-error-handling    (added pass 3)
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

// ──────────────────────────────────────────────────────────
// 8. beta.conversations.start — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: conversations-start-no-error-handling
async function gt_conversations_start_missing(userMessage: string) {
  // SHOULD_FIRE: conversations-start-no-error-handling — no try-catch
  const response = await client.beta.conversations.start({
    model: 'mistral-large-latest',
    inputs: [{ role: 'user', content: userMessage }],
  });
  return response;
}

// 8. beta.conversations.start — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_conversations_start_with_try_catch(userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: conversations.start has try-catch
    const response = await client.beta.conversations.start({
      model: 'mistral-large-latest',
      inputs: [{ role: 'user', content: userMessage }],
    });
    return response;
  } catch (error) {
    console.error('Conversation start error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 9. beta.conversations.append — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: conversations-append-no-error-handling
async function gt_conversations_append_missing(conversationId: string, userMessage: string) {
  // SHOULD_FIRE: conversations-append-no-error-handling — no try-catch
  const response = await client.beta.conversations.append({
    conversationId,
    conversationAppendRequest: {
      inputs: [{ role: 'user', content: userMessage }],
    },
  });
  return response;
}

// 9. beta.conversations.append — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_conversations_append_with_try_catch(conversationId: string, userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: conversations.append has try-catch
    const response = await client.beta.conversations.append({
      conversationId,
      conversationAppendRequest: {
        inputs: [{ role: 'user', content: userMessage }],
      },
    });
    return response;
  } catch (error) {
    console.error('Conversation append error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 10. workflows.executeWorkflow — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: workflows-execute-no-error-handling
async function gt_workflows_execute_missing(workflowId: string, inputs: Record<string, unknown>) {
  // SHOULD_FIRE: workflows-execute-no-error-handling — no try-catch
  const result = await client.workflows.executeWorkflow({
    workflowIdentifier: workflowId,
    workflowExecutionRequest: { inputs },
  });
  return result;
}

// 10. workflows.executeWorkflow — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_workflows_execute_with_try_catch(workflowId: string, inputs: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: workflows.executeWorkflow has try-catch
    const result = await client.workflows.executeWorkflow({
      workflowIdentifier: workflowId,
      workflowExecutionRequest: { inputs },
    });
    return result;
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 11. beta.libraries.create — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: embeddings-create-no-error-handling
// NOTE: scanner matches by method name "create" — fires embeddings-create-no-error-handling.
// libraries-create-no-error-handling is the semantic postcondition; scanner concern queued.
async function gt_libraries_create_missing(libraryName: string) {
  // SHOULD_FIRE: scanner detects "create" method without try-catch
  const library = await client.beta.libraries.create({
    name: libraryName,
    description: 'Knowledge base library',
  });
  return library.id;
}

// 11. beta.libraries.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_libraries_create_with_try_catch(libraryName: string) {
  try {
    // SHOULD_NOT_FIRE: libraries.create has try-catch
    const library = await client.beta.libraries.create({
      name: libraryName,
      description: 'Knowledge base library',
    });
    return library.id;
  } catch (error) {
    console.error('Library creation error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 12. beta.libraries.documents.upload — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: files-upload-no-error-handling
// NOTE: scanner matches by method name "upload" — fires files-upload-no-error-handling.
// libraries-documents-upload-no-error-handling is the semantic postcondition; scanner concern queued.
async function gt_libraries_documents_upload_missing(libraryId: string, fileBlob: Blob) {
  // SHOULD_FIRE: scanner detects "upload" method without try-catch
  const doc = await client.beta.libraries.documents.upload({
    libraryId,
    file: fileBlob,
    name: 'document.pdf',
  });
  return doc.id;
}

// 12. beta.libraries.documents.upload — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_libraries_documents_upload_with_try_catch(libraryId: string, fileBlob: Blob) {
  try {
    // SHOULD_NOT_FIRE: libraries.documents.upload has try-catch
    const doc = await client.beta.libraries.documents.upload({
      libraryId,
      file: fileBlob,
      name: 'document.pdf',
    });
    return doc.id;
  } catch (error) {
    console.error('Library document upload error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 13. classifiers.classify — missing try-catch (SHOULD_FIRE)
// Added in depth pass 2 (2026-04-16)
// ──────────────────────────────────────────────────────────

// @expect-violation: classifiers-classify-no-error-handling
async function gt_classifiers_classify_missing(modelId: string, userText: string) {
  // SHOULD_FIRE: classifiers-classify-no-error-handling — no try-catch
  const result = await client.classifiers.classify({
    model: modelId,
    inputs: [userText],
  });
  return result.data[0];
}

// 13. classifiers.classify — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_classifiers_classify_with_try_catch(modelId: string, userText: string) {
  try {
    // SHOULD_NOT_FIRE: classifiers.classify has try-catch
    const result = await client.classifiers.classify({
      model: modelId,
      inputs: [userText],
    });
    return result.data[0];
  } catch (error) {
    console.error('Classifier error:', error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// 14. fine_tuning.jobs.create — missing try-catch (SHOULD_FIRE)
// Added in depth pass 3 (2026-04-16, deepen-stream-2 pass 5)
// ──────────────────────────────────────────────────────────

// @expect-violation: fine-tuning-jobs-create-no-error-handling
async function gt_fine_tuning_jobs_create_missing(uploadedFileId: string) {
  // SHOULD_FIRE: fine-tuning-jobs-create-no-error-handling — no try-catch
  const job = await client.fineTuning.jobs.create({
    model: 'open-mistral-7b',
    trainingFiles: [{ fileId: uploadedFileId }],
    hyperparameters: { trainingSteps: 10, learningRate: 0.0001 },
  });
  return job.id;
}

// 14. fine_tuning.jobs.create — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_fine_tuning_jobs_create_with_try_catch(uploadedFileId: string) {
  try {
    // SHOULD_NOT_FIRE: fine_tuning.jobs.create has try-catch
    const job = await client.fineTuning.jobs.create({
      model: 'open-mistral-7b',
      trainingFiles: [{ fileId: uploadedFileId }],
      hyperparameters: { trainingSteps: 10, learningRate: 0.0001 },
    });
    return job.id;
  } catch (error) {
    console.error('Fine-tuning job creation error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 15. fine_tuning.jobs.start — missing try-catch (SHOULD_FIRE)
// Added in depth pass 3 (2026-04-16, deepen-stream-2 pass 5)
// ──────────────────────────────────────────────────────────

// @expect-violation: fine-tuning-jobs-start-no-error-handling
async function gt_fine_tuning_jobs_start_missing(jobId: string) {
  // SHOULD_FIRE: fine-tuning-jobs-start-no-error-handling — no try-catch
  const job = await client.fineTuning.jobs.start({ jobId });
  return job.status;
}

// 15. fine_tuning.jobs.start — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_fine_tuning_jobs_start_with_try_catch(jobId: string) {
  try {
    // SHOULD_NOT_FIRE: fine_tuning.jobs.start has try-catch
    const job = await client.fineTuning.jobs.start({ jobId });
    return job.status;
  } catch (error) {
    console.error('Fine-tuning job start error:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────
// 16. beta.connectors.callTool — missing try-catch (SHOULD_FIRE)
// Added in depth pass 3 (2026-04-16, deepen-stream-2 pass 5)
// ──────────────────────────────────────────────────────────

// @expect-violation: connectors-call-tool-no-error-handling
async function gt_connectors_call_tool_missing(connectorId: string, query: string) {
  // SHOULD_FIRE: connectors-call-tool-no-error-handling — no try-catch
  const result = await client.beta.connectors.callTool({
    connectorIdOrName: connectorId,
    toolName: 'query_database',
    connectorCallToolRequest: { arguments: { query } },
  });
  return result.content;
}

// 16. beta.connectors.callTool — with try-catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_connectors_call_tool_with_try_catch(connectorId: string, query: string) {
  try {
    // SHOULD_NOT_FIRE: beta.connectors.callTool has try-catch
    const result = await client.beta.connectors.callTool({
      connectorIdOrName: connectorId,
      toolName: 'query_database',
      connectorCallToolRequest: { arguments: { query } },
    });
    return result.content;
  } catch (error) {
    console.error('MCP connector tool call error:', error);
    throw error;
  }
}
