/**
 * Missing error handling for @anthropic-ai/claude-agent-sdk
 * Should trigger ERROR violations.
 */
import { query } from '@anthropic-ai/claude-agent-sdk';

/**
 * No try/catch around the for-await loop — AbortError will propagate as unhandled.
 * Should trigger violation: query-abort-error
 */
async function runAgentMissingErrorHandling(prompt: string): Promise<void> {
  // ❌ No try/catch — AbortError will propagate unhandled
  for await (const message of query({ prompt })) {
    console.log('message:', message);
  }
}

/**
 * No try/catch around either the query() call or the for-await loop.
 * Should trigger violation: query-abort-error, query-network-process-error
 */
async function runAgentNoCatchAtAll(prompt: string): Promise<void> {
  const abortController = new AbortController();
  // ❌ No try/catch around query() call
  const stream = query({ prompt, options: { abortController } });
  // ❌ No try/catch around for-await
  for await (const message of stream) {
    console.log('message:', message);
  }
}
