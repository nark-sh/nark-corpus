/**
 * MISSING error handling for p-queue
 * queue.add() without error handling → violations expected.
 */

import PQueue from 'p-queue';

// VIOLATION: await queue.add() without try-catch
export async function addWithoutTryCatch(queue: PQueue) {
  // No try-catch — if task throws, unhandled rejection crashes the process
  await queue.add(async () => {
    throw new Error('Task failed');
  });
}

// VIOLATION: queue.add() without .catch() or await+try-catch
export function addWithoutErrorHandling(queue: PQueue, items: string[]) {
  for (const item of items) {
    // No .catch() — if task throws, rejection is unhandled
    queue.add(async () => {
      // Some async work that can fail
      if (!item) throw new Error('Empty item');
    });
  }
}

// VIOLATION: directly awaited without try-catch
export async function directAwaitNoTryCatch() {
  const queue = new PQueue({ concurrency: 3 });
  // No try-catch around the await
  const result = await queue.add(async () => {
    return 'some result';
  });
  return result;
}
