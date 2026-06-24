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

// ─────────────────────────────────────────────────────────────────────────────
// 10. step.sleep / step.sleepUntil — pass-27 (deepen-stream-3)
//
// Postconditions added pass 27:
//   - step-sleep-not-awaited: bare step.sleep without await defeats the pause
//   - step-sleep-until-not-awaited: same for sleepUntil
//   - step-sleep-until-invalid-date: sleepUntil throws on invalid time arg
// ─────────────────────────────────────────────────────────────────────────────

export const sleepNotAwaited = inngest.createFunction(
  { id: 'sleep-not-awaited' },
  { event: 'app/user.created' },
  async ({ step }) => {
    // PENDING_SCANNER (step-sleep-not-awaited): scanner concern queued — bare step.sleep call without await
    // This call site is intentionally non-awaited. When the scanner gains a detector
    // for non-awaited step tools, convert this comment to a SHOULD_FIRE annotation.
    step.sleep('wait-no-await', '1h');
    return { ok: true };
  },
);

export const sleepUntilNotAwaited = inngest.createFunction(
  { id: 'sleep-until-not-awaited' },
  { event: 'app/trial.start' },
  async ({ event, step }) => {
    // PENDING_SCANNER (step-sleep-until-not-awaited): scanner concern queued — bare step.sleepUntil call without await
    // When detector lands, convert this comment to SHOULD_FIRE annotation.
    step.sleepUntil('until-no-await', new Date(event.data.trialEnd));
    return { ok: true };
  },
);

export const sleepUntilProperlyAwaited = inngest.createFunction(
  { id: 'sleep-until-awaited' },
  { event: 'app/trial.start' },
  async ({ event, step }) => {
    // SHOULD_NOT_FIRE: properly awaited sleepUntil
    await step.sleepUntil('until-trial-end', new Date(event.data.trialEnd));
    return { ok: true };
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 11. step.fetch — network errors throw TypeError
// ─────────────────────────────────────────────────────────────────────────────

export const fetchNoTryCatch = inngest.createFunction(
  { id: 'fetch-no-try-catch' },
  { event: 'app/sync.requested' },
  async ({ step }) => {
    // PENDING_SCANNER (step-fetch-network-error-no-try-catch): scanner concern queued
    // step.fetch follows global Fetch API throw semantics. Detector lands → convert to SHOULD_FIRE.
    const res = await step.fetch('call-api', 'https://api.example.com/data');
    return await res.json();
  },
);

export const fetchWithTryCatch = inngest.createFunction(
  { id: 'fetch-with-try-catch' },
  { event: 'app/sync.requested' },
  async ({ step }) => {
    // SHOULD_NOT_FIRE: step.fetch wrapped in try/catch with response.ok check
    try {
      const res = await step.fetch('call-api', 'https://api.example.com/data');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      return { error: String(err) };
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 12. step.ai.infer — provider errors propagate
// ─────────────────────────────────────────────────────────────────────────────

export const aiInferNoTryCatch = inngest.createFunction(
  { id: 'ai-infer-no-try-catch' },
  { event: 'app/message.classify' },
  async ({ event, step }) => {
    // PENDING_SCANNER (ai-infer-provider-error-no-try-catch): scanner concern queued
    // Detector lands → convert to SHOULD_FIRE annotation.
    const result = await step.ai.infer('classify', {
      model: step.ai.models.openai({ model: 'gpt-4o-mini' }),
      body: {
        messages: [{ role: 'user', content: event.data.text }],
      },
    } as Parameters<typeof step.ai.infer>[1]);
    return result;
  },
);

export const aiInferWithTryCatch = inngest.createFunction(
  { id: 'ai-infer-with-try-catch' },
  { event: 'app/message.classify' },
  async ({ event, step }) => {
    // SHOULD_NOT_FIRE: step.ai.infer wrapped in try/catch
    try {
      const result = await step.ai.infer('classify', {
        model: step.ai.models.openai({ model: 'gpt-4o-mini' }),
        body: {
          messages: [{ role: 'user', content: event.data.text }],
        },
      } as Parameters<typeof step.ai.infer>[1]);
      return result;
    } catch (err) {
      return { error: String(err) };
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 13. inngest.realtime.publish — client-level (non-durable)
// ─────────────────────────────────────────────────────────────────────────────

declare const _statusTopic: any;  // realtime topic ref — typed via channel builder

export async function realtimePublishNoCatch(percent: number) {
  // PENDING_SCANNER (realtime-publish-no-try-catch): scanner concern queued
  // Non-durable publish at client level. Detector lands → convert to SHOULD_FIRE.
  await inngest.realtime.publish(_statusTopic, { percent, message: 'Working' });
  return { ok: true };
}

export async function realtimePublishWithCatch(percent: number) {
  // SHOULD_NOT_FIRE: realtime publish wrapped in try/catch
  try {
    await inngest.realtime.publish(_statusTopic, { percent, message: 'Working' });
  } catch {
    // best-effort — swallow
  }
  return { ok: true };
}
