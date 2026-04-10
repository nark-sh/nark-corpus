/**
 * Missing error handling for mailgun.js
 *
 * All calls to mg.messages.create() lack try-catch.
 * Should trigger ERROR violations.
 */

import type { IMailgunClient } from 'mailgun.js';

const DOMAIN = 'example.com';

/**
 * INCORRECT: No try-catch around messages.create()
 * Should trigger violation.
 */
async function sendWelcomeEmail(mg: IMailgunClient, to: string): Promise<void> {
  const messageData = {
    from: 'Sender <sender@example.com>',
    to,
    subject: 'Welcome!',
    text: 'Welcome to our service.',
  };

  // ❌ No try-catch — will crash if Mailgun API is unavailable or key is invalid
  const result = await mg.messages.create(DOMAIN, messageData);
  console.log('Email sent:', result.id);
}

/**
 * INCORRECT: No error handling in notification service
 * Should trigger violation.
 */
async function sendNotification(mg: IMailgunClient, userId: string, message: string): Promise<void> {
  const to = `user-${userId}@example.com`;

  // ❌ No try-catch — delivery failures silently lost
  await mg.messages.create(DOMAIN, {
    from: 'notifications@example.com',
    to,
    subject: 'New notification',
    text: message,
  });
}

/**
 * INCORRECT: No error handling in invoice mailer
 * Should trigger violation.
 */
async function sendInvoice(mg: IMailgunClient, customerEmail: string, invoiceId: string): Promise<void> {
  // ❌ No try-catch — critical email (invoice) could fail silently
  await mg.messages.create(DOMAIN, {
    from: 'billing@example.com',
    to: customerEmail,
    subject: `Invoice #${invoiceId}`,
    text: `Your invoice ${invoiceId} is attached.`,
  });
}

export { sendWelcomeEmail, sendNotification, sendInvoice };
