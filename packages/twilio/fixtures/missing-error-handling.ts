/**
 * Twilio Missing Error Handling Examples
 *
 * This file demonstrates INCORRECT patterns that should trigger violations.
 * Expected: Multiple ERROR and WARNING severity violations.
 */

import twilio from 'twilio';

// ❌ VIOLATION: Hardcoded credentials (ERROR)
const client = twilio(
  'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'your_auth_token_here'
);

/**
 * ❌ VIOLATION: No try-catch around messages.create (ERROR)
 */
async function sendSmsWithoutErrorHandling(to: string, body: string) {
  // Missing try-catch - should trigger violation
  const message = await client.messages.create({
    body,
    to,
    from: '+10987654321'
  });

  console.log(`Message sent: ${message.sid}`);
  return message;
}

/**
 * ❌ VIOLATION: No try-catch around calls.create (ERROR)
 */
async function makeCallWithoutErrorHandling(to: string) {
  // Missing try-catch - should trigger violation
  const call = await client.calls.create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to,
    from: '+10987654321'
  });

  console.log(`Call initiated: ${call.sid}`);
  return call;
}

/**
 * ❌ VIOLATION: No try-catch around verifications.create (ERROR)
 */
async function sendVerificationWithoutErrorHandling(to: string) {
  const serviceSid = 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  // Missing try-catch - should trigger violation
  const verification = await client.verify
    .services(serviceSid)
    .verifications
    .create({ to, channel: 'sms' });

  console.log(`Verification sent: ${verification.sid}`);
  return verification;
}

/**
 * ⚠️ VIOLATION: Generic catch without RestException check (WARNING)
 */
async function sendSmsWithGenericCatch(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: '+10987654321'
    });
    return message;
  } catch (error) {
    // Generic error handling - missing RestException check
    console.error('Failed to send message');
    throw error;
  }
}

/**
 * ⚠️ VIOLATION: Bulk operation without rate limit handling (WARNING)
 */
async function sendBulkSmsWithoutRateLimitHandling(recipients: string[], message: string) {
  const results = [];

  for (const to of recipients) {
    try {
      const msg = await client.messages.create({
        body: message,
        to,
        from: '+10987654321'
      });
      results.push({ success: true, sid: msg.sid });
    } catch (error) {
      // No rate limit check (error.code === 14107)
      console.error('Failed to send');
      results.push({ success: false });
    }
  }

  return results;
}

/**
 * ⚠️ VIOLATION: No auth error handling on initial call (WARNING)
 */
async function testConnectionWithoutAuthErrorHandling() {
  try {
    const account = await client.api.accounts('ACxxx').fetch();
    console.log(`Connected`);
  } catch (error) {
    // Missing check for error codes 20003, 20005
    console.error('Connection failed');
    throw error;
  }
}

/**
 * ❌ VIOLATION: Webhook handler without signature validation (ERROR)
 */
function handleWebhookWithoutValidation(req: any, res: any) {
  // No signature verification - security vulnerability
  const { Body, From } = req.body;

  console.log(`Received message from ${From}: ${Body}`);

  res.send('<Response></Response>');
}

/**
 * ❌ VIOLATION: Promise without .catch() (ERROR)
 */
function sendSmsWithoutCatch(to: string, body: string) {
  // No .catch() handler - unhandled promise rejection
  return client.messages
    .create({
      body,
      to,
      from: '+10987654321'
    })
    .then((message) => {
      console.log(`Message sent: ${message.sid}`);
      return message;
    });
  // Missing .catch()
}

/**
 * ❌ VIOLATION: Multiple missing patterns
 */
async function complexViolation(to: string) {
  // 1. Hardcoded phone number
  // 2. No try-catch
  // 3. No validation
  const message = await client.messages.create({
    body: 'Test message',
    to,
    from: '+10987654321'  // Hardcoded
  });

  return message.sid;
}

export {
  sendSmsWithoutErrorHandling,
  makeCallWithoutErrorHandling,
  sendVerificationWithoutErrorHandling,
  sendSmsWithGenericCatch,
  sendBulkSmsWithoutRateLimitHandling,
  testConnectionWithoutAuthErrorHandling,
  handleWebhookWithoutValidation,
  sendSmsWithoutCatch,
  complexViolation
};
