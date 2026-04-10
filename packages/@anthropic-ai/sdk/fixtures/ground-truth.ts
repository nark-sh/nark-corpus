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

export {
  createWithoutTryCatch,
  createWithTryCatch,
  countTokensWithTryCatch,
  batchCreateWithTryCatch,
  parseWithTryCatch,
  fileUploadWithTryCatch,
};
