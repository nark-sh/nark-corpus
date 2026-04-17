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
import { query, unstable_v2_prompt, unstable_v2_createSession } from '@anthropic-ai/claude-agent-sdk';

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

// ─── V2 API fixtures (unstable_v2_prompt, SDKSession) ───────────────────────

// --- V2 API fixtures (unstable_v2_prompt, SDKSession) ---
// NOTE: Scanner rules for V2 API not yet implemented.
// These are documented fixtures for future detection via bc-scanner-upgrade.
// Concerns queued: concern-20260417-claude-agent-sdk-deepen-8 through -10

// Demonstrates v2-prompt-result-error-unchecked + v2-prompt-no-try-catch violations
// (no scanner rules yet — proactive contract added via API surface analysis)
async function v2PromptMissingSubtypeCheck(): Promise<string> {
  const result = await unstable_v2_prompt('What is 2 + 2?', { model: 'claude-opus-4-7' });
  return (result as any).result; // silently undefined when subtype is 'error_*'
}

// Demonstrates proper pattern for unstable_v2_prompt()
async function v2PromptWithProperChecking(): Promise<string> {
  try {
    const result = await unstable_v2_prompt('What is 2 + 2?', { model: 'claude-opus-4-7' });
    if (result.subtype === 'success') {
      return result.result;
    } else {
      throw new Error(`Agent failed: ${result.errors.join(', ')}`);
    }
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error; // intentional abort
    }
    throw error;
  }
}

// Demonstrates v2-session-not-closed violation
// (no scanner rules yet — proactive contract added via API surface analysis)
async function v2SessionNotClosed(): Promise<void> {
  const session = unstable_v2_createSession({ model: 'claude-opus-4-7' });
  await session.send('Hello!');
  for await (const msg of session.stream()) {
    if (msg.type === 'result') break;
  }
  // Missing: session.close() or `await using`
}

// Demonstrates proper cleanup for SDKSession
async function v2SessionWithProperCleanup(): Promise<void> {
  const session = unstable_v2_createSession({ model: 'claude-opus-4-7' });
  try {
    await session.send('Hello!');
    for await (const msg of session.stream()) {
      if (msg.type === 'result') break;
    }
  } finally {
    session.close();
  }
}
