/**
 * twilio Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "twilio"):
 *   - client.messages.create()       postcondition: messages-create-no-try-catch
 *   - client.calls(sid).update()     postcondition: calls-update-no-try-catch
 *   - client.messages(sid).fetch()   postcondition: messages-fetch-no-try-catch
 *   - calls(sid).recordings.create() postcondition: recordings-create-no-try-catch
 *   - verify.v2.services.create()    postcondition: verify-services-create-no-try-catch
 *
 * Detection path: twilio(accountSid, authToken) factory → InstanceTracker tracks client →
 *   ThrowingFunctionDetector fires method →
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. client.calls(callSid).update() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: calls-update-no-try-catch
export async function cancelCallNoCatch(callSid: string) {
  const client = twilio(accountSid, authToken);
  // SHOULD_FIRE: calls-update-no-try-catch — update() throws RestException 21220 when call is no longer in-progress. No try-catch.
  const call = await client.calls(callSid).update({ status: 'canceled' });
  return call.sid;
}

// @expect-clean
export async function cancelCallWithCatch(callSid: string) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: calls(sid).update() inside try-catch satisfies error handling
    const call = await client.calls(callSid).update({ status: 'canceled' });
    return call.sid;
  } catch (err: any) {
    // Handle 21220: call already ended — treat as success (goal achieved)
    if (err.code === 21220) {
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. client.messages(messageSid).fetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: messages-fetch-no-try-catch
export async function checkMessageStatusNoCatch(messageSid: string) {
  const client = twilio(accountSid, authToken);
  // SHOULD_FIRE: messages-fetch-no-try-catch — fetch() throws 404 when SID not found. No try-catch.
  const message = await client.messages(messageSid).fetch();
  return message.status;
}

// @expect-clean
export async function checkMessageStatusWithCatch(messageSid: string) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: messages(sid).fetch() inside try-catch satisfies error handling
    const message = await client.messages(messageSid).fetch();
    return message.status;
  } catch (err: any) {
    if (err.status === 404) {
      return null; // Message SID not found
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. calls(callSid).recordings.create() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: recordings-create-no-try-catch
export async function startRecordingNoCatch(callSid: string) {
  const client = twilio(accountSid, authToken);
  // SHOULD_FIRE: recordings-create-no-try-catch — throws 21220 when call not in-progress. No try-catch.
  const recording = await client.calls(callSid).recordings.create();
  return recording.sid;
}

// @expect-clean
export async function startRecordingWithCatch(callSid: string) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: recordings.create() inside try-catch satisfies error handling
    const recording = await client.calls(callSid).recordings.create();
    return recording.sid;
  } catch (err: any) {
    if (err.code === 21220) {
      // Call already ended — recording missed, but not fatal
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. verify.v2.services.create() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: verify-services-create-no-try-catch
export async function createVerifyServiceNoCatch(friendlyName: string) {
  const client = twilio(accountSid, authToken);
  // SHOULD_FIRE: verify-services-create-no-try-catch — throws on auth failure or bad params. No try-catch.
  const service = await client.verify.v2.services.create({ friendlyName });
  return service.sid;
}

// @expect-clean
export async function createVerifyServiceWithCatch(friendlyName: string) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: verify.v2.services.create() inside try-catch satisfies error handling
    const service = await client.verify.v2.services.create({ friendlyName });
    return service.sid;
  } catch (err: any) {
    console.error('Failed to create Verify service:', err.code, err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. messages.create() depth: error.code 21610 (recipient opted out via STOP)
// Postcondition: messages-create-opted-out-not-handled
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: messages-create-opted-out-not-handled
export async function sendSmsGenericCatchNoOptOutCheck(to: string, body: string) {
  const client = twilio(accountSid, authToken);
  try {
    // PENDING_DETECTOR: messages-create-opted-out-not-handled — detector not yet built
    // (queued via concern-20260624-twilio-deepen-1). Postcondition asserts that catch
    // around messages.create() should check error.code === 21610 (recipient STOP'd).
    const message = await client.messages.create({ body, to, from: '+15551234567' });
    return message.sid;
  } catch (err) {
    console.error('SMS failed:', err);
    return null;
  }
}

// @expect-clean
export async function sendSmsHandlesOptOut(
  to: string,
  body: string,
  markOptedOut: (n: string) => Promise<void>,
) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: catch explicitly handles error.code 21610.
    const message = await client.messages.create({ body, to, from: '+15551234567' });
    return message.sid;
  } catch (err: any) {
    if (err.code === 21610) {
      // Recipient opted out — mark in DB so we never retry; fall back to email.
      await markOptedOut(to);
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. messages.create() depth: error.code 21408 (geo-permission denied)
// Postcondition: messages-create-geo-permission-not-handled
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: messages-create-geo-permission-not-handled
export async function sendInternationalSmsNoGeoCheck(to: string, body: string) {
  const client = twilio(accountSid, authToken);
  try {
    // PENDING_DETECTOR: messages-create-geo-permission-not-handled — detector not yet built
    // (queued via concern-20260624-twilio-deepen-2). Postcondition asserts that catch
    // around messages.create() should check error.code === 21408 (geo-permission blocked).
    const message = await client.messages.create({ body, to, from: '+15551234567' });
    return message.sid;
  } catch (err) {
    return null;
  }
}

// @expect-clean
export async function sendInternationalSmsHandlesGeo(
  to: string,
  body: string,
  alertOps: (code: string) => Promise<void>,
) {
  const client = twilio(accountSid, authToken);
  try {
    // SHOULD_NOT_FIRE: catch explicitly handles error.code 21408.
    const message = await client.messages.create({ body, to, from: '+15551234567' });
    return message.sid;
  } catch (err: any) {
    if (err.code === 21408) {
      // Geo-permission denied — alert ops to enable the country in Console
      // and fall back to email verification.
      await alertOps(to);
      throw new Error('SMS unavailable in your region — please use email verification.');
    }
    throw err;
  }
}
