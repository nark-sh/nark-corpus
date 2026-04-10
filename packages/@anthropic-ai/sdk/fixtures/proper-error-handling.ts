/**
 * Fixture: Proper Error Handling for @anthropic-ai/sdk
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should NOT trigger any violations.
 */

import Anthropic from '@anthropic-ai/sdk';

// ✅ CORRECT: Validate API key before client creation
function createClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new Anthropic({ apiKey });
}

const anthropic = createClient();

/**
 * ✅ CORRECT: messages.create() with try-catch and error type checking
 */
async function createMessageWithProperErrorHandling() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello, Claude' }],
    });
    console.log('Message created:', message.content);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      // Handle rate limiting with retry
      const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
      console.error(`Rate limited. Retry after ${retryAfter}s`);
      // Implement retry logic
    } else if (error instanceof Anthropic.AuthenticationError) {
      // Handle authentication errors
      console.error('Authentication failed. Check API key.');
      throw new Error('Invalid ANTHROPIC_API_KEY');
    } else if (error instanceof Anthropic.APIError) {
      // Handle other API errors
      console.error(`API Error (${error.status}):`, error.message);
      console.error('Request ID:', error.headers?.['request-id']);

      if (error.status === 500 || error.status === 529) {
        console.log('Server error. Implementing backoff...');
      }
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

/**
 * ✅ CORRECT: messages.stream() with proper error handling
 */
async function streamMessageWithProperHandling() {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Write a short story' }],
    });

    try {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          if (chunk.delta.type === 'text_delta') {
            process.stdout.write(chunk.delta.text);
          }
        }
      }
    } catch (streamError) {
      console.error('Stream processing error:', streamError);
      stream.controller.abort();
    } finally {
      // Cleanup
      console.log('\nStream completed or aborted');
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Failed to start stream (${error.status}):`, error.message);
    } else {
      console.error('Unexpected error starting stream:', error);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Retry logic for rate limits with exponential backoff
 */
async function createMessageWithRetry(maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
      });
      return message;
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        const retryAfter = parseInt(error.headers?.['retry-after'] || '1');
        const backoff = Math.min(retryAfter * 1000, Math.pow(2, retries) * 1000);

        console.log(`Rate limited. Waiting ${backoff}ms before retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        retries++;
      } else if (error instanceof Anthropic.APIError && (error.status === 500 || error.status === 529)) {
        // Server error - exponential backoff
        const backoff = Math.pow(2, retries) * 1000;
        console.log(`Server error (${error.status}). Waiting ${backoff}ms before retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        retries++;
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded`);
}

/**
 * ✅ CORRECT: Stream with cancellation support
 */
async function streamWithCancellation(signal: AbortSignal) {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Long response' }],
    });

    // Support cancellation
    signal.addEventListener('abort', () => {
      console.log('Cancelling stream...');
      stream.controller.abort();
    });

    try {
      for await (const chunk of stream) {
        if (signal.aborted) {
          break;
        }

        if (chunk.type === 'content_block_delta') {
          if (chunk.delta.type === 'text_delta') {
            process.stdout.write(chunk.delta.text);
          }
        }
      }
    } catch (streamError) {
      if (!signal.aborted) {
        console.error('Stream error:', streamError);
      }
      stream.controller.abort();
    } finally {
      console.log('\nStream cleanup');
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Failed to create stream:', error.status, error.message);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Batch processing with proper error handling
 */
async function processBatchWithErrorHandling(batchId: string) {
  try {
    const batch = await anthropic.messages.batches.retrieve(batchId);

    if (batch.processing_status === 'ended') {
      const results = await anthropic.messages.batches.results(batchId);
      console.log('Batch results:', results);
    } else {
      console.log('Batch still processing...');
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 404) {
        console.error('Batch not found:', batchId);
      } else {
        console.error('Batch error:', error.status, error.message);
      }
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Multiple operations with comprehensive error handling
 */
async function multipleOperationsWithErrorHandling() {
  try {
    // First request
    const message1 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [{ role: 'user', content: 'First question' }],
    });

    console.log('First message:', message1.content);

    // Second request
    const message2 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: message1.content[0].type === 'text' ? message1.content[0].text : '' },
        { role: 'user', content: 'Follow-up question' },
      ],
    });

    console.log('Second message:', message2.content);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('Rate limit hit during multi-request flow');
      // Implement backoff and retry
    } else if (error instanceof Anthropic.APIError) {
      console.error('API error:', error.status, error.message);
      console.error('Request ID:', error.headers?.['request-id']);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Export for testing
export {
  createClient,
  createMessageWithProperErrorHandling,
  streamMessageWithProperHandling,
  createMessageWithRetry,
  streamWithCancellation,
  processBatchWithErrorHandling,
  multipleOperationsWithErrorHandling,
};
