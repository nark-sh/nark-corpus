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

// ══════════════════════════════════════════════════
// DEEPENED FUNCTIONS — Added 2026-04-16 (pass 4)
// New postcondition IDs:
//   suppressions-destroy-no-try-catch
//   suppressions-destroy-all-no-try-catch
//   suppressions-destroy-all-catastrophic-misuse
//   lists-update-no-try-catch
//   lists-destroy-no-try-catch
//   list-member-update-no-try-catch
//   list-member-destroy-no-try-catch
//   webhooks-create-no-try-catch
//   webhooks-update-no-try-catch
// ══════════════════════════════════════════════════

// ──────────────────────────────────────────────────
// 7. suppressions.destroy — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_suppressions_destroy_missing(mg: IMailgunClient, domain: string, email: string): Promise<void> {
  // SHOULD_FIRE: suppressions-destroy-no-try-catch
  // @expect-violation: suppressions-destroy-no-try-catch
  await mg.suppressions.destroy(domain, 'unsubscribes', email);
}

// @expect-clean
async function gt_suppressions_destroy_safe(mg: IMailgunClient, domain: string, email: string): Promise<void> {
  try {
    await mg.suppressions.destroy(domain, 'unsubscribes', email);
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      if (apiError.status === 404) {
        return; // Already removed
      }
      console.error('Failed to remove suppression', { status: apiError.status, email });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 8. suppressions.destroyAll — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_suppressions_destroy_all_missing(mg: IMailgunClient, domain: string): Promise<void> {
  // SHOULD_FIRE: suppressions-destroy-all-no-try-catch
  // @expect-violation: suppressions-destroy-all-no-try-catch
  await mg.suppressions.destroyAll(domain, 'bounces');
}

// @expect-clean
async function gt_suppressions_destroy_all_safe(mg: IMailgunClient, domain: string): Promise<void> {
  try {
    const result = await mg.suppressions.destroyAll(domain, 'bounces');
    console.info('All bounce suppressions cleared', result);
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('Failed to clear all suppressions', { status: apiError.status, domain });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 9. lists.update — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_lists_update_missing(mg: IMailgunClient, listAddress: string): Promise<void> {
  // SHOULD_FIRE: lists-update-no-try-catch
  // @expect-violation: lists-update-no-try-catch
  await mg.lists.update(listAddress, { name: 'New Name' });
}

// @expect-clean
async function gt_lists_update_safe(mg: IMailgunClient, listAddress: string): Promise<unknown> {
  try {
    return await mg.lists.update(listAddress, { name: 'New Name' });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      if (apiError.status === 404) {
        throw new Error('Mailing list not found');
      }
      console.error('List update failed', { status: apiError.status });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 10. lists.destroy — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_lists_destroy_missing(mg: IMailgunClient, listAddress: string): Promise<void> {
  // SHOULD_FIRE: lists-destroy-no-try-catch
  // @expect-violation: lists-destroy-no-try-catch
  await mg.lists.destroy(listAddress);
}

// @expect-clean
async function gt_lists_destroy_safe(mg: IMailgunClient, listAddress: string): Promise<unknown> {
  try {
    return await mg.lists.destroy(listAddress);
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      if (apiError.status === 404) {
        return null; // Already deleted
      }
      console.error('List deletion failed', { status: apiError.status, listAddress });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 11. lists.members.updateMember — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_list_member_update_missing(
  mg: IMailgunClient,
  listAddress: string,
  memberAddress: string
): Promise<void> {
  // SHOULD_FIRE: list-member-update-no-try-catch
  // @expect-violation: list-member-update-no-try-catch
  await mg.lists.members.updateMember(listAddress, memberAddress, { subscribed: false });
}

// @expect-clean
async function gt_list_member_update_safe(
  mg: IMailgunClient,
  listAddress: string,
  memberAddress: string
): Promise<unknown> {
  try {
    return await mg.lists.members.updateMember(listAddress, memberAddress, { subscribed: false });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      if (apiError.status === 404) {
        return null; // Member not found — unsubscribe is a no-op
      }
      console.error('Member update failed', { status: apiError.status, memberAddress });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 12. lists.members.destroyMember — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_list_member_destroy_missing(
  mg: IMailgunClient,
  listAddress: string,
  memberAddress: string
): Promise<void> {
  // SHOULD_FIRE: list-member-destroy-no-try-catch
  // @expect-violation: list-member-destroy-no-try-catch
  await mg.lists.members.destroyMember(listAddress, memberAddress);
}

// @expect-clean
async function gt_list_member_destroy_safe(
  mg: IMailgunClient,
  listAddress: string,
  memberAddress: string
): Promise<unknown> {
  try {
    return await mg.lists.members.destroyMember(listAddress, memberAddress);
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      if (apiError.status === 404) {
        return null; // Already removed
      }
      console.error('Member deletion failed', { status: apiError.status, memberAddress });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 13. webhooks.create — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_webhooks_create_missing(mg: IMailgunClient, domain: string): Promise<void> {
  // SHOULD_FIRE: webhooks-create-no-try-catch
  // @expect-violation: webhooks-create-no-try-catch
  await mg.webhooks.create(domain, 'bounce', 'https://app.example.com/webhooks/mailgun');
}

// @expect-clean
async function gt_webhooks_create_safe(mg: IMailgunClient, domain: string): Promise<void> {
  try {
    await mg.webhooks.create(domain, 'bounce', 'https://app.example.com/webhooks/mailgun');
    console.info('Webhook registered', { event: 'bounce', domain });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('Webhook creation failed', { status: apiError.status, domain });
      throw new Error(`Failed to register Mailgun webhook: ${apiError.status}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 14. webhooks.update — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_webhooks_update_missing(mg: IMailgunClient, domain: string): Promise<void> {
  // SHOULD_FIRE: webhooks-update-no-try-catch
  // @expect-violation: webhooks-update-no-try-catch
  await mg.webhooks.update(domain, 'bounce', 'https://new.example.com/webhooks');
}

// @expect-clean
async function gt_webhooks_update_safe(mg: IMailgunClient, domain: string): Promise<void> {
  try {
    await mg.webhooks.update(domain, 'bounce', 'https://new.example.com/webhooks');
    console.info('Webhook updated', { event: 'bounce' });
  } catch (error: unknown) {
    const apiError = error as { type?: string; status?: number };
    if (apiError?.type === 'MailgunAPIError') {
      console.error('Webhook update failed', { status: apiError.status });
    }
    throw error;
  }
}

export {
  gt_suppressions_destroy_missing,
  gt_suppressions_destroy_safe,
  gt_suppressions_destroy_all_missing,
  gt_suppressions_destroy_all_safe,
  gt_lists_update_missing,
  gt_lists_update_safe,
  gt_lists_destroy_missing,
  gt_lists_destroy_safe,
  gt_list_member_update_missing,
  gt_list_member_update_safe,
  gt_list_member_destroy_missing,
  gt_list_member_destroy_safe,
  gt_webhooks_create_missing,
  gt_webhooks_create_safe,
  gt_webhooks_update_missing,
  gt_webhooks_update_safe,
};
