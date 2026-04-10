import { SESv2Client, SendEmailCommand, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';

/**
 * Instance created via class field — VIOLATION
 */
class EmailService {
  private sesv2Client = new SESv2Client({ region: 'us-east-1' });

  async sendWelcome(email: string) {
    // VIOLATION: sesv2Client.send() without try-catch on class field instance
    await this.sesv2Client.send(new SendEmailCommand({
      FromEmailAddress: 'noreply@example.com',
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: 'Welcome!' },
          Body: { Text: { Data: 'Welcome to the app.' } },
        },
      },
    }));
  }

  async sendAlert(email: string, alert: string) {
    // Proper: try-catch present
    try {
      await this.sesv2Client.send(new SendEmailCommand({
        FromEmailAddress: 'alerts@example.com',
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: 'Alert' },
            Body: { Text: { Data: alert } },
          },
        },
      }));
    } catch (err) {
      console.error('SESv2 alert email failed:', err);
      throw err;
    }
  }
}

/**
 * Instance passed as function parameter — VIOLATION
 */
async function sendWithClient(client: SESv2Client, to: string, subject: string) {
  // VIOLATION: parameter-typed instance without try-catch
  await client.send(new SendEmailCommand({
    FromEmailAddress: 'system@example.com',
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: { Text: { Data: 'Message body' } },
      },
    },
  }));
}

/**
 * Module-level instance — VIOLATION
 */
const globalSesv2 = new SESv2Client({ region: 'eu-west-1' });

async function sendWithGlobalClient(to: string) {
  // VIOLATION: module-level instance without try-catch
  await globalSesv2.send(new SendBulkEmailCommand({
    FromEmailAddress: 'bulk@example.com',
    BulkEmailEntries: [
      {
        Destination: { ToAddresses: [to] },
        ReplacementEmailContent: {
          ReplacementTemplate: { ReplacementTemplateData: '{}' },
        },
      },
    ],
    DefaultContent: {
      Template: { TemplateName: 'Template', TemplateData: '{}' },
    },
  }));
}
