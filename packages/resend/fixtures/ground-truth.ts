/**
 * resend Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "resend"):
 *   - resend.emails.send()       postcondition: send-no-error-check
 *   - resend.batch.send()        postcondition: batch-send-no-error-check
 *   - resend.webhooks.verify()   postcondition: webhooks-verify-no-try-catch, webhooks-verify-missing-secret
 *   - resend.emails.cancel()     postcondition: emails-cancel-no-error-check
 *   - resend.contacts.create()   postcondition: contacts-create-no-error-check
 *   - resend.broadcasts.send()   postcondition: broadcasts-send-no-error-check
 *
 * Detection pattern:
 *   - Resend is imported from 'resend'
 *   - new Resend() tracked → resend instance resolved to package
 *   - ThrowingFunctionDetector: resend.emails.send() → detected
 *   - ContractMatcher: checks try-catch → fires send-no-error-check
 *
 * Note: Resend v2+ does NOT throw on API errors — it returns { data, error }.
 * EXCEPTION: webhooks.verify() DOES throw (WebhookVerificationError from standardwebhooks).
 * The postconditions fire when methods are called without proper error checking.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// 1. emails.send() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNoCatch(to: string, subject: string) {
  // SHOULD_FIRE: send-no-error-check — network errors can throw; result.error unchecked. No try-catch.
  return await resend.emails.send({
    from: 'noreply@example.com',
    to,
    subject,
    html: '<p>Hello</p>',
  });
}

export async function sendEmailWithCatch(to: string, subject: string) {
  try {
    // SHOULD_NOT_FIRE: emails.send() inside try-catch satisfies error handling
    const { data, error } = await resend.emails.send({
      from: 'noreply@example.com',
      to,
      subject,
      html: '<p>Hello</p>',
    });
    if (error) throw new Error(error.message);
    return data?.id;
  } catch (err) {
    console.error('Email failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. emails.send() — assignment patterns
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailAssignNoCatch(to: string) {
  // SHOULD_FIRE: send-no-error-check — result assigned but no try-catch wrapper
  const result = await resend.emails.send({
    from: 'noreply@example.com',
    to,
    subject: 'Test',
    html: '<p>Test</p>',
  });
  return result.data?.id;
}

export async function sendEmailAssignWithCatch(to: string) {
  try {
    // SHOULD_NOT_FIRE: assignment pattern inside try-catch
    const result = await resend.emails.send({
      from: 'noreply@example.com',
      to,
      subject: 'Test',
      html: '<p>Test</p>',
    });
    if (result.error) throw new Error(result.error.message);
    return result.data?.id;
  } catch (err) {
    console.error('Failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. webhooks.verify() — THROWS (unlike all other resend methods)
// ─────────────────────────────────────────────────────────────────────────────

export function verifyWebhookNoCatch(
  payload: string,
  headers: { id: string; timestamp: string; signature: string }
) {
  // SHOULD_FIRE: webhooks-verify-no-try-catch — verify() throws WebhookVerificationError on invalid sig/expired timestamp/missing headers
  return resend.webhooks.verify({
    payload,
    headers,
    webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
  });
}

export function verifyWebhookWithCatch(
  payload: string,
  headers: { id: string; timestamp: string; signature: string }
) {
  try {
    // SHOULD_NOT_FIRE: webhooks.verify() inside try-catch satisfies error handling
    return resend.webhooks.verify({
      payload,
      headers,
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    });
  } catch (err) {
    // WebhookVerificationError — invalid signature, expired timestamp, missing headers
    console.error('Webhook verification failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. emails.cancel() — scheduled email cancellation
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelEmailNoCatch(emailId: string) {
  // SHOULD_FIRE: emails-cancel-no-error-check — result.error not checked
  return await resend.emails.cancel(emailId);
}

export async function cancelEmailWithCheck(emailId: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.emails.cancel(emailId);
  if (error) {
    console.error('Failed to cancel email:', error.message);
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. contacts.create() — audience/segment contact management
// ─────────────────────────────────────────────────────────────────────────────

export async function createContactNoCatch(email: string, firstName: string) {
  // SHOULD_FIRE: contacts-create-no-error-check — result.error not checked
  return await resend.contacts.create({
    email,
    firstName,
    segments: [{ id: process.env.RESEND_SEGMENT_ID! }],
  });
}

export async function createContactWithCheck(email: string, firstName: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.contacts.create({
    email,
    firstName,
    segments: [{ id: process.env.RESEND_SEGMENT_ID! }],
  });
  if (error) {
    console.error('Failed to add contact to Resend segment:', error);
    // Do not throw — contact sync failure should not block user registration
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. broadcasts.send() — mass email sending
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBroadcastNoCatch(broadcastId: string) {
  // SHOULD_FIRE: broadcasts-send-no-error-check — result.error not checked on high-impact op
  return await resend.broadcasts.send(broadcastId);
}

export async function sendBroadcastWithCheck(broadcastId: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.broadcasts.send(broadcastId);
  if (error) {
    console.error('Broadcast send failed:', { broadcastId, error });
    throw new Error(`Broadcast send failed: ${error.message}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. emails.create() — alias for emails.send() (added in deepen pass 2026-06-12)
// ─────────────────────────────────────────────────────────────────────────────

export async function createEmailNoCatch(to: string, subject: string) {
  // SHOULD_FIRE: emails-create-no-error-check — result.error unchecked. No try-catch.
  return await resend.emails.create({
    from: 'noreply@example.com',
    to,
    subject,
    html: '<p>Hello via create()</p>',
  });
}

export async function createEmailWithCheck(to: string, subject: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.emails.create({
    from: 'noreply@example.com',
    to,
    subject,
    html: '<p>Hello via create()</p>',
  });
  if (error) {
    console.error('Create email failed:', error);
    throw new Error(`Create email failed: ${error.message}`);
  }
  return data?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. emails.update() — reschedule a scheduled email
// ─────────────────────────────────────────────────────────────────────────────

export async function rescheduleEmailNoCheck(emailId: string, newTime: Date) {
  // SHOULD_FIRE: emails-update-no-error-check — not_found / validation_error silently swallowed
  return await resend.emails.update({
    id: emailId,
    scheduledAt: newTime.toISOString(),
  });
}

export async function rescheduleEmailWithCheck(emailId: string, newTime: Date) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.emails.update({
    id: emailId,
    scheduledAt: newTime.toISOString(),
  });
  if (error) {
    if (error.name === 'not_found') {
      console.warn('Email already sent or never scheduled — no-op');
      return null;
    }
    throw new Error(`Cannot reschedule: ${error.message}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. batch.create() — alias for batch.send()
// ─────────────────────────────────────────────────────────────────────────────

export async function batchCreateNoCheck(payloads: Array<{ to: string; subject: string }>) {
  // SHOULD_FIRE: batch-create-no-error-check — entire batch silently fails on error
  return await resend.batch.create(
    payloads.map((p) => ({
      from: 'noreply@example.com',
      to: p.to,
      subject: p.subject,
      html: '<p>batch via create()</p>',
    })),
  );
}

export async function batchCreateWithCheck(payloads: Array<{ to: string; subject: string }>) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.batch.create(
    payloads.map((p) => ({
      from: 'noreply@example.com',
      to: p.to,
      subject: p.subject,
      html: '<p>batch via create()</p>',
    })),
  );
  if (error) {
    console.error('Batch send failed', { batchSize: payloads.length, error });
    throw new Error(`Batch failed: ${error.message}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. domains.verify() — trigger domain verification check
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyDomainNoCheck(domainId: string) {
  // SHOULD_FIRE: domains-verify-no-error-check — not_found / restricted_api_key silently swallowed
  return await resend.domains.verify(domainId);
}

export async function verifyDomainWithCheck(domainId: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.domains.verify(domainId);
  if (error) {
    console.error('Domain verification trigger failed', { domainId, error });
    throw new Error(`Cannot verify domain: ${error.message}`);
  }
  // success = "verification triggered" — caller should poll domains.get(id) for status
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. broadcasts.create() — create a broadcast draft
// ─────────────────────────────────────────────────────────────────────────────

export async function createBroadcastNoCheck(name: string, segmentId: string) {
  // SHOULD_FIRE: broadcasts-create-no-error-check — silent failure cascades into send(undefined)
  return await resend.broadcasts.create({
    name,
    subject: 'Newsletter',
    from: 'newsletter@example.com',
    audienceId: segmentId,
    html: '<p>Broadcast body</p>',
  });
}

export async function createBroadcastWithCheck(name: string, segmentId: string) {
  // SHOULD_NOT_FIRE: result.error is checked
  const { data, error } = await resend.broadcasts.create({
    name,
    subject: 'Newsletter',
    from: 'newsletter@example.com',
    audienceId: segmentId,
    html: '<p>Broadcast body</p>',
  });
  if (error) {
    console.error('Broadcast create failed', { name, error });
    throw new Error(`Failed to create broadcast: ${error.message}`);
  }
  return data?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. webhooks.create() — register a webhook subscription
// ─────────────────────────────────────────────────────────────────────────────

export async function createWebhookNoCheck(endpoint: string) {
  // SHOULD_FIRE: webhooks-create-no-error-check — silent failure means signing_secret never persisted
  return await resend.webhooks.create({
    endpoint,
    events: ['email.delivered', 'email.bounced'],
  });
}

export async function createWebhookWithCheck(endpoint: string) {
  // SHOULD_NOT_FIRE: result.error is checked AND signing_secret is persisted
  const { data, error } = await resend.webhooks.create({
    endpoint,
    events: ['email.delivered', 'email.bounced'],
  });
  if (error) {
    throw new Error(`Failed to create webhook: ${error.message}`);
  }
  // CRITICAL: persist signing_secret before deploying the verifying handler
  process.env.RESEND_WEBHOOK_SECRET = data!.signing_secret;
  return data;
}
