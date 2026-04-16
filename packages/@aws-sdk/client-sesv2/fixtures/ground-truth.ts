/**
 * @aws-sdk/client-sesv2 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@aws-sdk/client-sesv2"):
 *   - sesv2Client.send()  postcondition: sesv2-send-no-try-catch
 *   - SendEmailCommand     postcondition: sesv2-send-email-no-try-catch
 *   - SendBulkEmailCommand postconditions: sesv2-bulk-email-result-not-checked, sesv2-bulk-email-no-try-catch
 *   - CreateEmailIdentityCommand  postcondition: sesv2-create-identity-no-try-catch
 *   - SendCustomVerificationEmailCommand  postcondition: sesv2-custom-verification-no-try-catch
 *   - CreateEmailTemplateCommand  postcondition: sesv2-create-template-no-try-catch
 *   - CreateImportJobCommand  postconditions: sesv2-import-job-result-not-polled, sesv2-import-job-no-try-catch
 *
 * Postcondition IDs:
 *   sesv2-send-no-try-catch                (generic SESv2Client.send())
 *   sesv2-send-email-no-try-catch          (SendEmailCommand)
 *   sesv2-bulk-email-result-not-checked    (SendBulkEmailCommand silent partial failure)
 *   sesv2-bulk-email-no-try-catch          (SendBulkEmailCommand account-level errors)
 *   sesv2-create-identity-no-try-catch     (CreateEmailIdentityCommand)
 *   sesv2-custom-verification-no-try-catch (SendCustomVerificationEmailCommand)
 *   sesv2-create-template-no-try-catch     (CreateEmailTemplateCommand)
 *   sesv2-import-job-result-not-polled     (CreateImportJobCommand async job not polled)
 *   sesv2-import-job-no-try-catch          (CreateImportJobCommand request errors)
 */

import {
  SESv2Client,
  SendEmailCommand,
  SendBulkEmailCommand,
  CreateEmailIdentityCommand,
  SendCustomVerificationEmailCommand,
  CreateEmailTemplateCommand,
  UpdateEmailTemplateCommand,
  CreateImportJobCommand,
  GetImportJobCommand,
} from '@aws-sdk/client-sesv2';

