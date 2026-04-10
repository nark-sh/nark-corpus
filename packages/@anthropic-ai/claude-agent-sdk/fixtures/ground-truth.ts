/**
 * Ground-truth fixture for @anthropic-ai/claude-agent-sdk
 *
 * Annotations use the format:
 * // SHOULD_FIRE: <postcondition-id> — <reason>
 * // SHOULD_NOT_FIRE: <reason>
 *
 * Each annotation applies to the NEXT line (the call site detected by the scanner).
 * The V2 scanner detects violations on the `query({...})` CallExpression node.
 *
 * Scanner capability note: The scanner detects query() calls without try/catch.
 * It fires on the `query({...})` CallExpression regardless of whether the caller
 * uses `for await` or stores the result. The try/catch must wrap the query() call
 * itself (or the for-await loop that contains it) for the violation to be suppressed.
 */
import { query } from '@anthropic-ai/claude-agent-sdk';

async function noTryCatch(prompt: string): Promise<void> {
  // SHOULD_FIRE: query-abort-error — query() called in for-await without try/catch, AbortError propagates
  for await (const message of query({ prompt })) {
    console.log(message);
  }
}

async function withTryCatch(prompt: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: query() is inside try/catch that wraps the for-await loop
    for await (const message of query({ prompt })) {
      console.log(message);
    }
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return;
    }
    throw error;
  }
}
