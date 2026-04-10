/**
 * Instance usage for p-queue — tests class-level detection.
 */

import PQueue from 'p-queue';

// Class with queue as a property
export class TaskProcessor {
  private queue: PQueue;

  constructor() {
    this.queue = new PQueue({ concurrency: 5, timeout: 30000 });
  }

  // VIOLATION: no try-catch on await queue.add()
  async processItem(item: string) {
    await this.queue.add(async () => {
      console.log(`Processing: ${item}`);
    });
  }

  // CORRECT: try-catch present
  async processItemSafe(item: string) {
    try {
      await this.queue.add(async () => {
        console.log(`Processing: ${item}`);
      });
    } catch (error) {
      console.error(`Failed to process ${item}:`, error);
    }
  }
}
