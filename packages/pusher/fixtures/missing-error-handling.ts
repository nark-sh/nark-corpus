/**
 * Missing error handling for pusher.
 * All calls lack try-catch — should produce ERROR violations.
 */

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// ─── trigger — missing error handling ────────────────────────────────────────

export async function triggerNoCatch(channel: string, message: string) {
  // ❌ No try-catch — rejects with RequestError on Pusher outage or bad credentials
  await pusher.trigger(channel, 'new-message', { message });
}

export async function triggerAfterDbWrite(orderId: string, userId: string) {
  // ❌ Common antipattern: trigger as side effect with no error handling
  await pusher.trigger(`private-user-${userId}`, 'order-updated', { orderId });
}

export async function triggerMultipleChannelsNoCatch(channels: string[], data: object) {
  // ❌ No try-catch — multi-channel trigger can fail on rate limit (429)
  await pusher.trigger(channels, 'broadcast', data);
}

// ─── triggerBatch — missing error handling ────────────────────────────────────

export async function triggerBatchNoCatch(userIds: string[], eventName: string) {
  // ❌ No try-catch — batch failure drops all events silently
  await pusher.triggerBatch(
    userIds.map(id => ({
      channel: `private-user-${id}`,
      name: eventName,
      data: JSON.stringify({ timestamp: Date.now() }),
    }))
  );
}

// ─── sendToUser — missing error handling ─────────────────────────────────────

export async function sendToUserNoCatch(userId: string, content: string) {
  // ❌ No try-catch — rejects on invalid userId or network failure
  await pusher.sendToUser(userId, 'message', { content });
}

export async function notifyUserNoCatch(userId: string, payload: object) {
  // ❌ No try-catch — user notification failure unhandled
  await pusher.sendToUser(userId, 'notification', payload);
}
