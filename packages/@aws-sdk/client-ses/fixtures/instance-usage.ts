import {
  SESClient,
  SES,
  SendEmailCommand,
  SendRawEmailCommand,
} from '@aws-sdk/client-ses';

/**
 * Instance created via class field — VIOLATION
 */
class EmailService {
  private sesClient = new SESClient({ region: 'us-east-1' });

  async sendWelcome(email: string) {
    // VIOLATION: sesClient.send() without try-catch on class field instance
    await this.sesClient.send(new SendEmailCommand({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Welcome!' },
        Body: { Text: { Data: 'Welcome to the app.' } },
      },
    }));
  }

  async sendAlert(email: string, alert: string) {
    // Proper: try-catch present
    try {
      await this.sesClient.send(new SendEmailCommand({
        Source: 'alerts@example.com',
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: 'Alert' },
          Body: { Text: { Data: alert } },
        },
      }));
    } catch (err) {
      console.error('Alert email failed:', err);
      throw err;
    }
  }
}

/**
 * Instance passed as function parameter — VIOLATION
 */
async function sendWithClient(client: SESClient, to: string, subject: string) {
  // VIOLATION: parameter-typed instance without try-catch
  await client.send(new SendEmailCommand({
    Source: 'system@example.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: 'Message body' } },
    },
  }));
}

/**
 * Aggregate SES class (legacy-style) — VIOLATION
 */
const aggregateSes = new SES({ region: 'us-east-1' });

async function sendWithAggregateClient(to: string) {
  // VIOLATION: aggregate SES client's send() without try-catch
  await aggregateSes.send(new SendEmailCommand({
    Source: 'legacy@example.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: 'Legacy send' },
      Body: { Text: { Data: 'Sent via aggregate SES class.' } },
    },
  }));
}

/**
 * Using SES alias import — VIOLATION
 */
import { SES as SESAlias } from '@aws-sdk/client-ses';

const aliasClient = new SESAlias({ region: 'eu-west-1' });

async function sendWithAlias(to: string) {
  // VIOLATION: alias-imported SES client without try-catch
  await aliasClient.send(new SendRawEmailCommand({
    RawMessage: { Data: new Uint8Array([]) },
  }));
}
