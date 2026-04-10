/**
 * Missing error handling for @upstash/qstash.
 * Calls are NOT wrapped in try-catch.
 * Should produce ERROR violations for each call.
 */
import { Client, Receiver } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// ❌ publishJSON without try-catch — SHOULD FIRE
async function publishWithoutErrorHandling() {
  const result = await qstash.publishJSON({
    url: 'https://myapp.com/api/process-order',
    body: { orderId: '123' },
  });
  return result.messageId;
}

// ❌ publish without try-catch — SHOULD FIRE
async function publishRawWithoutErrorHandling() {
  await qstash.publish({
    url: 'https://myapp.com/api/webhook',
    body: 'raw-payload',
  });
}

// ❌ publishJSON with delay — no try-catch — SHOULD FIRE
async function publishDelayedWithoutErrorHandling() {
  await qstash.publishJSON({
    url: 'https://myapp.com/api/reminder',
    body: { userId: 'user-1' },
    delay: '24h',
  });
}

// ❌ publishJSON with callback — no try-catch — SHOULD FIRE
async function publishWithCallbackWithoutErrorHandling() {
  await qstash.publishJSON({
    url: 'https://myapp.com/api/process',
    body: { task: 'sync' },
    callback: 'https://myapp.com/api/job-completed',
  });
}

// ❌ enqueueJSON without try-catch — SHOULD FIRE
async function enqueueWithoutErrorHandling() {
  const queue = qstash.queue({ queueName: 'email-queue' });
  await queue.enqueueJSON({
    url: 'https://myapp.com/api/send-email',
    body: { to: 'user@example.com', template: 'welcome' },
  });
}
