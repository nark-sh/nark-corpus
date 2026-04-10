/**
 * Fixture: Generic Error Handling for @anthropic-ai/sdk
 *
 * This file demonstrates SUBOPTIMAL error handling patterns.
 * Should trigger WARNING violations (not ERROR).
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * ⚠️ WARNING: Generic catch without error type checking
 * Should trigger: messages-create-generic-catch (WARNING)
 */
async function createMessageWithGenericCatch() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Message:', message.content);
  } catch (error: any) {
    // Generic error handling - no type checking
    console.error('Error:', error.message);
    // Won't differentiate between rate limits, auth errors, server errors
  }
}

/**
 * ⚠️ WARNING: Catch without rate limit handling
 * Should trigger: rate-limit-no-retry-logic (INFO)
 */
async function createMessageWithoutRetryLogic() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Message:', message.content);
  } catch (error: any) {
    // Has try-catch but no retry logic for 429
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * ⚠️ WARNING: Partial error type checking
 * Checks APIError but not specific subclasses
 */
async function createMessageWithPartialTypeCheck() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Message:', message.content);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      // Checks APIError but doesn't differentiate subtypes
      console.error('API Error:', error.status, error.message);
      // Treats 429 (rate limit) same as 500 (server error) same as 401 (auth)
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * ⚠️ WARNING: Stream with generic error handling
 */
async function streamWithGenericCatch() {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Write a story' }],
    });

    try {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          console.log(chunk.delta);
        }
      }
    } catch (error: any) {
      // Generic stream error handling
      console.error('Stream error:', error);
      stream.controller.abort();
    }
  } catch (error: any) {
    // Generic catch for stream creation
    console.error('Failed to create stream:', error);
  }
}

/**
 * ⚠️ INFO: Stream without abort handling
 * Should trigger: stream-abort-not-handled (INFO)
 */
async function streamWithoutAbortHandling() {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Long response' }],
    });

    // No cancellation support
    // No stream.controller.abort()
    // No break statement for early termination
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        console.log(chunk.delta);
      }
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('API Error:', error.status);
    }
  }
}

/**
 * ⚠️ WARNING: Error logging without request ID
 */
async function errorLoggingWithoutRequestId() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Message:', message.content);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      // Logs error but not request_id (important for debugging)
      console.error('API Error:', error.status, error.message);
      // Missing: error.headers?.['request-id']
    }
  }
}

/**
 * ⚠️ WARNING: Silent failure (catch without re-throw)
 */
async function silentFailure() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    return message;
  } catch (error: any) {
    console.error('Error:', error.message);
    // Doesn't re-throw - caller won't know it failed!
    return null;
  }
}

/**
 * ⚠️ WARNING: Generic status code checking
 */
async function genericStatusChecking() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Message:', message.content);
  } catch (error: any) {
    // Checks status but not error type
    if (error.status === 429) {
      console.log('Rate limited');
      // No retry logic, no retry-after header check
    } else if (error.status === 401) {
      console.log('Auth error');
    } else {
      console.error('Other error:', error);
    }
  }
}

/**
 * ⚠️ WARNING: Batch operation without proper error differentiation
 */
async function batchWithGenericCatch(batchId: string) {
  try {
    const batch = await anthropic.messages.batches.retrieve(batchId);

    if (batch.processing_status === 'ended') {
      const results = await anthropic.messages.batches.results(batchId);
      console.log('Results:', results);
    }
  } catch (error: any) {
    // Generic catch - doesn't differentiate 404 from other errors
    console.error('Batch error:', error.message);
  }
}

// Export for testing
export {
  createMessageWithGenericCatch,
  createMessageWithoutRetryLogic,
  createMessageWithPartialTypeCheck,
  streamWithGenericCatch,
  streamWithoutAbortHandling,
  errorLoggingWithoutRequestId,
  silentFailure,
  genericStatusChecking,
  batchWithGenericCatch,
};
