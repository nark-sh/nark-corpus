/**
 * PROPER error handling for p-queue
 * All queue.add() calls handled → ZERO violations expected.
 */

import PQueue from 'p-queue';

// CORRECT: await queue.add() inside try-catch
export async function fetchWithQueue() {
  const queue = new PQueue({ concurrency: 2 });
  const results: string[] = [];

  try {
    await queue.add(async () => {
      // Some async task that can throw
      results.push('item1');
    });
  } catch (error) {
    console.error('Task failed:', error);
    throw error;
  }

  return results;
}

// CORRECT: queue.add().catch()
export function addWithCatch(queue: PQueue, task: () => Promise<void>) {
  queue.add(task).catch((error) => {
    console.error('Task error:', error);
  });
}

// CORRECT: queue.add() with .catch() chain (synchronous addition, not awaited)
export function addItemsWithCatch(queue: PQueue, items: string[]) {
  for (const item of items) {
    // .catch() on the returned Promise handles rejections
    queue.add(async () => {
      return `processed: ${item}`;
    }).catch((error) => {
      console.error(`Failed to process ${item}:`, error);
    });
  }
}

// CORRECT: await queue.add() inside existing try-catch (outer try handles error)
export async function queueInsideExistingTryCatch() {
  const queue = new PQueue({ concurrency: 1 });

  try {
    const result = await queue.add(async () => {
      return 'result';
    });
    return result;
  } catch (err) {
    throw err;
  }
}

// CORRECT: queue with timeout — TimeoutError handled
export async function queueWithTimeoutHandling() {
  const queue = new PQueue({ concurrency: 1, timeout: 5000, throwOnTimeout: true });

  try {
    await queue.add(async () => {
      // Long-running task
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
  } catch (error) {
    // Handles TimeoutError from p-queue
    console.error('Task timed out or failed:', error);
    throw error;
  }
}
