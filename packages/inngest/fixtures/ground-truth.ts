/**
 * inngest Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the inngest contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - inngest.send() (Inngest class method) requires try-catch — makes HTTP call to Inngest API
 *   - serve() does NOT require try-catch — factory function, not a network call
 *   - createFunction() does NOT require try-catch — synchronous registration
 *   - step methods inside handlers do NOT require try-catch — Inngest manages retries
 *
 * Contracted postconditions:
 *   send-no-try-catch: inngest.send() called without try/catch
 *
 * Coverage:
 *   - Section 1: bare send() → SHOULD_FIRE
 *   - Section 2: send() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: send() with .catch() chain → SHOULD_NOT_FIRE
 *   - Section 4: try-finally without catch → SHOULD_FIRE
 *   - Section 5: send() on class field without try-catch → SHOULD_FIRE
 *   - Section 6: send() on class field with try-catch → SHOULD_NOT_FIRE
 *   - Section 7: batch send without try-catch → SHOULD_FIRE
 *   - Section 8: serve() without try-catch → SHOULD_NOT_FIRE (serve is not contracted)
 *   - Section 9: createFunction() without try-catch → SHOULD_NOT_FIRE (not contracted)
 */

import { Inngest } from 'inngest';

const inngest = new Inngest({ id: 'ground-truth-app' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare send() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendNoCatch(userId: string) {
  // SHOULD_FIRE: send-no-try-catch — inngest.send() throws on network/auth failure, no try-catch
  const result = await inngest.send({
    name: 'app/user.created',
    data: { userId },
  });
  return result;
}

export async function bareSendNoCatch2(orderId: string) {
  // SHOULD_FIRE: send-no-try-catch — inngest.send() without try-catch, API route pattern
  await inngest.send({
    name: 'app/order.placed',
    data: { orderId },
  });
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. send() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendWithTryCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: send-no-try-catch — inngest.send() inside try-catch satisfies requirement
    const result = await inngest.send({
      name: 'app/user.created',
      data: { userId },
    });
    return result;
  } catch (error) {
    console.error('Inngest send failed:', error);
    throw error;
  }
}

export async function sendWithCatchAndRethrow(userId: string) {
  try {
    // SHOULD_NOT_FIRE: send-no-try-catch — wrapped in try-catch with logging
    await inngest.send({
      name: 'app/user.created',
      data: { userId },
    });
  } catch (err) {
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. send() with .catch() chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendWithPromiseCatch(userId: string) {
  // SHOULD_NOT_FIRE: send-no-try-catch — .catch() handles the rejection
  const result = await inngest.send({
    name: 'app/user.created',
    data: { userId },
  }).catch((error) => {
    console.error('Send failed:', error);
    return null;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. try-finally without catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendWithTryFinallyNoCatch(userId: string) {
  try {
    // SHOULD_FIRE: send-no-try-catch — try-finally has no catch clause, errors propagate
    await inngest.send({
      name: 'app/user.created',
      data: { userId },
    });
  } finally {
    console.log('cleanup');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. send() on class field without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class EventDispatcher {
  private client: Inngest;

  constructor() {
    this.client = new Inngest({ id: 'dispatcher-app' });
  }

  async dispatchWithoutCatch(eventName: string) {
    // SHOULD_FIRE: send-no-try-catch — this.client.send() without try-catch
    await this.client.send({
      name: eventName,
      data: {},
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. send() on class field with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class SafeEventDispatcher {
  private client: Inngest;

  constructor() {
    this.client = new Inngest({ id: 'safe-dispatcher-app' });
  }

  async dispatchWithCatch(eventName: string) {
    try {
      // SHOULD_NOT_FIRE: send-no-try-catch — this.client.send() inside try-catch
      await this.client.send({
        name: eventName,
        data: {},
      });
    } catch (error) {
      console.error('Dispatch failed:', error);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Batch send without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchSendNoCatch(userIds: string[]) {
  // SHOULD_FIRE: send-no-try-catch — batch inngest.send() without try-catch
  const result = await inngest.send(
    userIds.map((userId) => ({
      name: 'app/user.created' as const,
      data: { userId },
    }))
  );
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. serve() — not contracted, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

// serve() is a synchronous factory call — not a network call, not contracted
// SHOULD_NOT_FIRE: serve() is a factory, no postcondition in contract
// (shown as comment since we can't import inngest/next without framework context)

// ─────────────────────────────────────────────────────────────────────────────
// 9. createFunction() — not contracted, no violation expected
// ─────────────────────────────────────────────────────────────────────────────

export const backgroundJob = inngest.createFunction(
  // SHOULD_NOT_FIRE: createFunction() is a synchronous registration call, not contracted
  { id: 'background-job' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
    // step methods inside handlers are also not contracted — Inngest manages retries
    await step.sleep('wait', '1s');
    return { processed: event.data };
  },
);
