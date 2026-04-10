/**
 * Instance-based usage patterns for @upstash/qstash.
 * Tests detection via class instances (module-level singleton, class field, etc.)
 * Some should produce violations, some should be clean.
 */
import { Client } from '@upstash/qstash';

// Module-level singleton (common pattern in Next.js apps)
const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

// ❌ Module-level client, publishJSON without try-catch — SHOULD FIRE
async function triggerBackgroundJob(userId: string) {
  await qstashClient.publishJSON({
    url: `${process.env.NEXTAUTH_URL}/api/sync-user`,
    body: { userId },
  });
}

// ✅ Module-level client, publishJSON with try-catch — SHOULD NOT FIRE
async function triggerBackgroundJobSafe(userId: string) {
  try {
    await qstashClient.publishJSON({
      url: `${process.env.NEXTAUTH_URL}/api/sync-user`,
      body: { userId },
    });
  } catch (error) {
    console.error('Failed to trigger background job:', error);
    throw error;
  }
}

// Class-based service pattern (common in NestJS / service layers)
class JobQueueService {
  private client: Client;

  constructor() {
    this.client = new Client({ token: process.env.QSTASH_TOKEN! });
  }

  // ❌ No try-catch — SHOULD FIRE
  async sendEmailJob(email: string) {
    await this.client.publishJSON({
      url: 'https://myapp.com/api/send-email',
      body: { email },
    });
  }

  // ✅ With try-catch — SHOULD NOT FIRE
  async sendEmailJobSafe(email: string) {
    try {
      await this.client.publishJSON({
        url: 'https://myapp.com/api/send-email',
        body: { email },
      });
    } catch (error) {
      console.error('Email job failed:', error);
    }
  }

  // ❌ publish (non-JSON) without try-catch — SHOULD FIRE
  async sendRawJob(payload: string) {
    await this.client.publish({
      url: 'https://myapp.com/api/process',
      body: payload,
    });
  }
}

// Re-exported client pattern (common in Next.js projects)
export const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

// ❌ Using re-exported client without try-catch — SHOULD FIRE
async function queueOrderProcessing(orderId: string) {
  await qstash.publishJSON({
    url: `${process.env.APP_URL}/api/process-payment`,
    body: { orderId },
  });
}
