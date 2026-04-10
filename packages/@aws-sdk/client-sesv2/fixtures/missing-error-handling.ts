import { SESv2Client, SendEmailCommand, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';

const sesv2Client = new SESv2Client({ region: 'us-east-1' });

/**
 * VIOLATION: SendEmailCommand without try-catch
 * Fails in sandbox mode if recipient is unverified.
 */
export async function sendEmailMissing(to: string, subject: string) {
  // No try-catch — VIOLATION expected
  await sesv2Client.send(new SendEmailCommand({
    FromEmailAddress: 'noreply@example.com',
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Text: { Data: 'Hello', Charset: 'UTF-8' } },
      },
    },
  }));
}

/**
 * VIOLATION: SendBulkEmailCommand without try-catch
 */
export async function sendBulkEmailMissing(recipients: string[]) {
  // No try-catch — VIOLATION expected
  await sesv2Client.send(new SendBulkEmailCommand({
    FromEmailAddress: 'bulk@example.com',
    BulkEmailEntries: recipients.map(email => ({
      Destination: { ToAddresses: [email] },
      ReplacementEmailContent: {
        ReplacementTemplate: { ReplacementTemplateData: '{}' },
      },
    })),
    DefaultContent: {
      Template: { TemplateName: 'WelcomeEmail', TemplateData: '{}' },
    },
  }));
}

/**
 * VIOLATION: Fire-and-forget pattern (no await but unhandled rejection risk)
 */
export async function sendEmailNoAwaitNoCatch(to: string) {
  // No try-catch — VIOLATION expected
  const response = await sesv2Client.send(new SendEmailCommand({
    FromEmailAddress: 'noreply@example.com',
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: 'Hello' },
        Body: { Text: { Data: 'Body content' } },
      },
    },
  }));
  return response.MessageId;
}
