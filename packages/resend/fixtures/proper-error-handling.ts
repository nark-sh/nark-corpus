/**
 * Fixture: proper-error-handling.ts
 *
 * Demonstrates CORRECT error handling for Resend emails.send().
 * Should produce ZERO violations.
 *
 * Resend v2+ returns { data, error } — does NOT throw exceptions.
 * Proper handling: always wrap in try-catch AND check result.error.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ✅ CORRECT: try-catch with destructured { data, error } check.
 */
async function sendWelcomeEmail(userEmail: string): Promise<string | null> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@example.com',
      to: userEmail,
      subject: 'Welcome!',
      html: '<p>Welcome to our platform!</p>',
    });

    if (error) {
      console.error('Failed to send welcome email:', error.message);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error('Unexpected error sending welcome email:', err);
    return null;
  }
}

/**
 * ✅ CORRECT: try-catch with result variable and result.error check.
 */
async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: 'noreply@example.com',
      to: userEmail,
      subject: 'Reset your password',
      html: `<p>Click <a href="https://app.example.com/reset/${resetToken}">here</a> to reset.</p>`,
    });

    if (result.error) {
      console.error('Password reset email failed:', result.error);
      return false;
    }

    console.log('Password reset email sent, id:', result.data?.id);
    return true;
  } catch (err) {
    console.error('Unexpected error sending password reset email:', err);
    return false;
  }
}

/**
 * ✅ CORRECT: Batch send wrapped in try-catch with error check.
 */
async function sendBatchNotifications(recipients: string[]): Promise<void> {
  const emails = recipients.map((to) => ({
    from: 'notifications@example.com',
    to,
    subject: 'You have a new notification',
    html: '<p>Check your dashboard for updates.</p>',
  }));

  try {
    const { data, error } = await resend.batch.send(emails);

    if (error) {
      console.error('Batch email send failed:', error.message, 'status:', error.statusCode);
      throw new Error(`Failed to send batch emails: ${error.message}`);
    }

    console.log(`Sent ${data?.length ?? 0} emails successfully.`);
  } catch (err) {
    console.error('Unexpected error sending batch emails:', err);
    throw err;
  }
}

/**
 * ✅ CORRECT: try-catch with result.error rethrow for caller to handle.
 */
async function sendReceiptEmail(email: string, orderId: string): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: 'receipts@example.com',
      to: email,
      subject: `Receipt for order ${orderId}`,
      html: `<p>Thank you for your order ${orderId}.</p>`,
    });

    if (result.error) {
      throw new Error(`Email delivery failed: ${result.error.message}`);
    }
  } catch (err) {
    console.error(`Receipt email failed for order ${orderId}:`, err);
    throw err;
  }
}

export {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBatchNotifications,
  sendReceiptEmail,
};
