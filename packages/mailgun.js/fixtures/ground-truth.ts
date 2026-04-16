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

// ══════════════════════════════════════════════════
// DEEPENED FUNCTIONS — Added 2026-04-15
// ══════════════════════════════════════════════════

// ──────────────────────────────────────────────────
// 4. validate.get — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_validate_missing(mg: IMailgunClient, email: string): Promise<unknown> {
  // SHOULD_FIRE: validate-authentication-error, validate-quota-exceeded
  // @expect-violation: validate-authentication-error
  // @expect-violation: validate-quota-exceeded
  const result = await mg.validate.get(email);
  return result;
}

// ──────────────────────────────────────────────────
// 4. validate.get — with try/catch (SHOULD_NOT_FIRE)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_validate_safe(mg: IMailgunClient, email: string): Promise<unknown> {
  try {
    const result = await mg.validate.get(email);
    return result;
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number; details?: string };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('Email validation failed', { status: apiError.status, details: apiError.details });
      if (apiError.status === 402 || apiError.status === 429) {
        // Degrade gracefully on quota exhaustion
        return { is_valid: true, degraded: true };
      }
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. suppressions.create — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_suppressions_create_missing(mg: IMailgunClient, domain: string, email: string): Promise<void> {
  // SHOULD_FIRE: suppressions-create-auth-error
  // @expect-violation: suppressions-create-auth-error
  await mg.suppressions.create(domain, 'unsubscribes', { address: email });
}

// ──────────────────────────────────────────────────
// 5. suppressions.create — with try/catch (SHOULD_NOT_FIRE)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_suppressions_create_safe(mg: IMailgunClient, domain: string, email: string): Promise<void> {
  try {
    await mg.suppressions.create(domain, 'unsubscribes', { address: email });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('Failed to add suppression', { status: apiError.status, email });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. lists.members.createMember — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_list_member_missing(mg: IMailgunClient, listAddress: string, email: string): Promise<void> {
  // SHOULD_FIRE: list-member-create-auth-error
  // @expect-violation: list-member-create-auth-error
  await mg.lists.members.createMember(listAddress, { address: email });
}

// ──────────────────────────────────────────────────
// 6. lists.members.createMember — with try/catch (SHOULD_NOT_FIRE)
// ──────────────────────────────────────────────────

// @expect-clean
async function gt_list_member_safe(mg: IMailgunClient, listAddress: string, email: string): Promise<void> {
  try {
    await mg.lists.members.createMember(listAddress, { address: email });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('List member add failed', { status: apiError.status });
    }
    throw error;
  }
}

export {
  gt_validate_missing,
  gt_validate_safe,
  gt_suppressions_create_missing,
  gt_suppressions_create_safe,
  gt_list_member_missing,
  gt_list_member_safe,
};
