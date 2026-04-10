/**
 * @aws-sdk/client-ses Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@aws-sdk/client-ses"):
 *   - sesClient.send()  postcondition: ses-send-no-try-catch
 *
 * Detection pattern:
 *   - SESClient is imported from @aws-sdk/client-ses
 *   - new SESClient() tracked → sesClient instance resolved to package
 *   - ThrowingFunctionDetector (depth-1): sesClient.send() → detected
 *   - ContractMatcher: matches function 'send' → checks try-catch
 */

import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
  SendTemplatedEmailCommand,
  SendBulkTemplatedEmailCommand,
} from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. SendEmailCommand — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNoCatch(to: string, subject: string) {
  // SHOULD_FIRE: ses-send-no-try-catch — SendEmailCommand rejects with MessageRejected, LimitExceededException, etc. No try-catch.
  await sesClient.send(new SendEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: 'Hello' } },
    },
  }));
}

export async function sendEmailWithCatch(to: string, subject: string) {
  try {
    // SHOULD_NOT_FIRE: SendEmailCommand inside try-catch satisfies error handling
    await sesClient.send(new SendEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: 'Hello' } },
      },
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'MessageRejected') {
      console.error('Message rejected by SES:', err.message);
    }
    throw err;
  }
}

export async function sendEmailMultipleRecipients(recipients: string[]) {
  // SHOULD_FIRE: ses-send-no-try-catch — SendEmailCommand to multiple recipients, no try-catch
  await sesClient.send(new SendEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: recipients },
    Message: {
      Subject: { Data: 'Batch notification' },
      Body: { Text: { Data: 'Message for multiple recipients' } },
    },
  }));
}

export async function sendEmailMultipleRecipientsWithCatch(recipients: string[]) {
  try {
    // SHOULD_NOT_FIRE: multi-recipient send inside try-catch
    await sesClient.send(new SendEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: recipients },
      Message: {
        Subject: { Data: 'Batch notification' },
        Body: { Text: { Data: 'Message body' } },
      },
    }));
  } catch (err) {
    console.error('Batch send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SendRawEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function sendRawEmailNoCatch(rawMessage: Uint8Array) {
  // SHOULD_FIRE: ses-send-no-try-catch — SendRawEmailCommand rejects on MIME errors, quota, network. No try-catch.
  await sesClient.send(new SendRawEmailCommand({
    RawMessage: { Data: rawMessage },
  }));
}

export async function sendRawEmailWithCatch(rawMessage: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: SendRawEmailCommand inside try-catch
    await sesClient.send(new SendRawEmailCommand({
      RawMessage: { Data: rawMessage },
    }));
  } catch (err) {
    console.error('SendRawEmail failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SendTemplatedEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTemplatedEmailNoCatch(email: string, token: string) {
  // SHOULD_FIRE: ses-send-no-try-catch — SendTemplatedEmailCommand throws TemplateDoesNotExist, MessageRejected, etc. No try-catch.
  const response = await sesClient.send(new SendTemplatedEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: [email] },
    Template: 'PasswordReset',
    TemplateData: JSON.stringify({ token }),
  }));
  return response.MessageId;
}

export async function sendTemplatedEmailWithCatch(email: string, token: string) {
  try {
    // SHOULD_NOT_FIRE: SendTemplatedEmailCommand inside try-catch
    const response = await sesClient.send(new SendTemplatedEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Template: 'PasswordReset',
      TemplateData: JSON.stringify({ token }),
    }));
    return response.MessageId;
  } catch (err) {
    if (err instanceof Error && err.name === 'TemplateDoesNotExist') {
      console.error('SES template not found');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SendBulkTemplatedEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBulkEmailNoCatch(users: { email: string; name: string }[]) {
  // SHOULD_FIRE: ses-send-no-try-catch — SendBulkTemplatedEmailCommand throws on account/config errors. No try-catch.
  await sesClient.send(new SendBulkTemplatedEmailCommand({
    Source: 'digest@example.com',
    Template: 'WeeklyDigest',
    DefaultTemplateData: '{}',
    Destinations: users.map(u => ({
      Destination: { ToAddresses: [u.email] },
      ReplacementTemplateData: JSON.stringify({ name: u.name }),
    })),
  }));
}

export async function sendBulkEmailWithCatch(users: { email: string; name: string }[]) {
  try {
    // SHOULD_NOT_FIRE: SendBulkTemplatedEmailCommand inside try-catch
    await sesClient.send(new SendBulkTemplatedEmailCommand({
      Source: 'digest@example.com',
      Template: 'WeeklyDigest',
      DefaultTemplateData: '{}',
      Destinations: users.map(u => ({
        Destination: { ToAddresses: [u.email] },
        ReplacementTemplateData: JSON.stringify({ name: u.name }),
      })),
    }));
  } catch (err) {
    console.error('Bulk email failed:', err);
    throw err;
  }
}

