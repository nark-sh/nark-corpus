import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
  SendTemplatedEmailCommand,
  SendBulkTemplatedEmailCommand,
} from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Proper: SendEmail with full error handling
 */
async function sendTransactionalEmail(to: string, from: string, subject: string, body: string) {
  try {
    const response = await sesClient.send(new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Text: { Data: body, Charset: 'UTF-8' } },
      },
    }));
    return response.MessageId;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'MessageRejected') {
        console.error('SES rejected message — check content policy');
      } else if (err.name === 'LimitExceededException') {
        console.warn('SES rate limit exceeded — implement backoff');
      } else if (err.name === 'AccountSendingPausedException') {
        console.error('SES account sending is paused');
      }
    }
    throw err;
  }
}

/**
 * Proper: SendEmail with generic catch and rethrow
 */
async function sendWelcomeEmail(userId: string, email: string) {
  try {
    const response = await sesClient.send(new SendEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Welcome!' },
        Body: { Text: { Data: `Welcome, user ${userId}` } },
      },
    }));
    return response.MessageId;
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    throw err;
  }
}

/**
 * Proper: SendRawEmail with error handling
 */
async function sendRawMimeEmail(rawMessage: Uint8Array) {
  try {
    const response = await sesClient.send(new SendRawEmailCommand({
      RawMessage: { Data: rawMessage },
    }));
    return response.MessageId;
  } catch (err) {
    console.error('SES SendRawEmail failed:', err);
    throw err;
  }
}

/**
 * Proper: SendTemplatedEmail with error handling
 */
async function sendPasswordReset(email: string, resetToken: string) {
  try {
    const response = await sesClient.send(new SendTemplatedEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Template: 'PasswordResetTemplate',
      TemplateData: JSON.stringify({ resetToken }),
    }));
    return response.MessageId;
  } catch (err) {
    if (err instanceof Error && err.name === 'TemplateDoesNotExist') {
      console.error('SES template not found — check template name');
    }
    throw err;
  }
}

/**
 * Proper: SendBulkTemplatedEmail with error handling
 */
async function sendBulkNotifications(recipients: { email: string; name: string }[]) {
  try {
    const response = await sesClient.send(new SendBulkTemplatedEmailCommand({
      Source: 'notifications@example.com',
      Template: 'NotificationTemplate',
      DefaultTemplateData: JSON.stringify({ name: 'User' }),
      Destinations: recipients.map(r => ({
        Destination: { ToAddresses: [r.email] },
        ReplacementTemplateData: JSON.stringify({ name: r.name }),
      })),
    }));
    return response.Status;
  } catch (err) {
    console.error('Bulk email failed:', err);
    throw err;
  }
}

/**
 * Proper: Outer try-catch wrapping the send call
 */
async function sendNotificationWithOuterCatch(email: string, message: string) {
  const command = new SendEmailCommand({
    Source: 'system@example.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Notification' },
      Body: { Text: { Data: message } },
    },
  });

  try {
    return await sesClient.send(command);
  } catch (err) {
    console.error('Notification send failed:', err);
    return null;
  }
}
