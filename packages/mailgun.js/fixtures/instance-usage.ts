/**
 * Instance usage patterns for mailgun.js
 *
 * Tests detection of mg.messages.create() through various instance patterns.
 */

import type { IMailgunClient } from 'mailgun.js';

const DOMAIN = 'example.com';

/**
 * Class-based email service with injected mailgun client.
 * The injected client pattern is common in DI frameworks (NestJS, TypeDI).
 */
class EmailService {
  private mg: IMailgunClient;
  private domain: string;

  constructor(mg: IMailgunClient, domain: string) {
    this.mg = mg;
    this.domain = domain;
  }

  /**
   * INCORRECT: No try-catch around messages.create() via this.mg
   * Should trigger violation.
   */
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    // ❌ No try-catch — uses this.mg (class property)
    await this.mg.messages.create(this.domain, {
      from: 'service@example.com',
      to,
      subject,
      text,
    });
  }

  /**
   * CORRECT: With error handling via this.mg
   * Should NOT trigger violation.
   */
  async sendEmailSafe(to: string, subject: string, text: string): Promise<boolean> {
    try {
      await this.mg.messages.create(this.domain, {
        from: 'service@example.com',
        to,
        subject,
        text,
      });
      return true;
    } catch (error) {
      console.error('Email delivery failed:', error);
      return false;
    }
  }
}

/**
 * Function accepting client as parameter (common in functional patterns)
 */
async function sendBulkEmail(
  mg: IMailgunClient,
  recipients: string[],
  subject: string,
  text: string
): Promise<void> {
  // ❌ No try-catch in bulk send loop
  for (const to of recipients) {
    await mg.messages.create(DOMAIN, {
      from: 'bulk@example.com',
      to,
      subject,
      text,
    });
  }
}

export { EmailService, sendBulkEmail };
