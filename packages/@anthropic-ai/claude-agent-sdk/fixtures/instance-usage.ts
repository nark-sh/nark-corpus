/**
 * Instance-based usage patterns for @anthropic-ai/claude-agent-sdk
 * Tests detection when query is stored in a variable or class property.
 */
import { query } from '@anthropic-ai/claude-agent-sdk';

class AgentRunner {
  private abortController: AbortController;

  constructor() {
    this.abortController = new AbortController();
  }

  /**
   * Runs query using a stored reference — missing error handling.
   * Should trigger violation: query-abort-error
   */
  async run(prompt: string): Promise<void> {
    const claudeQuery = query;
    // ❌ No try/catch
    for await (const message of claudeQuery({ prompt, options: { abortController: this.abortController } })) {
      console.log('message:', message);
    }
  }

  /**
   * Properly handles AbortError in a class method.
   * Should NOT trigger violations.
   */
  async runWithHandling(prompt: string): Promise<void> {
    try {
      for await (const message of query({ prompt, options: { abortController: this.abortController } })) {
        console.log('message:', message);
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        console.log('Aborted gracefully');
        return;
      }
      throw error;
    }
  }
}
