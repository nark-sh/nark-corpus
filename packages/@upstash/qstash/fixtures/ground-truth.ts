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
 *   - queue.enqueue() without try-catch → SHOULD_FIRE: enqueue-api-error
 *   - client.batch() without try-catch → SHOULD_FIRE: batch-api-error
 *   - client.batchJSON() without try-catch → SHOULD_FIRE: batchjson-api-error
 *   - receiver.verify() without try-catch → SHOULD_FIRE: verify-signature-error
 *   - client.schedules.create() without try-catch → SHOULD_FIRE: schedules-create-api-error
 *   - client.schedules.delete() without try-catch → SHOULD_FIRE: schedules-delete-api-error
 *   - queue.upsert() without try-catch → SHOULD_FIRE: queue-upsert-api-error
 *   - queue.pause() without try-catch → SHOULD_FIRE: queue-pause-api-error
 *   - queue.resume() without try-catch → SHOULD_FIRE: queue-resume-api-error
 *   - Above methods inside try-catch → SHOULD_NOT_FIRE
 *
 * Contracted postconditions (original):
 *   api-error: publishJSON/publish/enqueueJSON throw QstashError on HTTP/network failure
 *
 * New postconditions (depth pass 2026-04-16):
 *   enqueue-api-error: enqueue() throws QstashError (same profile as enqueueJSON)
 *   batch-api-error: batch() throws QstashError on transport failure
 *   batch-empty-array-error: batch([]) throws QstashEmptyArrayError
 *   batchjson-api-error: batchJSON() throws QstashError on transport failure
 *   batchjson-empty-array-error: batchJSON([]) throws QstashEmptyArrayError
 *   verify-signature-error: verify() throws SignatureError on tampered/invalid request
 *   verify-no-signing-keys: verify() throws Error when no signing keys configured
 *   schedules-create-api-error: schedules.create() throws QstashError on HTTP failure
 *   schedules-delete-api-error: schedules.delete() throws QstashError on HTTP failure
 *   schedules-pause-api-error: schedules.pause() throws QstashError on HTTP failure
 *   schedules-resume-api-error: schedules.resume() throws QstashError on HTTP failure
 *   queue-upsert-api-error: queue.upsert() throws QstashError on HTTP failure
 *   queue-pause-api-error: queue.pause() throws QstashError on HTTP failure
 *   queue-resume-api-error: queue.resume() throws QstashError on HTTP failure
 *
 * Coverage:
 *   - Section 1: bare publishJSON() → SHOULD_FIRE
 *   - Section 2: publishJSON() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare publish() → SHOULD_FIRE
 *   - Section 4: publish() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 5: bare enqueueJSON() → SHOULD_FIRE
 *   - Section 6: enqueueJSON() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 7: bare enqueue() → SHOULD_FIRE
 *   - Section 8: enqueue() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 9: bare batch() → SHOULD_FIRE
 *   - Section 10: batch() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 11: bare batchJSON() → SHOULD_FIRE
 *   - Section 12: batchJSON() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 13: bare receiver.verify() → SHOULD_FIRE
 *   - Section 14: receiver.verify() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 15: bare schedules.create() → SHOULD_FIRE
 *   - Section 16: schedules.create() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 17: bare schedules.delete() → SHOULD_FIRE
 *   - Section 18: bare queue.upsert() → SHOULD_FIRE
 *   - Section 19: bare queue.pause() → SHOULD_FIRE
 *   - Section 20: bare queue.resume() → SHOULD_FIRE
 *   - Section 21: queue.pause()/resume() inside try-catch → SHOULD_NOT_FIRE
 */

import { Client, Receiver } from "@upstash/qstash";

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

