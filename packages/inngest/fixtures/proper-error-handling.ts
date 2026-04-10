/**
 * Fixture: proper-error-handling.ts
 *
 * Demonstrates CORRECT usage of inngest.
 * All inngest.send() calls are wrapped in try/catch.
 * Should produce ZERO violations.
 */

import { Inngest } from 'inngest';

const inngest = new Inngest({ id: 'my-app' });

// ─── 1. Basic send with try-catch ────────────────────────────────────────────

/**
 * Correct: inngest.send() wrapped in try-catch.
 */
export async function sendEventWithTryCatch(userId: string) {
  try {
    const result = await inngest.send({
      name: 'app/user.created',
      data: { userId },
    });
    return result;
  } catch (error) {
    console.error('Failed to send Inngest event:', error);
    throw error;
  }
}

// ─── 2. Send with .catch() chain ─────────────────────────────────────────────

/**
 * Correct: inngest.send() with .catch() — also satisfies the postcondition.
 */
export async function sendEventWithCatch(orderId: string) {
  const result = await inngest.send({
    name: 'app/order.placed',
    data: { orderId },
  }).catch((error) => {
    console.error('Inngest send failed:', error);
    return null;
  });
  return result;
}

// ─── 3. Batch send with try-catch ────────────────────────────────────────────

/**
 * Correct: sending multiple events in one call, wrapped in try-catch.
 */
export async function sendMultipleEventsWithTryCatch(userIds: string[]) {
  try {
    const result = await inngest.send(
      userIds.map((userId) => ({
        name: 'app/user.created' as const,
        data: { userId },
      }))
    );
    return result;
  } catch (error) {
    console.error('Failed to send batch Inngest events:', error);
    return null;
  }
}

// ─── 4. serve() — no try-catch needed ────────────────────────────────────────

/**
 * Correct: serve() is a factory call, NOT an HTTP request.
 * No try-catch required.
 */
// import { serve } from 'inngest/next';
// export const { GET, POST, PUT } = serve({ client: inngest, functions: [] });

// ─── 5. createFunction — no try-catch needed ─────────────────────────────────

/**
 * Correct: createFunction() is a synchronous registration call.
 * No try-catch required.
 */
export const myFunction = inngest.createFunction(
  { id: 'my-function' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
    // step methods also don't need try-catch — Inngest handles retries
    await step.sleep('wait-a-moment', '1s');
    return { processed: event.data };
  },
);

// ─── 6. send inside a class with try-catch ───────────────────────────────────

/**
 * Correct: instance stored on class, send() still wrapped in try-catch.
 */
export class EventPublisher {
  private client: Inngest;

  constructor() {
    this.client = new Inngest({ id: 'my-app' });
  }

  async publishUserCreated(userId: string) {
    try {
      return await this.client.send({
        name: 'app/user.created',
        data: { userId },
      });
    } catch (error) {
      console.error('Failed to publish user created event:', error);
      throw error;
    }
  }
}
