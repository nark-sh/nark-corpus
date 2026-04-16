/**
 * @aws-sdk/client-ses Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@aws-sdk/client-ses"):
 *   - sesClient.send()  postcondition: ses-send-no-try-catch
 *   - SendEmailCommand  postcondition: ses-send-email-no-try-catch
 *   - SendTemplatedEmailCommand  postconditions: ses-template-does-not-exist,
 *       ses-template-rendering-failure-silent, ses-template-missing-rendering-attribute
 *   - SendBulkTemplatedEmailCommand  postconditions: ses-bulk-template-does-not-exist,
 *       ses-bulk-partial-destination-failure
 *   - SendRawEmailCommand  postconditions: ses-raw-email-size-limit, ses-raw-email-recipient-limit
 *   - SendCustomVerificationEmailCommand  postconditions: ses-custom-verification-template-missing,
 *       ses-custom-verification-sender-not-verified, ses-custom-verification-sandbox-restriction
 *   - CreateTemplateCommand  postconditions: ses-create-template-already-exists,
 *       ses-create-template-invalid-syntax
 *   - UpdateTemplateCommand  postconditions: ses-update-template-not-found,
 *       ses-update-template-invalid-syntax
 *   - TestRenderTemplateCommand  postconditions: ses-test-render-template-missing,
 *       ses-test-render-missing-attribute, ses-test-render-invalid-parameter
 *   - CreateConfigurationSetCommand  postconditions: ses-create-config-set-already-exists,
 *       ses-create-config-set-invalid, ses-create-config-set-limit-exceeded
 *   - CreateConfigurationSetEventDestinationCommand  postconditions: ses-event-dest-config-set-not-found,
 *       ses-event-dest-already-exists, ses-event-dest-invalid-destination
 *   - CreateCustomVerificationEmailTemplateCommand  postconditions: ses-create-cve-template-already-exists,
 *       ses-create-cve-template-invalid-content, ses-create-cve-template-from-not-verified
 *   - UpdateCustomVerificationEmailTemplateCommand  postconditions: ses-update-cve-template-not-found,
 *       ses-update-cve-template-invalid-content, ses-update-cve-template-from-not-verified
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
  SendCustomVerificationEmailCommand,
  CreateTemplateCommand,
  UpdateTemplateCommand,
  TestRenderTemplateCommand,
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateCustomVerificationEmailTemplateCommand,
  UpdateCustomVerificationEmailTemplateCommand,
} from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

// ─────────────────────────────────────────────────────────────────────────────
// 1. SendEmailCommand — the core use case
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNoCatch(to: string, subject: string) {
  // SHOULD_FIRE: ses-send-email-no-try-catch — SendEmailCommand rejects with MessageRejected, LimitExceededException, etc. No try-catch.
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
  // SHOULD_FIRE: ses-send-email-no-try-catch — SendEmailCommand to multiple recipients, no try-catch
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
  // SHOULD_FIRE: ses-raw-email-size-limit — SendRawEmailCommand rejects on MIME errors, quota, network. No try-catch.
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
  // SHOULD_FIRE: ses-template-does-not-exist — SendTemplatedEmailCommand throws TemplateDoesNotExist, MessageRejected, etc. No try-catch.
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
  // SHOULD_FIRE: ses-bulk-template-does-not-exist — SendBulkTemplatedEmailCommand throws on account/config errors. No try-catch.
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. SendBulkTemplatedEmailCommand — partial failure pattern (ses-bulk-partial-destination-failure)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-bulk-partial-destination-failure
// The bulk send succeeds (no exception) but per-destination Status array is never checked.
// Failed recipients are silently dropped.
export async function sendBulkEmailIgnoringPartialFailures(users: { email: string; name: string }[]) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch; ses-bulk-partial-destination-failure requires response.Status inspection which V2 does not implement
    await sesClient.send(new SendBulkTemplatedEmailCommand({
      Source: 'digest@example.com',
      Template: 'WeeklyDigest',
      DefaultTemplateData: '{}',
      Destinations: users.map(u => ({
        Destination: { ToAddresses: [u.email] },
        ReplacementTemplateData: JSON.stringify({ name: u.name }),
      })),
    }));
    // No response.Status inspection — partial failures silently swallowed
  } catch (err) {
    console.error('Bulk send error:', err);
    throw err;
  }
}

// @expect-clean
// Correct pattern: catches exception AND inspects per-destination Status array
export async function sendBulkEmailCheckingEachDestination(users: { email: string; name: string }[]) {
  try {
    // SHOULD_NOT_FIRE: try-catch present AND Status array inspected
    const response = await sesClient.send(new SendBulkTemplatedEmailCommand({
      Source: 'digest@example.com',
      Template: 'WeeklyDigest',
      DefaultTemplateData: '{}',
      Destinations: users.map(u => ({
        Destination: { ToAddresses: [u.email] },
        ReplacementTemplateData: JSON.stringify({ name: u.name }),
      })),
    }));
    for (const result of (response.Status ?? [])) {
      if (result.Status !== 'Success') {
        console.error('Destination failed in bulk send:', { status: result.Status, messageId: result.MessageId });
      }
    }
  } catch (err) {
    console.error('Bulk send failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SendCustomVerificationEmailCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-custom-verification-template-missing
// @expect-violation: ses-custom-verification-sender-not-verified
// @expect-violation: ses-custom-verification-sandbox-restriction
export async function sendCustomVerificationNoCatch(email: string) {
  // SHOULD_FIRE: ses-custom-verification-* — no try-catch, multiple distinct errors possible
  await sesClient.send(new SendCustomVerificationEmailCommand({
    EmailAddress: email,
    TemplateName: 'EmailVerification',
  }));
}

// @expect-clean
export async function sendCustomVerificationWithCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: custom verification email inside try-catch
    await sesClient.send(new SendCustomVerificationEmailCommand({
      EmailAddress: email,
      TemplateName: 'EmailVerification',
    }));
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'CustomVerificationEmailTemplateDoesNotExistException') {
        console.error('Verification template not found — contact ops to recreate');
      } else if (err.name === 'ProductionAccessNotGrantedException') {
        console.error('SES sandbox: can only send to verified addresses');
      } else {
        throw err;
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CreateTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-create-template-already-exists
// @expect-violation: ses-create-template-invalid-syntax
export async function createSesTemplateNoCatch(name: string, subject: string, html: string) {
  // SHOULD_FIRE: ses-create-template-* — no try-catch, AlreadyExistsException or InvalidTemplateException possible
  await sesClient.send(new CreateTemplateCommand({
    Template: {
      TemplateName: name,
      SubjectPart: subject,
      HtmlPart: html,
      TextPart: 'Please view in an HTML-capable email client.',
    },
  }));
}

// @expect-clean
export async function createSesTemplateIdempotent(name: string, subject: string, html: string) {
  try {
    // SHOULD_NOT_FIRE: CreateTemplateCommand inside try-catch with AlreadyExists handling
    await sesClient.send(new CreateTemplateCommand({
      Template: {
        TemplateName: name,
        SubjectPart: subject,
        HtmlPart: html,
        TextPart: 'Please view in an HTML-capable email client.',
      },
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'AlreadyExistsException') {
      // Template already exists — this is expected in idempotent deployments
      console.log('Template already exists, skipping creation:', name);
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. UpdateTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-update-template-not-found
// @expect-violation: ses-update-template-invalid-syntax
export async function updateSesTemplateNoCatch(name: string, html: string) {
  // SHOULD_FIRE: ses-update-template-* — no try-catch, TemplateDoesNotExistException or InvalidTemplateException possible
  await sesClient.send(new UpdateTemplateCommand({
    Template: {
      TemplateName: name,
      HtmlPart: html,
    },
  }));
}

// @expect-clean
export async function updateSesTemplateWithFallback(name: string, subject: string, html: string) {
  try {
    // SHOULD_NOT_FIRE: UpdateTemplateCommand inside try-catch with TemplateDoesNotExist fallback
    await sesClient.send(new UpdateTemplateCommand({
      Template: {
        TemplateName: name,
        SubjectPart: subject,
        HtmlPart: html,
        TextPart: 'Please view in an HTML-capable email client.',
      },
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'TemplateDoesNotExistException') {
      // Template doesn't exist — create instead
      await sesClient.send(new CreateTemplateCommand({
        Template: {
          TemplateName: name,
          SubjectPart: subject,
          HtmlPart: html,
          TextPart: 'Please view in an HTML-capable email client.',
        },
      }));
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TestRenderTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-test-render-template-missing
// @expect-violation: ses-test-render-missing-attribute
// @expect-violation: ses-test-render-invalid-parameter
export async function testRenderTemplateNoCatch(templateName: string, templateData: string) {
  // SHOULD_FIRE: ses-test-render-* — TestRenderTemplateCommand throws multiple errors, no try-catch
  const result = await sesClient.send(new TestRenderTemplateCommand({
    TemplateName: templateName,
    TemplateData: templateData,
  }));
  return result.RenderedTemplate;
}

// @expect-clean
export async function testRenderTemplateWithCatch(templateName: string, templateData: string) {
  try {
    // SHOULD_NOT_FIRE: TestRenderTemplateCommand inside try-catch
    const result = await sesClient.send(new TestRenderTemplateCommand({
      TemplateName: templateName,
      TemplateData: templateData,
    }));
    return result.RenderedTemplate;
  } catch (err) {
    if (err instanceof Error && err.name === 'TemplateDoesNotExistException') {
      console.error('Template not found:', templateName);
    } else if (err instanceof Error && err.name === 'MissingRenderingAttributeException') {
      console.error('Missing template variable in TemplateData');
    } else if (err instanceof Error && err.name === 'InvalidRenderingParameterException') {
      console.error('Invalid template variable value in TemplateData');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. CreateConfigurationSetCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-create-config-set-already-exists
// @expect-violation: ses-create-config-set-invalid
// @expect-violation: ses-create-config-set-limit-exceeded
export async function createConfigurationSetNoCatch(configSetName: string) {
  // SHOULD_FIRE: ses-create-config-set-* — CreateConfigurationSetCommand throws multiple errors, no try-catch
  await sesClient.send(new CreateConfigurationSetCommand({
    ConfigurationSet: { Name: configSetName },
  }));
}

// @expect-clean
export async function createConfigurationSetIdempotent(configSetName: string) {
  try {
    // SHOULD_NOT_FIRE: CreateConfigurationSetCommand inside try-catch with AlreadyExists handling
    await sesClient.send(new CreateConfigurationSetCommand({
      ConfigurationSet: { Name: configSetName },
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'ConfigurationSetAlreadyExistsException') {
      // Already exists — idempotent create succeeded
      console.log('Configuration set already exists, skipping:', configSetName);
      return;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. CreateConfigurationSetEventDestinationCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-event-dest-config-set-not-found
// @expect-violation: ses-event-dest-already-exists
// @expect-violation: ses-event-dest-invalid-destination
export async function createEventDestinationNoCatch(configSetName: string, topicArn: string) {
  // SHOULD_FIRE: ses-event-dest-* — CreateConfigurationSetEventDestinationCommand throws multiple errors, no try-catch
  await sesClient.send(new CreateConfigurationSetEventDestinationCommand({
    ConfigurationSetName: configSetName,
    EventDestination: {
      Name: 'BounceAndComplaintNotifications',
      Enabled: true,
      MatchingEventTypes: ['bounce', 'complaint'],
      SNSDestination: { TopicARN: topicArn },
    },
  }));
}

// @expect-clean
export async function createEventDestinationIdempotent(configSetName: string, topicArn: string) {
  try {
    // SHOULD_NOT_FIRE: CreateConfigurationSetEventDestinationCommand inside try-catch
    await sesClient.send(new CreateConfigurationSetEventDestinationCommand({
      ConfigurationSetName: configSetName,
      EventDestination: {
        Name: 'BounceAndComplaintNotifications',
        Enabled: true,
        MatchingEventTypes: ['bounce', 'complaint'],
        SNSDestination: { TopicARN: topicArn },
      },
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'EventDestinationAlreadyExistsException') {
      console.log('Event destination already configured, skipping');
      return;
    }
    if (err instanceof Error && err.name === 'ConfigurationSetDoesNotExistException') {
      console.error('Configuration set not found — create it first:', configSetName);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. CreateCustomVerificationEmailTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-create-cve-template-already-exists
// @expect-violation: ses-create-cve-template-invalid-content
// @expect-violation: ses-create-cve-template-from-not-verified
export async function createCveTemplateNoCatch(name: string, fromEmail: string, html: string) {
  // SHOULD_FIRE: ses-create-cve-template-* — CreateCustomVerificationEmailTemplateCommand throws multiple errors, no try-catch
  await sesClient.send(new CreateCustomVerificationEmailTemplateCommand({
    TemplateName: name,
    FromEmailAddress: fromEmail,
    TemplateSubject: 'Please verify your email address',
    TemplateContent: html,
    SuccessRedirectionURL: 'https://example.com/verified',
    FailureRedirectionURL: 'https://example.com/failed',
  }));
}

// @expect-clean
export async function createCveTemplateIdempotent(name: string, fromEmail: string, html: string) {
  try {
    // SHOULD_NOT_FIRE: CreateCustomVerificationEmailTemplateCommand inside try-catch
    await sesClient.send(new CreateCustomVerificationEmailTemplateCommand({
      TemplateName: name,
      FromEmailAddress: fromEmail,
      TemplateSubject: 'Please verify your email address',
      TemplateContent: html,
      SuccessRedirectionURL: 'https://example.com/verified',
      FailureRedirectionURL: 'https://example.com/failed',
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'CustomVerificationEmailTemplateAlreadyExistsException') {
      console.log('Custom verification template already exists, updating instead');
    } else if (err instanceof Error && err.name === 'FromEmailAddressNotVerifiedException') {
      console.error('From address not verified in SES:', fromEmail);
      throw err;
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. UpdateCustomVerificationEmailTemplateCommand
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ses-update-cve-template-not-found
// @expect-violation: ses-update-cve-template-invalid-content
// @expect-violation: ses-update-cve-template-from-not-verified
export async function updateCveTemplateNoCatch(name: string, html: string) {
  // SHOULD_FIRE: ses-update-cve-template-* — UpdateCustomVerificationEmailTemplateCommand throws multiple errors, no try-catch
  await sesClient.send(new UpdateCustomVerificationEmailTemplateCommand({
    TemplateName: name,
    TemplateContent: html,
  }));
}

// @expect-clean
export async function updateCveTemplateWithFallback(name: string, fromEmail: string, html: string) {
  try {
    // SHOULD_NOT_FIRE: UpdateCustomVerificationEmailTemplateCommand inside try-catch with fallback
    await sesClient.send(new UpdateCustomVerificationEmailTemplateCommand({
      TemplateName: name,
      FromEmailAddress: fromEmail,
      TemplateContent: html,
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'CustomVerificationEmailTemplateDoesNotExistException') {
      // Template doesn't exist — create instead
      await sesClient.send(new CreateCustomVerificationEmailTemplateCommand({
        TemplateName: name,
        FromEmailAddress: fromEmail,
        TemplateSubject: 'Please verify your email address',
        TemplateContent: html,
        SuccessRedirectionURL: 'https://example.com/verified',
        FailureRedirectionURL: 'https://example.com/failed',
      }));
      return;
    }
    throw err;
  }
}

