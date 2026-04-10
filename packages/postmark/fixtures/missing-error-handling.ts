/**
 * postmark — Missing Error Handling Fixtures
 *
 * All functions demonstrate INCORRECT usage — API calls without
 * proper try-catch. verify-cli should report ERROR violations for each function.
 */

import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN!);

// ─────────────────────────────────────────────────────────────────────────────
// 1. sendEmail — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNoErrorHandling(to: string, subject: string, body: string) {
  // should trigger violation
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: subject,
    TextBody: body,
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. sendEmailBatch — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchNoErrorHandling(emails: Array<{ to: string; body: string }>) {
  // should trigger violation
  const messages = emails.map(e => ({
    From: 'noreply@example.com',
    To: e.to,
    Subject: 'Notification',
    TextBody: e.body,
  }));
  const results = await client.sendEmailBatch(messages);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. sendEmailWithTemplate — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTemplateNoErrorHandling(to: string, name: string) {
  // should trigger violation
  const result = await client.sendEmailWithTemplate({
    TemplateAlias: 'welcome',
    TemplateModel: { name },
    From: 'hello@example.com',
    To: to,
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. sendEmailBatchWithTemplates — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchTemplateNoErrorHandling(recipients: Array<{ email: string; name: string }>) {
  // should trigger violation
  const messages = recipients.map(r => ({
    TemplateAlias: 'welcome',
    TemplateModel: { name: r.name },
    From: 'hello@example.com',
    To: r.email,
  }));
  const results = await client.sendEmailBatchWithTemplates(messages);
  return results;
}
