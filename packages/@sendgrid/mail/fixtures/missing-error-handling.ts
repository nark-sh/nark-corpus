/**
 * Fixture: Missing Error Handling for @sendgrid/mail
 *
 * This file demonstrates INCORRECT error handling patterns.
 * Should trigger ERROR violations.
 */

import sgMail from '@sendgrid/mail';

// Configure API key (without validation - should trigger warning)
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * ❌ VIOLATION: send() without try-catch
 * Should trigger: send-no-try-catch (ERROR)
 */
async function sendEmailWithoutTryCatch() {
  await sgMail.send({
    to: 'user@example.com',
    from: 'noreply@company.com',
    subject: 'No Error Handling',
    text: 'This will crash if SendGrid API fails',
  });
  console.log('Email sent'); // May never reach here if error occurs
}

/**
 * ❌ VIOLATION: sendMultiple() without try-catch
 * Should trigger: sendMultiple-no-try-catch (ERROR)
 */
async function sendMultipleWithoutTryCatch() {
  const messages = [
    {
      to: 'user1@example.com',
      from: 'noreply@company.com',
      subject: 'Bulk Email 1',
      text: 'Content 1',
    },
    {
      to: 'user2@example.com',
      from: 'noreply@company.com',
      subject: 'Bulk Email 2',
      text: 'Content 2',
    },
  ];

  await sgMail.sendMultiple(messages);
  console.log('Emails sent'); // Will crash on rate limit
}

/**
 * ❌ VIOLATION: Promise without .catch()
 * Should trigger: send-no-try-catch (ERROR)
 */
function sendEmailWithoutCatch() {
  sgMail
    .send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Promise without catch',
      text: 'Unhandled promise rejection',
    })
    .then(() => {
      console.log('Email sent');
    });
  // Missing .catch() - unhandled promise rejection!
}

/**
 * ❌ VIOLATION: Template email without error handling
 * Should trigger: send-no-try-catch (ERROR)
 */
async function sendTemplateWithoutErrorHandling(templateId: string) {
  await sgMail.send({
    to: 'user@example.com',
    from: 'noreply@company.com',
    templateId: templateId,
    dynamicTemplateData: {
      name: 'John Doe',
    },
  });
  console.log('Template sent'); // Will crash on invalid template
}

/**
 * ❌ VIOLATION: Batch sending without error handling
 * Should trigger: send-no-try-catch (ERROR)
 */
async function sendBatchWithoutHandling(recipients: string[]) {
  for (const recipient of recipients) {
    await sgMail.send({
      to: recipient,
      from: 'noreply@company.com',
      subject: 'Batch Email',
      text: 'No error handling in loop',
    });
  }
  // One failure will break the entire loop
}

/**
 * ❌ VIOLATION: Nested call without error handling
 * Should trigger: send-no-try-catch (ERROR)
 */
async function nestedSendWithoutHandling() {
  async function innerSend() {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Nested Call',
      text: 'No error handling',
    });
  }

  await innerSend(); // No try-catch here or in innerSend
}

/**
 * ❌ VIOLATION: API key without validation
 * Should trigger: api-key-not-validated (WARNING)
 */
function setApiKeyWithoutValidation() {
  // No .trim(), no check for undefined/empty
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
}

/**
 * ❌ VIOLATION: API key from K8s environment without trim
 * Should trigger: api-key-not-validated (WARNING)
 */
function setK8sApiKeyWithoutTrim() {
  // In Kubernetes, env vars may have trailing whitespace
  const apiKey = process.env.SENDGRID_API_KEY || '';
  sgMail.setApiKey(apiKey); // Missing .trim()
}

// Export for testing
export {
  sendEmailWithoutTryCatch,
  sendMultipleWithoutTryCatch,
  sendEmailWithoutCatch,
  sendTemplateWithoutErrorHandling,
  sendBatchWithoutHandling,
  nestedSendWithoutHandling,
  setApiKeyWithoutValidation,
  setK8sApiKeyWithoutTrim,
};
