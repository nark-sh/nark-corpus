/**
 * pusher Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the pusher contract spec, NOT V1 behavior.
 *
 * Contracted functions (all from import "pusher"):
 *   - pusher.trigger()                     postcondition: api-error
 *   - pusher.triggerBatch()                postcondition: api-error
 *   - pusher.sendToUser()                  postcondition: api-error
 *   - pusher.terminateUserConnections()    postcondition: terminate-api-error
 *   - pusher.get()                         postcondition: get-api-error
 *   - pusher.post()                        postcondition: post-api-error
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. terminateUserConnections
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: terminate-api-error
export async function terminateUserNoCatch(userId: string) {
  // terminateUserConnections rejects on Pusher API failure (401/403/5xx/network).
  // Used in ban flows — if this fails, the user remains connected. No try-catch.
  // SHOULD_FIRE: terminate-api-error — no try-catch on terminateUserConnections()
  await pusher.terminateUserConnections(userId);
}

// @expect-clean
export async function terminateUserWithCatch(userId: string) {
  try {
    // SHOULD_NOT_FIRE: terminateUserConnections inside try-catch with error handling
    await pusher.terminateUserConnections(userId);
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      // Log and retry — user may still be connected
      console.error('Failed to terminate connections for', userId, err.status);
    }
    throw err;
  }
}

// @expect-clean
export async function terminateUserWithRetryQueue(userId: string) {
  try {
    // SHOULD_NOT_FIRE: terminateUserConnections with error handling + retry queuing
    await pusher.terminateUserConnections(userId);
  } catch (err) {
    // Log but don't crash — queue for retry, log security gap
    console.error('Connection termination failed, queuing retry for user:', userId, err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. get
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-api-error
export async function getChannelsNoCatch() {
  // get() rejects on HTTP failure: 400 (invalid attribute), 401/403 (auth), 5xx.
  // SHOULD_FIRE: get-api-error — no try-catch on get() call
  const response = await pusher.get({ path: '/channels', params: { info: 'user_count' } });
  return response.json();
}

// @expect-clean
export async function getChannelsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: get() inside try-catch
    const response = await pusher.get({ path: '/channels', params: { filter_by_prefix: 'presence-', info: 'user_count' } });
    if (response.status === 200) {
      return response.json();
    }
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      if (err.status === 400) {
        // Invalid attribute for channel type
        console.error('Invalid channel attribute requested:', err.body);
      } else {
        console.error('Pusher GET failed:', err.status, err.body);
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. post
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: post-api-error
export async function postEventNoCatch(path: string, body: object) {
  // post() rejects on API failure: 413 (payload >10KB), 401/403, 5xx. No try-catch.
  // SHOULD_FIRE: post-api-error — no try-catch on post() call
  const response = await pusher.post({ path, body: JSON.stringify(body) });
  return response.json();
}

// @expect-clean
export async function postEventWithCatch(path: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: post() inside try-catch with 413 handling
    const response = await pusher.post({ path, body: JSON.stringify(body) });
    return response.json();
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      if (err.status === 413) {
        throw new Error('Pusher payload too large — must be under 10KB');
      }
      console.error('Pusher POST failed:', err.status, err.body);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. trigger — encrypted-channel guards (added 2026-06-24 deepen pass)
// ─────────────────────────────────────────────────────────────────────────────

const pusherEncrypted = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'test-app-id',
  key: process.env.PUSHER_KEY || 'test-key',
  secret: process.env.PUSHER_SECRET || 'test-secret',
  cluster: 'us2',
  encryptionMasterKeyBase64: process.env.PUSHER_ENCRYPTION_KEY || 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU=',
});

export async function triggerEncryptedMultiChannelNoCatch(roomIds: string[], payload: object) {
  // SHOULD_FIRE: trigger-encrypted-multi-channel-error — sync plain Error when multi-encrypted-channel trigger has no try-catch
  await pusherEncrypted.trigger(roomIds.map(id => `private-encrypted-${id}`), 'msg', payload);
}

export async function triggerEncryptedMultiChannelWithCatch(roomIds: string[], payload: object) {
  try {
    // SHOULD_NOT_FIRE: encrypted multi-channel trigger inside try-catch (caller may fan out per channel)
    await pusherEncrypted.trigger(roomIds.map(id => `private-encrypted-${id}`), 'msg', payload);
  } catch (err) {
    if (err instanceof Error && err.message.includes('encrypted channels')) {
      for (const id of roomIds) {
        await pusherEncrypted.trigger(`private-encrypted-${id}`, 'msg', payload);
      }
    }
    throw err;
  }
}

export async function triggerEncryptedMissingMasterKeyNoCatch(roomId: string, payload: object) {
  // SHOULD_FIRE: trigger-encryption-master-key-missing — pusher constructed without encryptionMasterKeyBase64, encrypted trigger throws sync
  await pusher.trigger(`private-encrypted-${roomId}`, 'msg', payload);
}

export async function triggerEncryptedMissingMasterKeyWithCatch(roomId: string, payload: object) {
  try {
    // SHOULD_NOT_FIRE: encrypted trigger inside try-catch surfaces the setup error
    await pusher.trigger(`private-encrypted-${roomId}`, 'msg', payload);
  } catch (err) {
    if (err instanceof Error && err.message.includes('encryptionMasterKey')) {
      console.error('Pusher encrypted-channel setup error — check config');
    }
    throw err;
  }
}