// ─────────────────────────────────────────────────────────────────────────────
// 7. Bare enqueue() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function enqueueRawNoCatch(payload: string) {
  const queue = qstash.queue({ queueName: "raw-queue" });
  // SHOULD_FIRE: enqueue-api-error — enqueue() without try-catch, QstashError unhandled
  await queue.enqueue({
    url: "https://myapp.com/api/process",
    body: payload,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. enqueue() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function enqueueRawWithCatch(payload: string) {
  const queue = qstash.queue({ queueName: "raw-queue" });
  try {
    // SHOULD_NOT_FIRE: enqueue() inside try-catch satisfies the enqueue-api-error requirement
    await queue.enqueue({
      url: "https://myapp.com/api/process",
      body: payload,
    });
  } catch (error) {
    console.error("Failed to enqueue message:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Bare batch() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchJobsNoCatch(orderIds: string[]) {
  // SHOULD_FIRE: batch-api-error — batch() without try-catch, QstashError unhandled
  await qstash.batch(
    orderIds.map((id) => ({
      url: `${process.env.NEXTAUTH_URL}/api/process-order`,
      body: JSON.stringify({ orderId: id }),
    }))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. batch() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchJobsWithCatch(orderIds: string[]) {
  try {
    // SHOULD_NOT_FIRE: batch() inside try-catch satisfies the batch-api-error requirement
    await qstash.batch(
      orderIds.map((id) => ({
        url: `${process.env.NEXTAUTH_URL}/api/process-order`,
        body: JSON.stringify({ orderId: id }),
      }))
    );
  } catch (error) {
    console.error("Failed to batch publish jobs:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Bare batchJSON() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchJsonJobsNoCatch(items: { id: string; type: string }[]) {
  // SHOULD_FIRE: batchjson-api-error — batchJSON() without try-catch, QstashError unhandled
  await qstash.batchJSON(
    items.map((item) => ({
      url: `${process.env.NEXTAUTH_URL}/api/process`,
      body: item,
    }))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. batchJSON() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function batchJsonJobsWithCatch(items: { id: string; type: string }[]) {
  try {
    // SHOULD_NOT_FIRE: batchJSON() inside try-catch satisfies the batchjson-api-error requirement
    await qstash.batchJSON(
      items.map((item) => ({
        url: `${process.env.NEXTAUTH_URL}/api/process`,
        body: item,
      }))
    );
  } catch (error) {
    console.error("Failed to batch JSON publish:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Bare receiver.verify() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function webhookHandlerNoCatch(request: Request) {
  const body = await request.text();
  // SHOULD_FIRE: verify-signature-error — verify() without try-catch, SignatureError unhandled
  const isValid = await receiver.verify({
    signature: request.headers.get("Upstash-Signature")!,
    body,
  });
  if (!isValid) {
    throw new Error("Invalid signature");
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. receiver.verify() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function webhookHandlerWithCatch(request: Request) {
  const body = await request.text();
  try {
    // SHOULD_NOT_FIRE: verify() inside try-catch satisfies the verify-signature-error requirement
    const isValid = await receiver.verify({
      signature: request.headers.get("Upstash-Signature")!,
      body,
    });
    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.error("Signature verification failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }
  return new Response("OK");
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Bare schedules.create() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createDailyDigestNoCatch() {
  // SHOULD_FIRE: schedules-create-api-error — schedules.create() without try-catch
  const result = await qstash.schedules.create({
    destination: `${process.env.NEXTAUTH_URL}/api/send-digest`,
    cron: "0 9 * * *",
  });
  return result.scheduleId;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. schedules.create() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createDailyDigestWithCatch() {
  try {
    // SHOULD_NOT_FIRE: schedules.create() inside try-catch
    const result = await qstash.schedules.create({
      destination: `${process.env.NEXTAUTH_URL}/api/send-digest`,
      cron: "0 9 * * *",
    });
    return result.scheduleId;
  } catch (error) {
    console.error("Failed to create schedule:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Bare schedules.delete() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteScheduleNoCatch(scheduleId: string) {
  // SHOULD_FIRE: schedules-delete-api-error — schedules.delete() without try-catch
  await qstash.schedules.delete(scheduleId);
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Bare queue.upsert() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createQueueNoCatch() {
  const queue = qstash.queue({ queueName: "email-queue" });
  // SHOULD_FIRE: queue-upsert-api-error — queue.upsert() without try-catch
  await queue.upsert({ parallelism: 5 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. Bare queue.pause() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function pauseQueueNoCatch() {
  const queue = qstash.queue({ queueName: "email-queue" });
  // SHOULD_FIRE: queue-pause-api-error — queue.pause() without try-catch
  await queue.pause();
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. Bare queue.resume() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function resumeQueueNoCatch() {
  const queue = qstash.queue({ queueName: "email-queue" });
  // SHOULD_FIRE: queue-resume-api-error — queue.resume() without try-catch
  await queue.resume();
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. queue.pause() / queue.resume() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function pauseAndResumeQueueWithCatch() {
  const queue = qstash.queue({ queueName: "email-queue" });
  try {
    // SHOULD_NOT_FIRE: queue.pause() inside try-catch
    await queue.pause();
  } catch (error) {
    console.error("Failed to pause queue:", error);
    throw error;
  }

  // ... maintenance work ...

  try {
    // SHOULD_NOT_FIRE: queue.resume() inside try-catch
    await queue.resume();
  } catch (error) {
    console.error("Failed to resume queue:", error);
    throw error;
  }
}
