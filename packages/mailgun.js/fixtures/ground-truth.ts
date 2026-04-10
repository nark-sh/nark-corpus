/**
 * Ground-truth fixture for mailgun.js
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited messages.create() call.
 *
 * Postcondition IDs:
 *   mailgun-api-error   (mg.messages.create — all email sends)
 *
 * Detection method: IMailgunClient type annotation → InstanceTracker → PropertyChainDetector
 * Pattern: mg.messages.create() detected as 2-level property chain on mailgun.js instance
 */

import type { IMailgunClient } from 'mailgun.js';

const DOMAIN = 'example.com';

// ──────────────────────────────────────────────────
// 1. Basic send — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_send_missing(mg: IMailgunClient, to: string): Promise<void> {
  // SHOULD_FIRE: mailgun-api-error — messages.create without try-catch
  await mg.messages.create(DOMAIN, {
    from: 'sender@example.com',
    to,
    subject: 'Hello',
    text: 'Hello!',
  });
}

// ──────────────────────────────────────────────────
// 1. Basic send — with try/catch (SHOULD_NOT_FIRE)
// ──────────────────────────────────────────────────

async function gt_send_safe(mg: IMailgunClient, to: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: messages.create has try-catch
    await mg.messages.create(DOMAIN, {
      from: 'sender@example.com',
      to,
      subject: 'Hello',
      text: 'Hello!',
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. Notification send — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_notify_missing(mg: IMailgunClient, email: string, message: string): Promise<void> {
  // SHOULD_FIRE: mailgun-api-error — messages.create without try-catch
  const result = await mg.messages.create(DOMAIN, {
    from: 'notify@example.com',
    to: email,
    subject: 'Notification',
    text: message,
  });
  console.log('Sent:', result.id);
}

// ──────────────────────────────────────────────────
// 2. Notification send — with .catch() (SHOULD_NOT_FIRE)
// ──────────────────────────────────────────────────

function gt_notify_safe(mg: IMailgunClient, email: string, message: string): Promise<void> {
  // SHOULD_NOT_FIRE: messages.create has .catch() handler
  return mg.messages.create(DOMAIN, {
    from: 'notify@example.com',
    to: email,
    subject: 'Notification',
    text: message,
  })
    .then(() => undefined)
    .catch((error) => {
      console.error('Notification failed:', error);
    });
}

// ──────────────────────────────────────────────────
// 3. Class method — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

class MailerService {
  private mg: IMailgunClient;

  constructor(mg: IMailgunClient) {
    this.mg = mg;
  }

  async sendInvoice(customerEmail: string, invoiceId: string): Promise<void> {
    // SHOULD_FIRE: mailgun-api-error — this.mg.messages.create without try-catch
    await this.mg.messages.create(DOMAIN, {
      from: 'billing@example.com',
      to: customerEmail,
      subject: `Invoice #${invoiceId}`,
      text: `Your invoice ${invoiceId} is ready.`,
    });
  }

  // ──────────────────────────────────────────────────
  // 3. Class method — with try/catch (SHOULD_NOT_FIRE)
  // ──────────────────────────────────────────────────

  async sendInvoiceSafe(customerEmail: string, invoiceId: string): Promise<boolean> {
    try {
      // SHOULD_NOT_FIRE: this.mg.messages.create has try-catch
      await this.mg.messages.create(DOMAIN, {
        from: 'billing@example.com',
        to: customerEmail,
        subject: `Invoice #${invoiceId}`,
        text: `Your invoice ${invoiceId} is ready.`,
      });
      return true;
    } catch (error) {
      console.error('Invoice email failed:', error);
      return false;
    }
  }
}

export { gt_send_missing, gt_send_safe, gt_notify_missing, gt_notify_safe, MailerService };
