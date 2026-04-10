/**
 * Fixture: instance-usage.ts
 *
 * Tests that the analyzer detects violations when inngest.send() is called
 * through class instances, stored references, and indirect patterns.
 * Should produce ERROR violations where try-catch is missing.
 */

import { Inngest } from 'inngest';

// ─── 1. Inngest client stored as class field ──────────────────────────────────

export class JobQueue {
  private inngest: Inngest;

  constructor() {
    this.inngest = new Inngest({ id: 'job-queue-app' });
  }

  /**
   * WRONG: send on class field without try-catch.
   */
  async dispatch(eventName: string, data: Record<string, unknown>) {
    // should trigger violation — this.inngest is an Inngest instance
    await this.inngest.send({
      name: eventName,
      data,
    });
  }

  /**
   * Correct: send on class field with try-catch.
   */
  async dispatchSafe(eventName: string, data: Record<string, unknown>) {
    try {
      return await this.inngest.send({
        name: eventName,
        data,
      });
    } catch (error) {
      console.error('Event dispatch failed:', error);
      return null;
    }
  }
}

// ─── 2. Shared inngest instance imported from module ─────────────────────────

const sharedClient = new Inngest({ id: 'shared-app' });

/**
 * WRONG: using a shared/module-level inngest instance without try-catch.
 */
export async function triggerWithSharedInstance(orderId: string) {
  // should trigger violation
  await sharedClient.send({
    name: 'app/order.created',
    data: { orderId },
  });
}

/**
 * Correct: shared instance with try-catch.
 */
export async function triggerWithSharedInstanceSafe(orderId: string) {
  try {
    return await sharedClient.send({
      name: 'app/order.created',
      data: { orderId },
    });
  } catch (error) {
    console.error('Failed to trigger order event:', error);
    throw error;
  }
}

// ─── 3. Inngest passed as dependency ─────────────────────────────────────────

export class NotificationService {
  constructor(private readonly client: Inngest) {}

  /**
   * WRONG: injected client used without try-catch.
   */
  async notify(userId: string, message: string) {
    // should trigger violation
    await this.client.send({
      name: 'app/notification.sent',
      data: { userId, message },
    });
  }
}
