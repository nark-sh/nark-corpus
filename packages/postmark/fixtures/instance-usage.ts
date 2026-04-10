/**
 * postmark — Instance Usage Fixtures
 *
 * Tests detection of postmark usage via class field instances.
 */

import { ServerClient } from 'postmark';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Class field instance — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

class EmailService {
  private client: ServerClient;

  constructor(apiToken: string) {
    this.client = new ServerClient(apiToken);
  }

  async sendWelcome(to: string, name: string) {
    // should trigger violation — no try-catch
    await this.client.sendEmail({
      From: 'hello@example.com',
      To: to,
      Subject: `Welcome, ${name}!`,
      TextBody: `Hi ${name}, welcome to our platform.`,
    });
  }

  async sendBatch(emails: Array<{ to: string; body: string }>) {
    // should trigger violation — no try-catch
    const messages = emails.map(e => ({
      From: 'noreply@example.com',
      To: e.to,
      Subject: 'Update',
      TextBody: e.body,
    }));
    await this.client.sendEmailBatch(messages);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Class field instance — with try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

class SafeEmailService {
  private client: ServerClient;

  constructor(apiToken: string) {
    this.client = new ServerClient(apiToken);
  }

  async sendWelcome(to: string, name: string) {
    try {
      await this.client.sendEmail({
        From: 'hello@example.com',
        To: to,
        Subject: `Welcome, ${name}!`,
        TextBody: `Hi ${name}, welcome to our platform.`,
      });
    } catch (error) {
      console.error('Welcome email failed:', error);
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Module-level variable instance — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

const emailClient = new ServerClient(process.env.POSTMARK_TOKEN!);

export async function sendNotification(to: string, message: string) {
  // should trigger violation — no try-catch
  await emailClient.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Notification',
    TextBody: message,
  });
}
