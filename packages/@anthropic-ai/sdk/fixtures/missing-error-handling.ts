/**
 * Fixture: Missing Error Handling for @anthropic-ai/sdk
 *
 * This file demonstrates INCORRECT error handling patterns.
 * Should trigger ERROR violations.
 */

import Anthropic from '@anthropic-ai/sdk';

// ❌ VIOLATION: No API key validation
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * ❌ VIOLATION: messages.create() without try-catch
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
async function createMessageWithoutTryCatch() {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
  });

  console.log('Message:', message.content);
  // Will crash on 401, 429, 500, 529 errors
}

/**
 * ❌ VIOLATION: messages.stream() without try-catch
 * Should trigger: messages-stream-no-try-catch (ERROR)
 */
async function streamMessageWithoutTryCatch() {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Write a story' }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        process.stdout.write(chunk.delta.text);
      }
    }
  }
  // Will crash on network errors or API failures
}

/**
 * ❌ VIOLATION: Promise without .catch()
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
function createMessageWithoutCatch() {
  anthropic.messages
    .create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    })
    .then(message => {
      console.log('Message:', message.content);
    });
  // Missing .catch() - unhandled promise rejection!
}

/**
 * ❌ VIOLATION: Batch operations without error handling
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
async function createBatchWithoutHandling() {
  const batch = await anthropic.messages.batches.create({
    requests: [
      {
        custom_id: '1',
        params: {
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{ role: 'user', content: 'Question 1' }],
        },
      },
    ],
  });

  console.log('Batch created:', batch.id);
  // No error handling for rate limits or API failures
}

/**
 * ❌ VIOLATION: Retrieve batch without error handling
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
async function retrieveBatchWithoutHandling(batchId: string) {
  const batch = await anthropic.messages.batches.retrieve(batchId);

  if (batch.processing_status === 'ended') {
    const results = await anthropic.messages.batches.results(batchId);
    console.log('Results:', results);
  }
  // No error handling for 404 or API failures
}

/**
 * ❌ VIOLATION: Stream iteration without error handling
 * Should trigger: messages-stream-no-try-catch (ERROR)
 */
async function iterateStreamWithoutHandling() {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Long response' }],
  });

  // No try-catch around iteration
  for await (const chunk of stream) {
    // Process chunk
    if (chunk.type === 'content_block_delta') {
      console.log(chunk.delta);
    }
  }
  // Mid-stream errors will crash
}

/**
 * ❌ VIOLATION: Multiple requests without error handling
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
async function multipleRequestsWithoutHandling() {
  // First request - no error handling
  const message1 = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 512,
    messages: [{ role: 'user', content: 'Question 1' }],
  });

  // Second request - no error handling
  const message2 = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 512,
    messages: [{ role: 'user', content: 'Question 2' }],
  });

  console.log('Messages:', message1, message2);
  // One failure breaks entire flow
}

/**
 * ❌ VIOLATION: Nested async call without error handling
 * Should trigger: messages-create-no-try-catch (ERROR)
 */
async function nestedCallWithoutHandling() {
  async function innerCreate() {
    return await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
  }

  const message = await innerCreate();
  console.log('Message:', message);
  // No error handling at any level
}

/**
 * ❌ VIOLATION: API key not validated before client creation
 * Should trigger: api-key-not-validated (WARNING)
 */
function createClientWithoutValidation() {
  // No check if API key exists
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * ❌ VIOLATION: Empty API key allowed
 * Should trigger: api-key-not-validated (WARNING)
 */
function createClientWithEmptyKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  // No validation if apiKey is empty string
  return new Anthropic({ apiKey });
}

// Export for testing
export {
  createMessageWithoutTryCatch,
  streamMessageWithoutTryCatch,
  createMessageWithoutCatch,
  createBatchWithoutHandling,
  retrieveBatchWithoutHandling,
  iterateStreamWithoutHandling,
  multipleRequestsWithoutHandling,
  nestedCallWithoutHandling,
  createClientWithoutValidation,
  createClientWithEmptyKey,
};
