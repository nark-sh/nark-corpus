/**
 * Fixture: Generic Error Handling for @sendgrid/mail
 *
 * This file demonstrates SUBOPTIMAL error handling patterns.
 * Should trigger WARNING violations (not ERROR).
 */

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * ⚠️ WARNING: Generic catch without error.response check
 * Should trigger: send-no-error-response-check (WARNING)
 */
async function sendEmailWithGenericCatch() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Generic Error Handling',
      text: 'Missing detailed error handling',
    });
  } catch (error: any) {
    // Generic error logging - missing error.response check
    console.error('Email send failed:', error.message);
    // Won't see detailed API error information
  }
}

/**
 * ⚠️ WARNING: sendMultiple with generic catch
 * Should trigger: send-no-error-response-check (WARNING)
 */
async function sendMultipleWithGenericCatch() {
  const messages = [
    {
      to: 'user1@example.com',
      from: 'noreply@company.com',
      subject: 'Email 1',
      text: 'Content 1',
    },
    {
      to: 'user2@example.com',
      from: 'noreply@company.com',
      subject: 'Email 2',
      text: 'Content 2',
    },
  ];

  try {
    await sgMail.sendMultiple(messages);
  } catch (error: any) {
    // Missing error.response.body check
    console.error('Bulk send failed:', error);
    // Won't know if it's rate limit (429) or auth issue (401)
  }
}

/**
 * ⚠️ WARNING: Catch without rate limit handling
 * Should trigger: rate-limit-not-handled (INFO)
 */
async function sendWithoutRateLimitHandling() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'No Rate Limit Handling',
      text: 'Will fail permanently on 429',
    });
  } catch (error: any) {
    if (error.response) {
      console.error('API Error:', error.response.body);
      // Has error.response check, but doesn't handle 429 specifically
      // No retry logic for rate limits
    }
    throw error;
  }
}

/**
 * ⚠️ WARNING: Only logs error without re-throwing
 * Not detectable by current analyzer, but bad practice
 */
async function sendWithSilentFailure() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Silent Failure',
      text: 'Error will be swallowed',
    });
  } catch (error: any) {
    console.error('Error occurred:', error.message);
    // Doesn't re-throw - caller won't know it failed!
  }
}

/**
 * ⚠️ WARNING: Incomplete error.response check
 * Checks response but not body
 */
async function sendWithIncompleteResponseCheck() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Incomplete Check',
      text: 'Missing body check',
    });
  } catch (error: any) {
    if (error.response) {
      // Has response check but doesn't access .body
      console.error('Status:', error.response.statusCode);
      // Missing detailed error message from .body
    }
  }
}

/**
 * ⚠️ WARNING: No status code checking
 * Has error.response but doesn't differentiate error types
 */
async function sendWithoutStatusCodeCheck() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'No Status Check',
      text: 'Same handling for all errors',
    });
  } catch (error: any) {
    if (error.response) {
      console.error('Error:', error.response.body);
      // Treats 429 (retry) same as 400 (bad data) same as 401 (bad key)
    }
  }
}

/**
 * ⚠️ INFO: Template send without rate limit handling
 * Should trigger: rate-limit-not-handled (INFO)
 */
async function sendTemplateWithoutRateLimitCheck(templateId: string) {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      templateId: templateId,
      dynamicTemplateData: {
        name: 'User',
      },
    });
  } catch (error: any) {
    if (error.response) {
      console.error('Template error:', error.response.body);
      // Has error.response check, but no 429 handling
    }
  }
}

// Export for testing
export {
  sendEmailWithGenericCatch,
  sendMultipleWithGenericCatch,
  sendWithoutRateLimitHandling,
  sendWithSilentFailure,
  sendWithIncompleteResponseCheck,
  sendWithoutStatusCodeCheck,
  sendTemplateWithoutRateLimitCheck,
};
