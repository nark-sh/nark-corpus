/**
 * Ground-truth fixture for @anthropic-ai/sdk
 *
 * Annotations use the format:
 * // SHOULD_FIRE: <postcondition-id> — <reason>
 * // SHOULD_NOT_FIRE: <reason>
 *
 * Each annotation applies to the NEXT line (the call site detected by the scanner).
 * The V2 scanner detects violations on the CallExpression node of the awaited call.
 *
 * Postcondition IDs from corpus/packages/@anthropic-ai/sdk/contract.yaml:
 *   messages-create-no-try-catch       — messages.create() without try-catch
 *   messages-stream-no-try-catch       — messages.stream() without try-catch
 *   count-tokens-no-try-catch          — messages.countTokens() without try-catch
 *   batches-create-no-try-catch        — messages.batches.create() without try-catch
 *   batches-result-not-polled          — batch created but results never retrieved
 *   batches-individual-errors-not-handled — batch results consumed without checking result.type
 *   messages-parse-no-try-catch        — messages.parse() without try-catch
 *   messages-parse-null-output-unchecked — parsed_output used without null check
 *   files-upload-no-try-catch          — beta.files.upload() without try-catch
 *
 * Deepen 2026-06-12 additions:
 *   batches-cancel-no-try-catch        — messages.batches.cancel() without try-catch
 *   batches-cancel-state-not-rechecked — cancel→delete in one tick without poll
 *   batches-delete-no-try-catch        — messages.batches.delete() without try-catch
 *   batches-delete-without-prior-cancel — delete called on in-progress batch
 *   batches-results-no-try-catch       — messages.batches.results() awaited without try-catch
 *   batches-results-individual-not-checked — for-await result.type not narrowed
 *   webhooks-unwrap-no-try-catch       — beta.webhooks.unwrap() called without try-catch
 *                                        (SYNC — needs sync-call detection rule)
 *
 * Scanner capability note: The V2 scanner detects await calls that are not wrapped
 * in try-catch. SHOULD_FIRE cases are uncovered awaited calls; SHOULD_NOT_FIRE cases
 * are wrapped in try-catch. New postconditions (batches-result-not-polled, etc.)
 * do not yet have scanner detection rules — they will show as "no detector" and
 * are marked as pending scanner concern via upgrade-concerns.json.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── messages.create() ───────────────────────────────────────────────────────

async function createWithoutTryCatch() {
  // SHOULD_FIRE: messages-create-no-try-catch — messages.create() called without try-catch
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
  });
  console.log(message.content);
}

async function createWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: messages.create() is inside try-catch
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    return message.content;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('API error:', error.status, error.message);
    }
    throw error;
  }
}

// ─── messages.countTokens() ──────────────────────────────────────────────────

async function countTokensWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: countTokens() is inside try-catch
    const result = await anthropic.messages.countTokens({
      model: 'claude-opus-4-6',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    return result.input_tokens;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Token count failed:', error.status, error.message);
    }
    throw error;
  }
}

// ─── messages.batches.create() ───────────────────────────────────────────────

async function batchCreateWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: batches.create() is inside try-catch
    const batch = await anthropic.messages.batches.create({
      requests: [
        {
          custom_id: 'req-1',
          params: {
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            messages: [{ role: 'user', content: 'Hello' }],
          },
        },
      ],
    });
    return batch.id;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Batch creation failed:', error.status, error.message);
    }
    throw error;
  }
}

// ─── messages.parse() ────────────────────────────────────────────────────────

async function parseWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: parse() is inside try-catch
    const result = await anthropic.messages.parse({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'What is 2+2?' }],
    });
    if (result.parsed_output !== null) {
      console.log(result.parsed_output);
    }
    return result;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Parse failed:', error.status, error.message);
    }
    throw error;
  }
}

// ─── beta.files.upload() ─────────────────────────────────────────────────────

async function fileUploadWithTryCatch(fileContent: Buffer) {
  const { toFile } = await import('@anthropic-ai/sdk');
  try {
    // SHOULD_NOT_FIRE: files.upload() is inside try-catch
    const file = await anthropic.beta.files.upload({
      file: await toFile(fileContent, 'document.pdf', { type: 'application/pdf' }),
    });
    if (!file.id) {
      throw new Error('File upload returned no ID');
    }
    return file.id;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 413) {
        console.error('File too large (500 MB limit)');
      } else if (error.status === 403) {
        console.error('Organization storage limit reached (500 GB)');
      } else {
        console.error('Upload failed:', error.status, error.message);
      }
    }
    throw error;
  }
}

// ─── messages.batches.cancel() (deepen 2026-06-12) ───────────────────────────

async function batchCancelWithoutTryCatch(batchId: string) {
  // SHOULD_FIRE: batches-cancel-no-try-catch — batches.cancel() called without try-catch
  const batch = await anthropic.messages.batches.cancel(batchId);
  console.log('canceled', batch.id, batch.processing_status);
}

async function batchCancelWithTryCatch(batchId: string) {
  try {
    // SHOULD_NOT_FIRE: batches.cancel() is inside try-catch
    const batch = await anthropic.messages.batches.cancel(batchId);
    return batch;
  } catch (error) {
    if (error instanceof Anthropic.NotFoundError) {
      // Already gone — non-fatal
      return null;
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Cancel failed:', error.status, error.message);
    }
    throw error;
  }
}

// ─── messages.batches.delete() (deepen 2026-06-12) ───────────────────────────

async function batchDeleteWithoutTryCatch(batchId: string) {
  // SHOULD_FIRE: batches-delete-no-try-catch — batches.delete() called without try-catch
  const deleted = await anthropic.messages.batches.delete(batchId);
  console.log('deleted', deleted.id);
}

async function batchDeleteWithTryCatch(batchId: string) {
  try {
    // SHOULD_NOT_FIRE: batches.delete() is inside try-catch with state verification
    const batch = await anthropic.messages.batches.retrieve(batchId);
    if (batch.processing_status !== 'ended') {
      // Must cancel first per docs:
      // "Message Batches can only be deleted once they've finished processing"
      await anthropic.messages.batches.cancel(batchId);
      // (Production code would then poll until 'ended')
      return null;
    }
    const deleted = await anthropic.messages.batches.delete(batchId);
    return deleted;
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      // In-progress batch
      return null;
    }
    if (error instanceof Anthropic.NotFoundError) {
      return null; // already gone
    }
    throw error;
  }
}

// ─── messages.batches.results() (deepen 2026-06-12) ──────────────────────────

async function batchResultsWithoutTryCatch(batchId: string) {
  // SHOULD_FIRE: batches-results-no-try-catch — batches.results() awaited without try-catch
  const decoder = await anthropic.messages.batches.results(batchId);
  for await (const item of decoder) {
    // Also a SHOULD_FIRE for batches-results-individual-not-checked when the
    // scanner gains detection: item.result.message accessed without narrowing
    if (item.result.type === 'succeeded') {
      console.log(item.custom_id, item.result.message.content);
    }
  }
}

async function batchResultsWithTryCatch(batchId: string) {
  try {
    // SHOULD_NOT_FIRE: results() awaited inside try-catch
    const decoder = await anthropic.messages.batches.results(batchId);
    try {
      for await (const item of decoder) {
        switch (item.result.type) {
          case 'succeeded':
            console.log(item.custom_id, 'ok');
            break;
          case 'errored':
            console.error(item.custom_id, item.result.error);
            break;
          case 'canceled':
          case 'expired':
            console.warn(item.custom_id, item.result.type);
            break;
        }
      }
    } catch (streamErr) {
      console.error('stream interrupted', streamErr);
    }
  } catch (fetchErr) {
    if (fetchErr instanceof Anthropic.BadRequestError) {
      // Batch not ended yet
      return;
    }
    throw fetchErr;
  }
}

// ─── beta.webhooks.unwrap() (deepen 2026-06-12) ──────────────────────────────
// NOTE: unwrap() is SYNCHRONOUS — it does not return a Promise. The V2 scanner
// targets awaited calls. This fixture documents the expected detection path
// for a future synchronous-call detection rule. See upgrade-concerns.json.

function webhookUnwrapWithoutTryCatch(rawBody: string, headers: Record<string, string>) {
  // SHOULD_FIRE (when synchronous-call detection lands):
  //   webhooks-unwrap-no-try-catch — unwrap() called without try-catch
  const event = anthropic.beta.webhooks.unwrap(rawBody, { headers });
  console.log('event', (event as { data: { type: string } }).data.type);
}

function webhookUnwrapWithTryCatch(rawBody: string, headers: Record<string, string>) {
  try {
    // SHOULD_NOT_FIRE: unwrap() is inside try-catch with distinct error branches
    const event = anthropic.beta.webhooks.unwrap(rawBody, { headers });
    return event;
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Malformed JSON body — return 400 upstream
      return { status: 400 };
    }
    // standardwebhooks.WebhookVerificationError or missing-key Error
    return { status: 401 };
  }
}

export {
  createWithoutTryCatch,
  createWithTryCatch,
  countTokensWithTryCatch,
  batchCreateWithTryCatch,
  parseWithTryCatch,
  fileUploadWithTryCatch,
  // Deepen 2026-06-12:
  batchCancelWithoutTryCatch,
  batchCancelWithTryCatch,
  batchDeleteWithoutTryCatch,
  batchDeleteWithTryCatch,
  batchResultsWithoutTryCatch,
  batchResultsWithTryCatch,
  webhookUnwrapWithoutTryCatch,
  webhookUnwrapWithTryCatch,
};
