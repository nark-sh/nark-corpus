/**
 * Fixture: missing-error-handling.ts
 *
 * Demonstrates INCORRECT error handling for Resend emails.send().
 * Should trigger ERROR violations for each call site.
 *
 * Each function here has an antipattern that leads to silent email failures.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ❌ WRONG: No try-catch, result returned directly without error check.
 * If send fails, caller receives { data: null, error: ErrorResponse } silently.
 * Mirroring the dub antipattern.
 */
async function sendEmailMissingErrorCheck(to: string, subject: string, html: string) {
  // ❌ Should trigger violation — no try-catch around await
  return await resend.emails.send({
    from: 'noreply@example.com',
    to,
    subject,
    html,
  });
}

/**
 * ❌ WRONG: Accesses result.data without checking result.error first.
 * result.data is null when there's an error — optional chaining hides the bug.
 * Mirroring the redwood antipattern.
 */
async function sendEmailAccessesDataWithoutCheckingError(to: string) {
  // ❌ Should trigger violation — no try-catch around await
  const result = await resend.emails.send({
    from: 'noreply@example.com',
    to,
    subject: 'Hello',
    html: '<p>Hello</p>',
  });

  // Using result.data?.id without checking result.error first
  // If API call failed, result.data is null — returns undefined silently
  return result.data?.id;
}

/**
 * ❌ WRONG: Batch send without try-catch or error check.
 * Silent failure — all emails in batch unsent with no error reported.
 */
async function sendBatchMissingErrorCheck(recipients: string[]) {
  // ❌ Should trigger violation — no try-catch around await
  const result = await resend.batch.send(
    recipients.map((to) => ({
      from: 'notifications@example.com',
      to,
      subject: 'Notification',
      html: '<p>You have a new notification.</p>',
    }))
  );

  // Returns { data, error } without checking — caller likely ignores error
  return result;
}

/**
 * ❌ WRONG: Fires and forgets without any error handling.
 * Email failure is completely undetectable.
 */
async function sendEmailFireAndForget(userEmail: string) {
  // ❌ Should trigger violation — no try-catch around await
  await resend.emails.send({
    from: 'noreply@example.com',
    to: userEmail,
    subject: 'Notification',
    html: '<p>This is a notification.</p>',
  });

  // No result variable, no error check — completely blind to failures
}

export {
  sendEmailMissingErrorCheck,
  sendEmailAccessesDataWithoutCheckingError,
  sendBatchMissingErrorCheck,
  sendEmailFireAndForget,
};
