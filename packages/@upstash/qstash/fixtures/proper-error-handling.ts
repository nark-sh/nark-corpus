/**
 * Proper error handling for @upstash/qstash.
 * All calls are wrapped in try-catch.
 * Should produce ZERO violations.
 */
import { Client, Receiver } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// ✅ publishJSON with try-catch
async function publishWithProperHandling() {
  try {
    const result = await qstash.publishJSON({
      url: 'https://myapp.com/api/process-order',
      body: { orderId: '123' },
    });
    return result.messageId;
  } catch (error) {
    console.error('Failed to publish:', error);
    throw error;
  }
}

// ✅ publish with try-catch
async function publishRawWithProperHandling() {
  try {
    await qstash.publish({
      url: 'https://myapp.com/api/webhook',
      body: 'raw-payload',
    });
  } catch (error) {
    console.error('Failed to publish raw message:', error);
    throw error;
  }
}

// ✅ enqueueJSON with try-catch
async function enqueueWithProperHandling() {
  const queue = qstash.queue({ queueName: 'email-queue' });
  try {
    await queue.enqueueJSON({
      url: 'https://myapp.com/api/send-email',
      body: { to: 'user@example.com', template: 'welcome' },
    });
  } catch (error) {
    console.error('Failed to enqueue:', error);
    throw error;
  }
}

// ✅ publishJSON with delay — try-catch still required
async function publishWithDelay() {
  try {
    await qstash.publishJSON({
      url: 'https://myapp.com/api/reminder',
      body: { userId: 'user-1' },
      delay: '24h',
    });
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
  }
}

// ✅ publishJSON with .catch() — valid alternative
async function publishWithCatch() {
  await qstash
    .publishJSON({
      url: 'https://myapp.com/api/process',
      body: { task: 'sync' },
    })
    .catch((error) => {
      console.error('Publish failed:', error);
    });
}

// ✅ receiver.verify with try-catch
async function verifySignatureWithProperHandling(signature: string, body: string) {
  try {
    await receiver.verify({
      signature,
      body,
      url: 'https://myapp.com/api/queue-callback',
    });
    return true;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}
