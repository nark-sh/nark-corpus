/**
 * pusher Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the pusher contract spec, NOT V1 behavior.
 *
 * Contracted functions (all from import "pusher"):
 *   - pusher.trigger()       postcondition: api-error
 *   - pusher.triggerBatch()  postcondition: api-error
 *   - pusher.sendToUser()    postcondition: api-error
 *
 * pusher uses 2-level property chains (instance.method), detected directly.
 */

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'test-app-id',
  key: process.env.PUSHER_KEY || 'test-key',
  secret: process.env.PUSHER_SECRET || 'test-secret',
  cluster: 'us2',
  useTLS: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. trigger — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function triggerNoCatch(channel: string, message: string) {
  // SHOULD_FIRE: api-error — trigger rejects with RequestError on Pusher API failure, no try-catch
  await pusher.trigger(channel, 'new-message', { message });
}

export async function triggerWithCatch(channel: string, message: string) {
  try {
    // SHOULD_NOT_FIRE: trigger inside try-catch satisfies error handling
    await pusher.trigger(channel, 'new-message', { message });
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher trigger failed:', err.status, err.body);
    }
    throw err;
  }
}

export async function triggerMultipleNoCatch(channels: string[], data: object) {
  // SHOULD_FIRE: api-error — multi-channel trigger also rejects on rate limit (429), no try-catch
  await pusher.trigger(channels, 'broadcast', data);
}

export async function triggerMultipleWithCatch(channels: string[], data: object) {
  try {
    // SHOULD_NOT_FIRE: multi-channel trigger inside try-catch
    await pusher.trigger(channels, 'broadcast', data);
  } catch (err) {
    console.error('Broadcast failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. triggerBatch
// ─────────────────────────────────────────────────────────────────────────────

export async function triggerBatchNoCatch(ids: string[]) {
  // SHOULD_FIRE: api-error — triggerBatch rejects on API failure, no try-catch
  await pusher.triggerBatch(
    ids.map(id => ({
      channel: `private-${id}`,
      name: 'update',
      data: JSON.stringify({ id }),
    }))
  );
}

export async function triggerBatchWithCatch(ids: string[]) {
  try {
    // SHOULD_NOT_FIRE: triggerBatch inside try-catch
    await pusher.triggerBatch(
      ids.map(id => ({
        channel: `private-${id}`,
        name: 'update',
        data: JSON.stringify({ id }),
      }))
    );
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Batch trigger failed:', err.status);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. sendToUser
// ─────────────────────────────────────────────────────────────────────────────

export async function sendToUserNoCatch(userId: string, content: string) {
  // SHOULD_FIRE: api-error — sendToUser rejects on API failure or invalid userId, no try-catch
  await pusher.sendToUser(userId, 'message', { content });
}

export async function sendToUserWithCatch(userId: string, content: string) {
  try {
    // SHOULD_NOT_FIRE: sendToUser inside try-catch satisfies error handling
    await pusher.sendToUser(userId, 'message', { content });
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Failed to notify user:', userId, err.status);
    }
    throw err;
  }
}

export async function sendToUserSilentWithCatch(userId: string, payload: object) {
  try {
    // SHOULD_NOT_FIRE: sendToUser inside try-catch (swallows error intentionally)
    await pusher.sendToUser(userId, 'notification', payload);
  } catch (err) {
    // Notification failure does not abort the primary operation
    console.error('Notification failed for user:', userId, err);
  }
}
