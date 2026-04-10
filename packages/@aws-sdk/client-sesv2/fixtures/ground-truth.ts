/**
 * @aws-sdk/client-sesv2 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@aws-sdk/client-sesv2"):
 *   - sesv2Client.send()  postcondition: sesv2-send-no-try-catch
 *
 * Detection pattern:
 *   - SESv2Client is imported from @aws-sdk/client-sesv2
 *   - new SESv2Client() tracked → sesv2Client instance resolved to package
 *   - ThrowingFunctionDetector (depth-1): sesv2Client.send() → detected
 *   - ContractMatcher: matches function 'send' → checks try-catch
 *
 * Postcondition IDs:
 *   sesv2-send-no-try-catch  (SESv2Client.send())
 */

import { SESv2Client, SendEmailCommand, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';

const sesv2Client = new SESv2Client({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. SendEmailCommand — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_sendEmail_missing(to: string) {
  // SHOULD_FIRE: sesv2-send-no-try-catch — SendEmailCommand without try-catch
  await sesv2Client.send(new SendEmailCommand({
    FromEmailAddress: 'noreply@example.com',
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: 'Test', Charset: 'UTF-8' },
        Body: { Text: { Data: 'Body', Charset: 'UTF-8' } },
      },
    },
  }));
}

export async function gt_sendEmail_safe(to: string) {
  try {
    // SHOULD_NOT_FIRE: send inside try-catch
    await sesv2Client.send(new SendEmailCommand({
      FromEmailAddress: 'noreply@example.com',
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: 'Test', Charset: 'UTF-8' },
          Body: { Text: { Data: 'Body', Charset: 'UTF-8' } },
        },
      },
    }));
  } catch (err) {
    console.error('Email failed:', err);
    throw err;
  }
}

export async function gt_sendEmail_multiRecipient_missing(recipients: string[]) {
  // SHOULD_FIRE: sesv2-send-no-try-catch — SendEmailCommand to multiple recipients, no try-catch
  await sesv2Client.send(new SendEmailCommand({
    FromEmailAddress: 'noreply@example.com',
    Destination: { ToAddresses: recipients },
    Content: {
      Simple: {
        Subject: { Data: 'Batch notification' },
        Body: { Text: { Data: 'Message for multiple recipients' } },
      },
    },
  }));
}

export async function gt_sendEmail_multiRecipient_safe(recipients: string[]) {
  try {
    // SHOULD_NOT_FIRE: multi-recipient send inside try-catch
    await sesv2Client.send(new SendEmailCommand({
      FromEmailAddress: 'noreply@example.com',
      Destination: { ToAddresses: recipients },
      Content: {
        Simple: {
          Subject: { Data: 'Batch notification' },
          Body: { Text: { Data: 'Message body' } },
        },
      },
    }));
  } catch (err) {
    console.error('Batch send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SendBulkEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_sendBulk_missing(recipients: string[]) {
  // SHOULD_FIRE: sesv2-send-no-try-catch — SendBulkEmailCommand without try-catch
  await sesv2Client.send(new SendBulkEmailCommand({
    FromEmailAddress: 'bulk@example.com',
    BulkEmailEntries: recipients.map(e => ({
      Destination: { ToAddresses: [e] },
      ReplacementEmailContent: {
        ReplacementTemplate: { ReplacementTemplateData: '{}' },
      },
    })),
    DefaultContent: {
      Template: { TemplateName: 'WelcomeEmail', TemplateData: '{}' },
    },
  }));
}

export async function gt_sendBulk_safe(recipients: string[]) {
  try {
    // SHOULD_NOT_FIRE: send inside try-catch
    await sesv2Client.send(new SendBulkEmailCommand({
      FromEmailAddress: 'bulk@example.com',
      BulkEmailEntries: recipients.map(e => ({
        Destination: { ToAddresses: [e] },
        ReplacementEmailContent: {
          ReplacementTemplate: { ReplacementTemplateData: '{}' },
        },
      })),
      DefaultContent: {
        Template: { TemplateName: 'WelcomeEmail', TemplateData: '{}' },
      },
    }));
  } catch (err) {
    console.error('Bulk send failed:', err);
    throw err;
  }
}
