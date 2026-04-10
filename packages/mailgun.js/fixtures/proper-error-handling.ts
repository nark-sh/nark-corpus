/**
 * Proper error handling for mailgun.js
 *
 * All calls to mg.messages.create() are wrapped in try-catch.
 * Should NOT trigger any violations.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { IMailgunClient } from 'mailgun.js';

const DOMAIN = 'example.com';

/**
 * CORRECT: Send email with proper error handling.
 * Should NOT trigger violations.
 */
async function sendWelcomeEmail(mg: IMailgunClient, to: string): Promise<void> {
  const messageData = {
    from: 'Sender <sender@example.com>',
    to,
    subject: 'Welcome!',
    text: 'Welcome to our service.',
  };

  try {
    const result = await mg.messages.create(DOMAIN, messageData);
    console.log('Email sent:', result.id);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * CORRECT: Send with specific error handling.
 * Should NOT trigger violations.
 */
async function sendTransactionalEmail(
  mg: IMailgunClient,
  to: string,
  subject: string,
  text: string
): Promise<string | null> {
  try {
    const result = await mg.messages.create(DOMAIN, {
      from: 'noreply@example.com',
      to,
      subject,
      text,
    });
    return result.id;
  } catch (error) {
    const err = error as { status?: number; details?: string };
    if (err.status === 401) {
      console.error('Mailgun authentication failed. Check API key.');
    } else if (err.status === 404) {
      console.error('Mailgun domain not found:', DOMAIN);
    } else {
      console.error('Mailgun error:', err.details || error);
    }
    return null;
  }
}

/**
 * CORRECT: Promise-based error handling with .catch()
 * Should NOT trigger violations.
 */
function sendPasswordResetEmail(mg: IMailgunClient, to: string, resetLink: string): Promise<void> {
  return mg.messages.create(DOMAIN, {
    from: 'security@example.com',
    to,
    subject: 'Password Reset',
    text: `Reset your password: ${resetLink}`,
  })
    .then(() => {
      console.log('Password reset email sent');
    })
    .catch((error) => {
      console.error('Failed to send password reset email:', error);
      throw error;
    });
}

export { sendWelcomeEmail, sendTransactionalEmail, sendPasswordResetEmail };
