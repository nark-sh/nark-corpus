/**
 * Wrapper-shell stubs for §8 ground-truth fixtures.
 *
 * Modeled after blinko's `app/src/store/standard/PromiseState.ts` shape.
 * These are NOT real implementations — only signatures used to make the
 * ground-truth fixture type-check while exercising the wrapper-shell
 * suppression heuristic.
 *
 * Evidence:
 *   - work-packages/25-pr-initiative/prs/11-pr-blinko.md
 *   - concern-20260515-section8-promisecall-promisestate-wrapper-shells
 *   - concern-20260515-section8-trpc-query-wrapper-shells
 */

/**
 * Top-level helper: wraps a promise in try-catch (real impl routes errors
 * to a toast handler). Real implementation is in blinko's PromiseState.ts:21-35.
 */
export function PromiseCall<T>(promise: Promise<T> | T): Promise<T | undefined> {
  try {
    return Promise.resolve(promise);
  } catch (e) {
    console.error(e);
    return Promise.resolve(undefined);
  }
}

/**
 * Wrapper class — takes a callback in `function:` property of options object.
 * The class's `.call()` method wraps `await this.function(...)` in try-catch.
 * Real implementation in blinko's PromiseState.ts:37+.
 */
export class PromiseState<Args extends unknown[], Result> {
  function: (...args: Args) => Promise<Result>;
  constructor(options: { function: (...args: Args) => Promise<Result> }) {
    this.function = options.function;
  }
  async call(...args: Args): Promise<Result | undefined> {
    try {
      return await this.function(...args);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}

/**
 * Generic safe-async wrapper. Body holds try-catch.
 */
export async function safeAsync<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
