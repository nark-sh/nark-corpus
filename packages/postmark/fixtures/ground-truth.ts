/**
 * postmark Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the postmark contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - sendEmail()                    → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailBatch()              → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailWithTemplate()       → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailBatchWithTemplates() → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - Any of the above inside try-catch → SHOULD_NOT_FIRE
 *   - .catch() chain → SHOULD_NOT_FIRE
 *   - try-finally without catch → SHOULD_FIRE
 *
 * Coverage:
 *   - Section 1:  sendEmail() bare → SHOULD_FIRE
 *   - Section 2:  sendEmail() in try-catch → SHOULD_NOT_FIRE
 *   - Section 3:  sendEmail() with .catch() → SHOULD_NOT_FIRE
 *   - Section 4:  sendEmail() try-finally → SHOULD_FIRE
 *   - Section 5:  sendEmailBatch() bare → SHOULD_FIRE
 *   - Section 6:  sendEmailBatch() in try-catch → SHOULD_NOT_FIRE
 *   - Section 7:  sendEmailWithTemplate() bare → SHOULD_FIRE
 *   - Section 8:  sendEmailWithTemplate() in try-catch → SHOULD_NOT_FIRE
 *   - Section 9:  sendEmailBatchWithTemplates() bare → SHOULD_FIRE
 *   - Section 10: sendEmailBatchWithTemplates() in try-catch → SHOULD_NOT_FIRE
 *   - Section 11: class field — sendEmail() bare → SHOULD_FIRE
 *   - Section 12: class field — sendEmail() in try-catch → SHOULD_NOT_FIRE
 *
 * Design: spec-driven, NOT based on V1 behavior.
 */

import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN!);

// ─────────────────────────────────────────────────────────────────────────────
// 1. sendEmail() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendEmailNoCatch(to: string) {
  // SHOULD_FIRE: api-error — sendEmail() throws on API/network failure, no try-catch
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Test',
    TextBody: 'Hello',
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. sendEmail() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithTryCatch(to: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — sendEmail() inside try-catch satisfies requirement
    const result = await client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Test',
      TextBody: 'Hello',
    });
    return result.MessageID;
  } catch (error) {
    console.error('Send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. sendEmail() — .catch() chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithCatchChain(to: string) {
  // SHOULD_NOT_FIRE: api-error — .catch() handles the rejection
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Test',
    TextBody: 'Hello',
  }).catch((error) => {
    console.error('Send failed:', error);
    return null;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. sendEmail() — try-finally without catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailTryFinallyNoCatch(to: string) {
  try {
    // SHOULD_FIRE: api-error — try-finally has no catch clause, error propagates
    const result = await client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Test',
      TextBody: 'Hello',
    });
    return result.MessageID;
  } finally {
    console.log('cleanup');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. sendEmailBatch() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendBatchNoCatch(recipients: string[]) {
  const messages = recipients.map(to => ({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Notification',
    TextBody: 'Update',
  }));
  // SHOULD_FIRE: api-error — sendEmailBatch() throws on failure, no try-catch
  const results = await client.sendEmailBatch(messages);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. sendEmailBatch() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchWithTryCatch(recipients: string[]) {
  try {
    const messages = recipients.map(to => ({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Notification',
      TextBody: 'Update',
    }));
    // SHOULD_NOT_FIRE: api-error — sendEmailBatch() inside try-catch
    const results = await client.sendEmailBatch(messages);
    return results;
  } catch (error) {
    console.error('Batch failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. sendEmailWithTemplate() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendTemplateNoCatch(to: string, name: string) {
  // SHOULD_FIRE: api-error — sendEmailWithTemplate() throws on failure, no try-catch
  const result = await client.sendEmailWithTemplate({
    TemplateAlias: 'welcome',
    TemplateModel: { name },
    From: 'hello@example.com',
    To: to,
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. sendEmailWithTemplate() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTemplateWithTryCatch(to: string, name: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — sendEmailWithTemplate() inside try-catch
    const result = await client.sendEmailWithTemplate({
      TemplateAlias: 'welcome',
      TemplateModel: { name },
      From: 'hello@example.com',
      To: to,
    });
    return result.MessageID;
  } catch (error) {
    console.error('Template send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. sendEmailBatchWithTemplates() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendBatchTemplateNoCatch(recipients: Array<{ email: string; name: string }>) {
  const messages = recipients.map(r => ({
    TemplateAlias: 'welcome',
    TemplateModel: { name: r.name },
    From: 'hello@example.com',
    To: r.email,
  }));
  // SHOULD_FIRE: api-error — sendEmailBatchWithTemplates() throws on failure, no try-catch
  const results = await client.sendEmailBatchWithTemplates(messages);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. sendEmailBatchWithTemplates() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchTemplateWithTryCatch(recipients: Array<{ email: string; name: string }>) {
  try {
    const messages = recipients.map(r => ({
      TemplateAlias: 'welcome',
      TemplateModel: { name: r.name },
      From: 'hello@example.com',
      To: r.email,
    }));
    // SHOULD_NOT_FIRE: api-error — sendEmailBatchWithTemplates() inside try-catch
    const results = await client.sendEmailBatchWithTemplates(messages);
    return results;
  } catch (error) {
    console.error('Batch template failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Class field — sendEmail() without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class NotificationService {
  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  }

  async notify(to: string, message: string) {
    // SHOULD_FIRE: api-error — this.client.sendEmail() without try-catch
    await this.client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Notification',
      TextBody: message,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Class field — sendEmail() with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class SafeNotificationService {
  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  }

  async notify(to: string, message: string) {
    try {
      // SHOULD_NOT_FIRE: api-error — this.client.sendEmail() inside try-catch
      await this.client.sendEmail({
        From: 'noreply@example.com',
        To: to,
        Subject: 'Notification',
        TextBody: message,
      });
    } catch (error) {
      console.error('Notification failed:', error);
      throw error;
    }
  }
}
