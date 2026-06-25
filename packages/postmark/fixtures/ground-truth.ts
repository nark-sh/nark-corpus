/**
 * postmark Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the postmark contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - sendEmail()                    → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailBatch()              → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailWithTemplate()       → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - sendEmailBatchWithTemplates() → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - activateBounce()             → SHOULD_FIRE if no try-catch (postcondition: activate-bounce-no-try-catch)
 *   - createSuppressions()         → SHOULD_FIRE if no try-catch (postcondition: create-suppressions-no-try-catch)
 *   - deleteSuppressions()         → SHOULD_FIRE if no try-catch (postcondition: delete-suppressions-no-try-catch)
 *   - createTemplate()             → SHOULD_FIRE if no try-catch (postcondition: create-template-no-try-catch)
 *   - editTemplate()               → SHOULD_FIRE if no try-catch (postcondition: edit-template-no-try-catch)
 *   - deleteTemplate()             → SHOULD_FIRE if no try-catch (postcondition: delete-template-no-try-catch)
 *   - Any of the above inside try-catch → SHOULD_NOT_FIRE
 *   - .catch() chain → SHOULD_NOT_FIRE
 *   - try-finally without catch → SHOULD_FIRE
 *
 * Coverage:
 *   - Section 1:  sendEmail() bare → SHOULD_FIRE
 *   - Section 2:  sendEmail() in try-catch → SHOULD_NOT_FIRE
 *   - Section 3:  sendEmail() with .catch() → SHOULD_NOT_FIRE
 *   - Section 4:  sendEmail() try-finally → SHOULD_FIRE
 *   - Section 5:  sendEmailBatch() bare → SHOULD_FIRE
 *   - Section 6:  sendEmailBatch() in try-catch → SHOULD_NOT_FIRE
 *   - Section 7:  sendEmailWithTemplate() bare → SHOULD_FIRE
 *   - Section 8:  sendEmailWithTemplate() in try-catch → SHOULD_NOT_FIRE
 *   - Section 9:  sendEmailBatchWithTemplates() bare → SHOULD_FIRE
 *   - Section 10: sendEmailBatchWithTemplates() in try-catch → SHOULD_NOT_FIRE
 *   - Section 11: class field — sendEmail() bare → SHOULD_FIRE
 *   - Section 12: class field — sendEmail() in try-catch → SHOULD_NOT_FIRE
 *   - Section 13: activateBounce() bare → SHOULD_FIRE
 *   - Section 14: activateBounce() in try-catch → SHOULD_NOT_FIRE
 *   - Section 15: createSuppressions() bare → SHOULD_FIRE
 *   - Section 16: createSuppressions() in try-catch → SHOULD_NOT_FIRE
 *   - Section 17: deleteSuppressions() bare → SHOULD_FIRE
 *   - Section 18: deleteSuppressions() in try-catch → SHOULD_NOT_FIRE
 *   - Section 19: createTemplate() bare → SHOULD_FIRE
 *   - Section 20: createTemplate() in try-catch → SHOULD_NOT_FIRE
 *   - Section 21: editTemplate() bare → SHOULD_FIRE
 *   - Section 22: editTemplate() in try-catch → SHOULD_NOT_FIRE
 *   - Section 23: deleteTemplate() bare → SHOULD_FIRE
 *   - Section 24: deleteTemplate() in try-catch → SHOULD_NOT_FIRE
 *   - Section 25: createWebhook() bare → SHOULD_FIRE
 *   - Section 26: createWebhook() in try-catch → SHOULD_NOT_FIRE
 *   - Section 27: createMessageStream() bare → SHOULD_FIRE
 *   - Section 28: createMessageStream() in try-catch → SHOULD_NOT_FIRE
 *
 * Design: spec-driven, NOT based on V1 behavior.
 */

import { ServerClient, Errors } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN!);

