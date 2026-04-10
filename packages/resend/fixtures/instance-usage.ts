/**
 * Fixture: instance-usage.ts
 *
 * Tests detection of Resend usage via class instances (constructor injection,
 * factory patterns). Should trigger violations where error handling is missing.
 */

import { Resend } from 'resend';

/**
 * ❌ WRONG: Class-based usage without error handling.
 * Verifies that verify-cli detects Resend usage through instance methods.
 */
class EmailService {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  /**
   * ❌ WRONG: Instance method without try-catch or error check.
   */
  async sendWelcomeEmail(to: string): Promise<void> {
    // ❌ Should trigger violation — no try-catch around await
    await this.client.emails.send({
      from: 'welcome@example.com',
      to,
      subject: 'Welcome!',
      html: '<p>Welcome to our platform!</p>',
    });
  }

  /**
   * ❌ WRONG: Returns result without checking error.
   */
  async sendNotification(to: string, message: string) {
    // ❌ Should trigger violation — no try-catch around await
    return await this.client.emails.send({
      from: 'notifications@example.com',
      to,
      subject: 'Notification',
      html: `<p>${message}</p>`,
    });
  }
}

/**
 * Factory pattern: creates client and uses it.
 * ❌ WRONG: No error handling on the send call.
 */
function createResendClient(apiKey: string): Resend {
  return new Resend(apiKey);
}

async function sendViaFactory(to: string) {
  const client = createResendClient(process.env.RESEND_API_KEY!);

  // ❌ Should trigger violation — no try-catch around await
  await client.emails.send({
    from: 'noreply@example.com',
    to,
    subject: 'Hello',
    html: '<p>Hello from factory pattern!</p>',
  });
}

export { EmailService, createResendClient, sendViaFactory };
