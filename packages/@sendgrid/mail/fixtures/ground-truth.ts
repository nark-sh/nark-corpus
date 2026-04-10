/**
 * @sendgrid/mail Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@sendgrid/mail"):
 *   - sgMail.send()         postcondition: send-no-try-catch
 *   - sgMail.sendMultiple() postcondition: sendMultiple-no-try-catch
 *
 * Detection pattern:
 *   - sgMail (default import) imported from @sendgrid/mail
 *   - ThrowingFunctionDetector: sgMail.send() and sgMail.sendMultiple() → detected
 *   - ContractMatcher: checks try-catch → fires postconditions
 */

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// ─────────────────────────────────────────────────────────────────────────────
// 1. send() — core email sending
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNoCatch(to: string, subject: string) {
  // SHOULD_FIRE: send-no-try-catch — send() throws on auth failure, invalid email, rate limit. No try-catch.
  await sgMail.send({
    to,
    from: 'noreply@example.com',
    subject,
    text: 'Hello',
  });
}

export async function sendEmailWithCatch(to: string, subject: string) {
  try {
    // SHOULD_NOT_FIRE: send() inside try-catch satisfies error handling
    await sgMail.send({
      to,
      from: 'noreply@example.com',
      subject,
      text: 'Hello',
    });
  } catch (err) {
    console.error('SendGrid error:', err);
    throw err;
  }
}

export async function sendTemplateNoCatch(to: string, templateId: string) {
  // SHOULD_FIRE: send-no-try-catch — template send throws on invalid templateId. No try-catch.
  await sgMail.send({
    to,
    from: 'noreply@example.com',
    templateId,
    dynamicTemplateData: { name: 'User' },
  });
}

export async function sendTemplateWithCatch(to: string, templateId: string) {
  try {
    // SHOULD_NOT_FIRE: template send inside try-catch
    await sgMail.send({
      to,
      from: 'noreply@example.com',
      templateId,
      dynamicTemplateData: { name: 'User' },
    });
  } catch (err) {
    console.error('Template send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. sendMultiple() — bulk email sending
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMultipleNoCatch(recipients: string[]) {
  // SHOULD_FIRE: send-multiple-no-try-catch — bulk send throws on rate limit or auth failure. No try-catch.
  await sgMail.sendMultiple({
    to: recipients,
    from: 'noreply@example.com',
    subject: 'Batch notification',
    text: 'Hello',
  });
}

export async function sendMultipleWithCatch(recipients: string[]) {
  try {
    // SHOULD_NOT_FIRE: sendMultiple() inside try-catch
    await sgMail.sendMultiple({
      to: recipients,
      from: 'noreply@example.com',
      subject: 'Batch notification',
      text: 'Hello',
    });
  } catch (err) {
    console.error('Bulk send failed:', err);
    throw err;
  }
}
