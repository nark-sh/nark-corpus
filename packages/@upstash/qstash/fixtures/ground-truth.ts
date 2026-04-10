/**
 * @upstash/qstash Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @upstash/qstash contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - client.publishJSON() without try-catch → SHOULD_FIRE: api-error
 *   - client.publish() without try-catch → SHOULD_FIRE: api-error
 *   - queue.enqueueJSON() without try-catch → SHOULD_FIRE: api-error
 *   - Above methods inside try-catch → SHOULD_NOT_FIRE
 *
 * Contracted postconditions:
 *   api-error: publishJSON/publish/enqueueJSON throw QstashError on HTTP/network failure
 *
 * Coverage:
 *   - Section 1: bare publishJSON() → SHOULD_FIRE
 *   - Section 2: publishJSON() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare publish() → SHOULD_FIRE
 *   - Section 4: publish() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 5: bare enqueueJSON() → SHOULD_FIRE
 *   - Section 6: enqueueJSON() inside try-catch → SHOULD_NOT_FIRE
 */

import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare publishJSON() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function publishJobNoCatch(orderId: string) {
  // SHOULD_FIRE: api-error — publishJSON() without try-catch, QstashError unhandled
  await qstash.publishJSON({
    url: `${process.env.NEXTAUTH_URL}/api/process-order`,
    body: { orderId },
  });
}

export async function publishNotificationNoCatch(userId: string) {
  // SHOULD_FIRE: api-error — publishJSON() without try-catch, rate limit or auth failure unhandled
  const result = await qstash.publishJSON({
    url: "https://myapp.com/api/notify",
    body: { userId, type: "welcome" },
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. publishJSON() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function publishJobWithCatch(orderId: string) {
  try {
    // SHOULD_NOT_FIRE: publishJSON() inside try-catch satisfies the api-error requirement
    await qstash.publishJSON({
      url: `${process.env.NEXTAUTH_URL}/api/process-order`,
      body: { orderId },
    });
  } catch (error) {
    console.error("Failed to queue job:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare publish() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function publishRawMessageNoCatch(payload: string) {
  // SHOULD_FIRE: api-error — publish() without try-catch, network failure unhandled
  await qstash.publish({
    url: "https://myapp.com/api/webhook",
    body: payload,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. publish() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function publishRawMessageWithCatch(payload: string) {
  try {
    // SHOULD_NOT_FIRE: publish() inside try-catch satisfies the api-error requirement
    await qstash.publish({
      url: "https://myapp.com/api/webhook",
      body: payload,
    });
  } catch (error) {
    console.error("Failed to publish message:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Bare enqueueJSON() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function enqueueEmailNoCatch(to: string) {
  const queue = qstash.queue({ queueName: "email-queue" });
  // SHOULD_FIRE: api-error — enqueueJSON() without try-catch, QstashError unhandled
  await queue.enqueueJSON({
    url: "https://myapp.com/api/send-email",
    body: { to, template: "welcome" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. enqueueJSON() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function enqueueEmailWithCatch(to: string) {
  const queue = qstash.queue({ queueName: "email-queue" });
  try {
    // SHOULD_NOT_FIRE: enqueueJSON() inside try-catch satisfies the api-error requirement
    await queue.enqueueJSON({
      url: "https://myapp.com/api/send-email",
      body: { to, template: "welcome" },
    });
  } catch (error) {
    console.error("Failed to enqueue email job:", error);
    throw error;
  }
}
