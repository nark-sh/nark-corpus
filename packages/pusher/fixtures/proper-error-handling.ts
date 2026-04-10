/**
 * Proper error handling for pusher.
 * All calls wrapped in try-catch — should produce 0 violations.
 */

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// ─── trigger ────────────────────────────────────────────────────────────────

export async function triggerWithCatch(channel: string, message: string) {
  try {
    await pusher.trigger(channel, 'new-message', { message });
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher trigger failed:', err.status, err.body);
    }
    throw err;
  }
}

export async function triggerMultipleChannelsWithCatch(channels: string[], data: object) {
  try {
    await pusher.trigger(channels, 'update', data);
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher multi-channel trigger failed:', err.status);
    }
    throw err;
  }
}

export async function triggerFireAndForgetWithCatch(channel: string, userId: string) {
  // Fire-and-forget with .catch() — still handled
  pusher.trigger(`private-user-${userId}`, 'notification', { channel }).catch(err => {
    console.error('Pusher notification failed:', err);
  });
}

// ─── triggerBatch ────────────────────────────────────────────────────────────

export async function triggerBatchWithCatch(updates: Array<{ id: string; status: string }>) {
  try {
    await pusher.triggerBatch(
      updates.map(u => ({
        channel: `private-item-${u.id}`,
        name: 'status-update',
        data: JSON.stringify(u),
      }))
    );
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher batch trigger failed:', err.status, err.body);
    }
    throw err;
  }
}

// ─── sendToUser ───────────────────────────────────────────────────────────────

export async function sendToUserWithCatch(userId: string, content: string) {
  try {
    await pusher.sendToUser(userId, 'message', { content });
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher sendToUser failed for user', userId, ':', err.status);
    }
    throw err;
  }
}

export async function notifyUserSilentlyWithCatch(userId: string, payload: object) {
  try {
    await pusher.sendToUser(userId, 'notification', payload);
  } catch (err) {
    // Notification failure should not block the primary operation
    console.error('Failed to notify user:', userId, err);
  }
}
