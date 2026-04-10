/**
 * Fixture: Proper Error Handling for @sendgrid/mail
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should NOT trigger any violations.
 */

import sgMail from '@sendgrid/mail';

// Configure API key with validation and trimming
const apiKey = process.env.SENDGRID_API_KEY?.trim();
if (!apiKey) {
  throw new Error('SENDGRID_API_KEY is required');
}
sgMail.setApiKey(apiKey);

/**
 * ✅ CORRECT: send() with try-catch and error.response check
 */
async function sendEmailWithProperErrorHandling() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Test Email',
      text: 'Hello World',
      html: '<strong>Hello World</strong>',
    });
    console.log('Email sent successfully');
  } catch (error: any) {
    // Check for API error response
    if (error.response) {
      console.error('SendGrid API Error:', error.response.body);

      // Handle specific error codes
      if (error.response.statusCode === 429) {
        console.error('Rate limit exceeded. Retry after:', error.response.headers['x-ratelimit-reset']);
      } else if (error.response.statusCode === 401) {
        console.error('Invalid API key');
      } else if (error.response.statusCode === 400) {
        console.error('Validation error:', error.response.body);
      }
    } else {
      // Network error (no response)
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: sendMultiple() with try-catch and rate limit handling
 */
async function sendMultipleEmailsWithProperHandling() {
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

  try {
    await sgMail.sendMultiple(messages);
    console.log('Emails sent successfully');
  } catch (error: any) {
    if (error.response) {
      console.error('SendGrid API Error:', error.response.body);

      // Specifically handle rate limiting for bulk sends
      if (error.response.statusCode === 429) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        console.error(`Rate limit exceeded. Reset at: ${resetTime}`);
        // Implement exponential backoff or queue for retry
      }
    } else {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Promise-based error handling with .catch()
 */
function sendEmailWithPromiseCatch() {
  sgMail
    .send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Promise-based Email',
      text: 'Using .catch() for error handling',
    })
    .then(() => {
      console.log('Email sent successfully');
    })
    .catch((error) => {
      if (error.response) {
        console.error('API Error:', error.response.body);

        if (error.response.statusCode === 429) {
          console.error('Rate limit - implement retry logic');
        }
      } else {
        console.error('Network Error:', error.message);
      }
    });
}

/**
 * ✅ CORRECT: Template email with proper error handling
 */
async function sendTemplateEmailWithErrorHandling(templateId: string) {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      templateId: templateId,
      dynamicTemplateData: {
        name: 'John Doe',
        verificationCode: '123456',
      },
    });
    console.log('Template email sent');
  } catch (error: any) {
    if (error.response) {
      console.error('Template Error:', error.response.body);

      // Handle template-specific errors
      if (error.response.statusCode === 400) {
        console.error('Invalid template ID or template data');
      }
    } else {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Retry logic for rate limiting
 */
async function sendWithRetry(maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await sgMail.send({
        to: 'user@example.com',
        from: 'noreply@company.com',
        subject: 'Retry Email',
        text: 'Attempt ' + (retries + 1),
      });
      console.log('Email sent successfully');
      return;
    } catch (error: any) {
      if (error.response && error.response.statusCode === 429) {
        retries++;
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Rate limit hit. Waiting ${waitTime}ms before retry ${retries}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Non-rate-limit error - don't retry
        if (error.response) {
          console.error('API Error:', error.response.body);
        }
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Export for testing
export {
  sendEmailWithProperErrorHandling,
  sendMultipleEmailsWithProperHandling,
  sendEmailWithPromiseCatch,
  sendTemplateEmailWithErrorHandling,
  sendWithRetry,
};