const sesv2Client = new SESv2Client({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. SendEmailCommand — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_sendEmail_missing(to: string) {
  // SHOULD_FIRE: sesv2-send-email-no-try-catch — SendEmailCommand without try-catch
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
  // SHOULD_FIRE: sesv2-send-email-no-try-catch — SendEmailCommand to multiple recipients, no try-catch
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
  // SHOULD_FIRE: sesv2-bulk-email-no-try-catch — SendBulkEmailCommand without try-catch
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. SendBulkEmailCommand — silent partial failure (BulkEmailEntryResults not checked)
// @expect-violation: sesv2-bulk-email-result-not-checked
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_sendBulk_resultNotChecked(recipients: string[]) {
  // SHOULD_NOT_FIRE: scanner gap — return-value postcondition sesv2-bulk-email-result-not-checked not implemented
  try {
    await sesv2Client.send(new SendBulkEmailCommand({
      FromEmailAddress: 'bulk@example.com',
      BulkEmailEntries: recipients.map(e => ({
        Destination: { ToAddresses: [e] },
      })),
      DefaultContent: {
        Template: { TemplateName: 'WelcomeEmail', TemplateData: '{}' },
      },
    }));
    // BulkEmailEntryResults never inspected — some recipients may have failed silently
  } catch (err) {
    throw err;
  }
}

export async function gt_sendBulk_resultChecked(recipients: string[]) {
  // @expect-clean
  // SHOULD_NOT_FIRE: BulkEmailEntryResults inspected for per-recipient failures
  try {
    const response = await sesv2Client.send(new SendBulkEmailCommand({
      FromEmailAddress: 'bulk@example.com',
      BulkEmailEntries: recipients.map(e => ({
        Destination: { ToAddresses: [e] },
      })),
      DefaultContent: {
        Template: { TemplateName: 'WelcomeEmail', TemplateData: '{}' },
      },
    }));
    const failed = response.BulkEmailEntryResults?.filter(r => r.Status !== 'SUCCESS') ?? [];
    if (failed.length > 0) {
      console.error(`${failed.length} bulk email recipients failed`);
    }
  } catch (err) {
    console.error('Bulk send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CreateEmailIdentityCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_createIdentity_missing(domain: string) {
  // @expect-violation: sesv2-create-identity-no-try-catch
  // SHOULD_FIRE: CreateEmailIdentityCommand without try-catch
  await sesv2Client.send(new CreateEmailIdentityCommand({ EmailIdentity: domain }));
}

export async function gt_createIdentity_safe(domain: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly handles AlreadyExistsException and LimitExceededException
  try {
    await sesv2Client.send(new CreateEmailIdentityCommand({ EmailIdentity: domain }));
  } catch (err: any) {
    if (err?.name === 'AlreadyExistsException') {
      // Identity already registered — treat as success in idempotent flows
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SendCustomVerificationEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_sendCustomVerification_missing(email: string) {
  // @expect-violation: sesv2-custom-verification-no-try-catch
  // SHOULD_FIRE: SendCustomVerificationEmailCommand without try-catch
  // NotFoundException for missing template would be silently lost
  await sesv2Client.send(new SendCustomVerificationEmailCommand({
    EmailAddress: email,
    TemplateName: 'MyVerificationTemplate',
  }));
}

export async function gt_sendCustomVerification_safe(email: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: handles NotFoundException for missing template
  try {
    await sesv2Client.send(new SendCustomVerificationEmailCommand({
      EmailAddress: email,
      TemplateName: 'MyVerificationTemplate',
    }));
  } catch (err: any) {
    if (err?.name === 'NotFoundException') {
      // Verification template deleted — alert ops team
      console.error('Custom verification template not found — no verification emails can be sent');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CreateEmailTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_createTemplate_missing(name: string, subject: string, html: string) {
  // @expect-violation: sesv2-create-template-no-try-catch
  // SHOULD_FIRE: CreateEmailTemplateCommand without try-catch
  await sesv2Client.send(new CreateEmailTemplateCommand({
    TemplateName: name,
    TemplateContent: { Subject: subject, Html: html },
  }));
}

export async function gt_createTemplate_safe(name: string, subject: string, html: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: handles AlreadyExistsException (not idempotent — use Update for updates)
  try {
    await sesv2Client.send(new CreateEmailTemplateCommand({
      TemplateName: name,
      TemplateContent: { Subject: subject, Html: html },
    }));
  } catch (err: any) {
    if (err?.name === 'AlreadyExistsException') {
      // Template exists — use UpdateEmailTemplateCommand instead
      await sesv2Client.send(new UpdateEmailTemplateCommand({
        TemplateName: name,
        TemplateContent: { Subject: subject, Html: html },
      }));
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CreateImportJobCommand — async job not polled
// @expect-violation: sesv2-import-job-result-not-polled
// ─────────────────────────────────────────────────────────────────────────────

export async function gt_importJob_notPolled() {
  // @expect-violation: sesv2-import-job-result-not-polled
  // SHOULD_FIRE: CreateImportJobCommand result not polled for COMPLETED/FAILED
  try {
    const result = await sesv2Client.send(new CreateImportJobCommand({
      ImportDataSource: {
        S3Url: 's3://my-bucket/contacts.csv',
        DataFormat: 'CSV',
      },
      ImportDestination: {
        ContactListDestination: {
          ContactListName: 'MyList',
          ContactListImportAction: 'PUT',
        },
      },
    }));
    // JobId received but job status never polled — import may have failed silently
    console.log('Import job created:', result.JobId);
  } catch (err) {
    throw err;
  }
}

export async function gt_importJob_polled() {
  // @expect-clean
  // SHOULD_NOT_FIRE: polls GetImportJobCommand until COMPLETED or FAILED
  try {
    const { JobId } = await sesv2Client.send(new CreateImportJobCommand({
      ImportDataSource: {
        S3Url: 's3://my-bucket/contacts.csv',
        DataFormat: 'CSV',
      },
      ImportDestination: {
        ContactListDestination: {
          ContactListName: 'MyList',
          ContactListImportAction: 'PUT',
        },
      },
    }));
    // Poll for job completion
    let status = 'CREATED';
    while (status !== 'COMPLETED' && status !== 'FAILED') {
      await new Promise(r => setTimeout(r, 5000));
      const job = await sesv2Client.send(new GetImportJobCommand({ JobId }));
      status = job.JobStatus ?? 'FAILED';
    }
    if (status === 'FAILED') {
      throw new Error(`SES import job ${JobId} failed`);
    }
  } catch (err) {
    console.error('Import job failed:', err);
    throw err;
  }
}
