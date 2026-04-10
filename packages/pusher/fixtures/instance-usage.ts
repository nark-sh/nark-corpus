/**
 * Instance-based usage patterns for pusher.
 * Tests detection via class instances and module-level singletons.
 * Calls without try-catch should produce violations.
 */

import Pusher from 'pusher';

// ─── Module-level singleton (most common real-world pattern) ──────────────────

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: 'us2',
  useTLS: true,
});

// ─── Class-based service ─────────────────────────────────────────────────────

class NotificationService {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: 'us2',
    });
  }

  // ❌ No try-catch on instance method call
  async notifyUser(userId: string, message: string) {
    await this.pusher.sendToUser(userId, 'notification', { message });
  }

  // ✅ Properly handled
  async notifyUserSafely(userId: string, message: string) {
    try {
      await this.pusher.sendToUser(userId, 'notification', { message });
    } catch (err) {
      console.error('Failed to notify user:', userId, err);
    }
  }

  // ❌ No try-catch on triggerBatch
  async broadcastUpdates(items: Array<{ id: string; value: number }>) {
    await this.pusher.triggerBatch(
      items.map(item => ({
        channel: `item-${item.id}`,
        name: 'value-changed',
        data: JSON.stringify({ value: item.value }),
      }))
    );
  }
}

// ─── Named export / re-export pattern ─────────────────────────────────────────

export { pusher };

export async function publishEvent(channel: string, event: string, data: object) {
  // ❌ No try-catch — uses module-level singleton
  await pusher.trigger(channel, event, data);
}

export async function publishEventSafely(channel: string, event: string, data: object) {
  // ✅ Proper handling
  try {
    await pusher.trigger(channel, event, data);
  } catch (err) {
    if (err instanceof Pusher.RequestError) {
      console.error('Pusher publish failed:', err.status, err.body);
    }
    throw err;
  }
}

// ─── Factory function pattern ─────────────────────────────────────────────────

function createPusherClient() {
  return new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: 'us2',
  });
}

export async function triggerViaFactory(channel: string, event: string, data: object) {
  const client = createPusherClient();
  // ❌ No try-catch — factory-created instance, same violation
  await client.trigger(channel, event, data);
}
