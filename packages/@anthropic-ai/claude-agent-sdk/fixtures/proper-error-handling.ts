/**
 * Proper error handling for @anthropic-ai/claude-agent-sdk
 * Should NOT trigger any violations.
 */
import { query, AbortError } from '@anthropic-ai/claude-agent-sdk';

/**
 * Properly handles both AbortError and general errors when iterating the query stream.
 * Should NOT trigger violations.
 */
async function runAgentWithProperErrorHandling(prompt: string): Promise<void> {
  const abortController = new AbortController();

  try {
    for await (const message of query({ prompt, options: { abortController } })) {
      console.log('message:', message);
    }
  } catch (error) {
    if (error instanceof AbortError || (error as Error)?.name === 'AbortError') {
      // Intentional abort — handle gracefully
      console.log('Query was aborted');
      return;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Properly wraps both the query() call and the for-await loop.
 * Should NOT trigger violations.
 */
async function runAgentWithSeparateTryCatch(prompt: string): Promise<void> {
  let stream;
  try {
    stream = query({ prompt });
  } catch (queryError) {
    console.error('Failed to create query:', queryError);
    throw queryError;
  }

  try {
    for await (const message of stream) {
      console.log('message:', message);
    }
  } catch (streamError) {
    const isAbort = (streamError as Error)?.name === 'AbortError';
    if (isAbort) {
      console.log('Stream aborted');
      return;
    }
    throw streamError;
  }
}
