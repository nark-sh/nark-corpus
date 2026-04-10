import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
  SendTemplatedEmailCommand,
  SendBulkTemplatedEmailCommand,
} from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

/**
 * VIOLATION: SendEmail without try-catch
 */
async function sendTransactionalEmailNoCatch(to: string, from: string, subject: string, body: string) {
  const response = await sesClient.send(new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  }));
  return response.MessageId;
}

/**
 * VIOLATION: SendEmail without try-catch in async route handler
 */
async function handleSignupEmail(userId: string, email: string) {
  const response = await sesClient.send(new SendEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Welcome!' },
      Body: { Text: { Data: `Account created: ${userId}` } },
    },
  }));
  console.log('Email sent:', response.MessageId);
}

/**
 * VIOLATION: SendRawEmail without try-catch
 */
async function forwardRawEmail(rawMessage: Uint8Array) {
  await sesClient.send(new SendRawEmailCommand({
    RawMessage: { Data: rawMessage },
  }));
}

/**
 * VIOLATION: SendTemplatedEmail without try-catch
 */
async function sendPasswordResetNoCatch(email: string, token: string) {
  const response = await sesClient.send(new SendTemplatedEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: [email] },
    Template: 'PasswordReset',
    TemplateData: JSON.stringify({ token }),
  }));
  return response.MessageId;
}

/**
 * VIOLATION: SendBulkTemplatedEmail without try-catch
 */
async function sendBulkDigestNoCatch(users: { email: string }[]) {
  await sesClient.send(new SendBulkTemplatedEmailCommand({
    Source: 'digest@example.com',
    Template: 'WeeklyDigest',
    DefaultTemplateData: '{}',
    Destinations: users.map(u => ({
      Destination: { ToAddresses: [u.email] },
    })),
  }));
}

/**
 * VIOLATION: SendEmail in function body, no outer catch
 */
async function notifyAdminNoCatch(message: string) {
  const response = await sesClient.send(
    new SendEmailCommand({
      Source: 'system@example.com',
      Destination: { ToAddresses: ['admin@example.com'] },
      Message: {
        Subject: { Data: 'Admin Alert' },
        Body: { Text: { Data: message } },
      },
    })
  );
  return response.MessageId;
}