// ─────────────────────────────────────────────────────────────────────────────
// 1. sendEmail() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendEmailNoCatch(to: string) {
  // SHOULD_FIRE: api-error — sendEmail() throws on API/network failure, no try-catch
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Test',
    TextBody: 'Hello',
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. sendEmail() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithTryCatch(to: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — sendEmail() inside try-catch satisfies requirement
    const result = await client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Test',
      TextBody: 'Hello',
    });
    return result.MessageID;
  } catch (error) {
    console.error('Send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. sendEmail() — .catch() chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailWithCatchChain(to: string) {
  // SHOULD_NOT_FIRE: api-error — .catch() handles the rejection
  const result = await client.sendEmail({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Test',
    TextBody: 'Hello',
  }).catch((error) => {
    console.error('Send failed:', error);
    return null;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. sendEmail() — try-finally without catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailTryFinallyNoCatch(to: string) {
  try {
    // SHOULD_FIRE: api-error — try-finally has no catch clause, error propagates
    const result = await client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Test',
      TextBody: 'Hello',
    });
    return result.MessageID;
  } finally {
    console.log('cleanup');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. sendEmailBatch() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendBatchNoCatch(recipients: string[]) {
  const messages = recipients.map(to => ({
    From: 'noreply@example.com',
    To: to,
    Subject: 'Notification',
    TextBody: 'Update',
  }));
  // SHOULD_FIRE: api-error — sendEmailBatch() throws on failure, no try-catch
  const results = await client.sendEmailBatch(messages);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. sendEmailBatch() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchWithTryCatch(recipients: string[]) {
  try {
    const messages = recipients.map(to => ({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Notification',
      TextBody: 'Update',
    }));
    // SHOULD_NOT_FIRE: api-error — sendEmailBatch() inside try-catch
    const results = await client.sendEmailBatch(messages);
    return results;
  } catch (error) {
    console.error('Batch failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. sendEmailWithTemplate() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendTemplateNoCatch(to: string, name: string) {
  // SHOULD_FIRE: api-error — sendEmailWithTemplate() throws on failure, no try-catch
  const result = await client.sendEmailWithTemplate({
    TemplateAlias: 'welcome',
    TemplateModel: { name },
    From: 'hello@example.com',
    To: to,
  });
  return result.MessageID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. sendEmailWithTemplate() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTemplateWithTryCatch(to: string, name: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — sendEmailWithTemplate() inside try-catch
    const result = await client.sendEmailWithTemplate({
      TemplateAlias: 'welcome',
      TemplateModel: { name },
      From: 'hello@example.com',
      To: to,
    });
    return result.MessageID;
  } catch (error) {
    console.error('Template send failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. sendEmailBatchWithTemplates() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSendBatchTemplateNoCatch(recipients: Array<{ email: string; name: string }>) {
  const messages = recipients.map(r => ({
    TemplateAlias: 'welcome',
    TemplateModel: { name: r.name },
    From: 'hello@example.com',
    To: r.email,
  }));
  // SHOULD_FIRE: api-error — sendEmailBatchWithTemplates() throws on failure, no try-catch
  const results = await client.sendEmailBatchWithTemplates(messages);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. sendEmailBatchWithTemplates() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBatchTemplateWithTryCatch(recipients: Array<{ email: string; name: string }>) {
  try {
    const messages = recipients.map(r => ({
      TemplateAlias: 'welcome',
      TemplateModel: { name: r.name },
      From: 'hello@example.com',
      To: r.email,
    }));
    // SHOULD_NOT_FIRE: api-error — sendEmailBatchWithTemplates() inside try-catch
    const results = await client.sendEmailBatchWithTemplates(messages);
    return results;
  } catch (error) {
    console.error('Batch template failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Class field — sendEmail() without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class NotificationService {
  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  }

  async notify(to: string, message: string) {
    // SHOULD_FIRE: api-error — this.client.sendEmail() without try-catch
    await this.client.sendEmail({
      From: 'noreply@example.com',
      To: to,
      Subject: 'Notification',
      TextBody: message,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Class field — sendEmail() with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class SafeNotificationService {
  private client: ServerClient;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN!);
  }

  async notify(to: string, message: string) {
    try {
      // SHOULD_NOT_FIRE: api-error — this.client.sendEmail() inside try-catch
      await this.client.sendEmail({
        From: 'noreply@example.com',
        To: to,
        Subject: 'Notification',
        TextBody: message,
      });
    } catch (error) {
      console.error('Notification failed:', error);
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. activateBounce() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareActivateBounceNoCatch(bounceId: number) {
  // SHOULD_FIRE: activate-bounce-no-try-catch — activateBounce() throws on API failure, no try-catch
  const result = await client.activateBounce(bounceId);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. activateBounce() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function activateBounceWithTryCatch(bounceId: number) {
  try {
    // SHOULD_NOT_FIRE: activate-bounce-no-try-catch — activateBounce() inside try-catch
    const result = await client.activateBounce(bounceId);
    return result;
  } catch (error) {
    console.error('Bounce activation failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. createSuppressions() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateSuppressionsNoCatch(email: string) {
  // SHOULD_FIRE: create-suppressions-no-try-catch — createSuppressions() throws on API failure, no try-catch
  const result = await client.createSuppressions('outbound', {
    Suppressions: [{ EmailAddress: email }]
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. createSuppressions() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createSuppressionsWithTryCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: create-suppressions-no-try-catch — createSuppressions() inside try-catch
    const result = await client.createSuppressions('outbound', {
      Suppressions: [{ EmailAddress: email }]
    });
    const failed = result.Suppressions.filter((s: { Status: string }) => s.Status === 'Failed');
    if (failed.length > 0) {
      console.error('Failed to suppress:', failed);
    }
    return result;
  } catch (error) {
    console.error('Suppression API failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. deleteSuppressions() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareDeleteSuppressionsNoCatch(email: string) {
  // SHOULD_FIRE: delete-suppressions-no-try-catch — deleteSuppressions() throws on API failure, no try-catch
  const result = await client.deleteSuppressions('outbound', {
    Suppressions: [{ EmailAddress: email }]
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. deleteSuppressions() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteSuppressionsWithTryCatch(email: string) {
  try {
    // SHOULD_NOT_FIRE: delete-suppressions-no-try-catch — deleteSuppressions() inside try-catch
    const result = await client.deleteSuppressions('outbound', {
      Suppressions: [{ EmailAddress: email }]
    });
    const failed = result.Suppressions.filter((s: { Status: string }) => s.Status === 'Failed');
    if (failed.length > 0) {
      // SpamComplaint suppressions cannot be deleted
      console.warn('Could not remove suppressions (may be SpamComplaint):', failed);
    }
    return result;
  } catch (error) {
    console.error('Delete suppressions failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. createTemplate() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateTemplateNoCatch() {
  // SHOULD_FIRE: create-template-no-try-catch — createTemplate() throws on API failure, no try-catch
  const template = await client.createTemplate({
    Name: 'Welcome Email',
    Subject: 'Welcome to {{product_name}}',
    HtmlBody: '<p>Hello, {{name}}!</p>',
    TextBody: 'Hello, {{name}}!',
    Alias: 'welcome-v1',
  });
  return template.TemplateId;
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. createTemplate() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createTemplateWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: create-template-no-try-catch — createTemplate() inside try-catch
    const template = await client.createTemplate({
      Name: 'Welcome Email',
      Subject: 'Welcome to {{product_name}}',
      HtmlBody: '<p>Hello, {{name}}!</p>',
      TextBody: 'Hello, {{name}}!',
      Alias: 'welcome-v1',
    });
    return template.TemplateId;
  } catch (error) {
    console.error('Template creation failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. editTemplate() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareEditTemplateNoCatch(alias: string) {
  // SHOULD_FIRE: edit-template-no-try-catch — editTemplate() throws on API failure, no try-catch
  const updated = await client.editTemplate(alias, {
    Subject: 'Welcome to {{company_name}}!',
    HtmlBody: '<p>Hi {{name}}, welcome aboard!</p>',
  });
  return updated.TemplateId;
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. editTemplate() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function editTemplateWithTryCatch(alias: string) {
  try {
    // SHOULD_NOT_FIRE: edit-template-no-try-catch — editTemplate() inside try-catch
    const updated = await client.editTemplate(alias, {
      Subject: 'Welcome to {{company_name}}!',
      HtmlBody: '<p>Hi {{name}}, welcome aboard!</p>',
    });
    return updated.TemplateId;
  } catch (error) {
    if (error instanceof Errors.ApiInputError) {
      console.error('Template not found or validation failed:', (error as Error).message);
    } else {
      console.error('Template update failed:', error);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. createWebhook() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateWebhookNoCatch() {
  // SHOULD_FIRE: create-webhook-no-try-catch — createWebhook() throws ApiInputError (ErrorCode 606) if URL is
  // invalid or contains internal IP range; throws InvalidAPIKeyError, RateLimitExceededError on API failure
  const webhook = await client.createWebhook({
    Url: 'https://example.com/webhooks/email',
    Triggers: {
      Delivery: { Enabled: true },
      Bounce: { Enabled: true, IncludeContent: false },
    },
  });
  return webhook.ID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. createWebhook() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createWebhookWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: create-webhook-no-try-catch — createWebhook() inside try-catch
    const webhook = await client.createWebhook({
      Url: 'https://example.com/webhooks/email',
      Triggers: {
        Delivery: { Enabled: true },
        Bounce: { Enabled: true, IncludeContent: false },
      },
    });
    return webhook.ID;
  } catch (error) {
    if (error instanceof Errors.ApiInputError) {
      // ErrorCode 606: URL invalid or internal IP — alert ops immediately
      console.error('Webhook URL rejected by Postmark:', (error as Error).message);
    } else {
      console.error('Webhook creation failed:', error);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. createMessageStream() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateMessageStreamNoCatch() {
  // SHOULD_FIRE: create-message-stream-no-try-catch — createMessageStream() throws ApiInputError (ErrorCode 1225
  // max 10 streams, 1227 invalid ID format, 1228 only one inbound, 1230 ID exists, etc.) if provisioning fails;
  // missing stream causes all sendEmail() calls to that stream to throw ErrorCode 1235 (cascade failure)
  const stream = await client.createMessageStream({
    ID: 'marketing-outbound',
    Name: 'Marketing Outbound',
    MessageStreamType: 'Broadcasts',
  });
  return stream.ID;
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. createMessageStream() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createMessageStreamWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: create-message-stream-no-try-catch — createMessageStream() inside try-catch
    const stream = await client.createMessageStream({
      ID: 'marketing-outbound',
      Name: 'Marketing Outbound',
      MessageStreamType: 'Broadcasts',
    });
    return stream.ID;
  } catch (error) {
    if (error instanceof Errors.ApiInputError) {
      const code = (error as any).code;
      if (code === 1225) {
        console.error('Max 10 message streams reached — delete unused streams first');
      } else if (code === 1227) {
        console.error('Invalid stream ID format');
      } else if (code === 1230) {
        console.error('Stream ID already exists');
      } else {
        console.error('Message stream creation failed:', (error as Error).message);
      }
    } else {
      console.error('Stream creation failed:', error);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. deleteTemplate() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareDeleteTemplateNoCatch(alias: string) {
  // SHOULD_FIRE: delete-template-no-try-catch — deleteTemplate() throws on 404 not-found, 422 ErrorCode 1130 layout-cascade, 401, 429, 5xx
  const result = await client.deleteTemplate(alias);
  return result.Message;
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. deleteTemplate() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteTemplateWithTryCatch(alias: string) {
  try {
    // SHOULD_NOT_FIRE: delete-template-no-try-catch — deleteTemplate() inside try-catch
    const result = await client.deleteTemplate(alias);
    return result.Message;
  } catch (error) {
    if (error instanceof Errors.ApiInputError) {
      // ErrorCode 1130: layout-cascade — re-queue after dependent templates are removed
      console.error('Layout cascade blocked:', (error as Error).message);
    } else if (error instanceof Errors.PostmarkError) {
      // 404 template-not-found arrives here (no specialized class for 404)
      console.warn('Template already absent:', (error as Error).message);
    } else {
      throw error;
    }
  }
}
