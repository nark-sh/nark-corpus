/**
 * postmark — Proper Error Handling Fixtures
 *
 * All functions demonstrate CORRECT error handling.
 * verify-cli should report 0 violations for this file.
 */

import { ServerClient, Errors } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN!);

// ─────────────────────────────────────────────────────────────────────────────
// 1. sendEmail — with try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithTryCatch(to: string, subject: string, body: string) {
  try {
    const result = await client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: subject,
      TextBody: body,
    });
    return result.MessageID;
  } catch (error) {
    if (error instanceof Errors.InactiveRecipientsError) {
      console.error('Inactive recipients:', error.recipients);
    }
    console.error('Email send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. sendEmailBatch — with try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchWithTryCatch(emails: Array<{ to: string; subject: string; body: string }>) {
  try {
    const messages = emails.map(e => ({
      From: 'noreply@example.com',
      To: e.to,
      Subject: e.subject,
      TextBody: e.body,
    }));
    const results = await client.sendEmailBatch(messages);
    return results;
  } catch (error) {
    console.error('Batch send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. sendEmailWithTemplate — with try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTemplateWithTryCatch(to: string, name: string) {
  try {
    const result = await client.sendEmailWithTemplate({
      TemplateAlias: 'welcome',
      TemplateModel: { name },
      From: 'hello@example.com',
      To: to,
    });
    return result.MessageID;
  } catch (error) {
    console.error('Template email failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. sendEmailBatchWithTemplates — with try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchTemplateWithTryCatch(recipients: Array<{ email: string; name: string }>) {
  try {
    const messages = recipients.map(r => ({
      TemplateAlias: 'welcome',
      TemplateModel: { name: r.name },
      From: 'hello@example.com',
      To: r.email,
    }));
    const results = await client.sendEmailBatchWithTemplates(messages);
    return results;
  } catch (error) {
    console.error('Batch template send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. sendEmail — with .catch() chain ✅
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithCatchChain(to: string) {
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Test',
    TextBody: 'Test body',
  }).catch((error) => {
    console.error('Email failed:', error);
    return null;
  });
  return result;
}
