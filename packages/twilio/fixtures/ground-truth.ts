/**
 * twilio Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "twilio"):
 *   - client.messages.create()  postcondition: messages-create-no-try-catch
 *
 * Detection path: twilio(accountSid, authToken) factory → InstanceTracker tracks client →
 *   ThrowingFunctionDetector fires messages.create() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

// ─────────────────────────────────────────────────────────────────────────────
// 1. client.messages.create() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function sendSmsNoCatch(to: string, body: string) {
  const client = twilio(accountSid, authToken);
  // SHOULD_FIRE: messages-create-no-try-catch — messages.create() throws on API errors. No try-catch.
  const message = await client.messages.create({ body, to, from: '+15551234567' });
  return message.sid;
}

export async function sendSmsWithCatch(to: string, body: string) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: client.messages.create() inside try-catch satisfies error handling
    const message = await client.messages.create({ body, to, from: '+15551234567' });
    return message.sid;
  } catch (err) {
    console.error('SMS failed:', err);
    throw err;
  }
}
