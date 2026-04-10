import { SESv2Client, SendEmailCommand, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';

const sesv2Client = new SESv2Client({ region: 'us-east-1' });

/**
 * Proper: SendEmailCommand with specific error handling
 */
export async function sendEmailWithCatch(to: string, subject: string) {
  try {
    const response = await sesv2Client.send(new SendEmailCommand({
      FromEmailAddress: 'noreply@example.com',
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: { Text: { Data: 'Hello', Charset: 'UTF-8' } },
        },
      },
    }));
    return response.MessageId;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'SendingQuotaExceededException') {
        console.warn('SESv2: sending quota exceeded — implement backoff');
      } else if (err.name === 'MessageRejected') {
        console.error('SESv2: message rejected — check content policy');
      } else if (err.name === 'AccountSuspendedException') {
        console.error('SESv2: account suspended');
      }
    }
    throw err;
  }
}

/**
 * Proper: SendEmailCommand with generic catch and rethrow
 */
export async function sendWelcomeEmail(userId: string, email: string) {
  try {
    const response = await sesv2Client.send(new SendEmailCommand({
      FromEmailAddress: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: 'Welcome!' },
          Body: { Text: { Data: `Welcome, user ${userId}` } },
        },
      },
    }));
    return response.MessageId;
  } catch (err) {
    console.error('SESv2 send failed:', err);
    throw err;
  }
}

/**
 * Proper: SendBulkEmailCommand with error handling
 */
export async function sendBulkEmailWithCatch(recipients: string[]) {
  try {
    const response = await sesv2Client.send(new SendBulkEmailCommand({
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
    return response.BulkEmailEntryResults;
  } catch (err) {
    console.error('SESv2 bulk send failed:', err);
    throw err;
  }
}

/**
 * Proper: Outer try-catch wrapping the send call
 */
export async function sendNotificationWithOuterCatch(email: string, message: string) {
  const command = new SendEmailCommand({
    FromEmailAddress: 'system@example.com',
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: 'Notification' },
        Body: { Text: { Data: message } },
      },
    },
  });

  try {
    return await sesv2Client.send(command);
  } catch (err) {
    console.error('SESv2 notification failed:', err);
    return null;
  }
}
