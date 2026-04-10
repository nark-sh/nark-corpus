/**
 * Twilio Proper Error Handling Examples
 *
 * This file demonstrates CORRECT error handling patterns for Twilio SDK.
 * Should produce 0 violations when analyzed.
 */

import twilio from 'twilio';
import { RestException } from 'twilio';

// ✅ GOOD: Credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * ✅ GOOD: Send SMS with proper error handling
 */
async function sendSmsWithProperErrorHandling(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    console.log(`Message sent: ${message.sid}`);
    return message;
  } catch (error) {
    if (error instanceof RestException) {
      console.error(`Twilio error ${error.code}: ${error.message}`);

      // Handle specific error codes
      if (error.code === 21211) {
        throw new Error('Invalid phone number format');
      } else if (error.code === 20003) {
        throw new Error('Invalid Twilio credentials');
      }
    }
    throw error;
  }
}

/**
 * ✅ GOOD: Make phone call with error handling
 */
async function makeCallWithProperErrorHandling(to: string, twimlUrl: string) {
  try {
    const call = await client.calls.create({
      url: twimlUrl,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    console.log(`Call initiated: ${call.sid}`);
    return call;
  } catch (error) {
    if (error instanceof RestException) {
      console.error(`Call failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * ✅ GOOD: Send verification code with error handling
 */
async function sendVerificationCodeWithProperHandling(to: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

  try {
    const verification = await client.verify
      .services(serviceSid)
      .verifications
      .create({ to, channel: 'sms' });

    console.log(`Verification sent: ${verification.sid}`);
    return verification;
  } catch (error) {
    if (error instanceof RestException) {
      console.error(`Verification failed: ${error.code}`);
    }
    throw error;
  }
}

/**
 * ✅ GOOD: Bulk SMS with rate limit handling
 */
async function sendBulkSmsWithRateLimitHandling(recipients: string[], message: string) {
  const results = [];

  for (const to of recipients) {
    try {
      const msg = await client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      results.push({ success: true, sid: msg.sid });
    } catch (error) {
      if (error instanceof RestException) {
        if (error.code === 14107) {
          // Rate limited - wait and retry
          console.log('Rate limited, waiting 60 seconds...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          // Retry logic here
        } else if (error.code === 21211) {
          // Invalid number - skip
          results.push({ success: false, error: 'Invalid number' });
          continue;
        }
      }
      results.push({ success: false, error: String(error) });
    }
  }

  return results;
}

/**
 * ✅ GOOD: Promise-based error handling (alternative pattern)
 */
function sendSmsWithPromiseHandling(to: string, body: string) {
  return client.messages
    .create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    })
    .then((message) => {
      console.log(`Message sent: ${message.sid}`);
      return message;
    })
    .catch((error) => {
      if (error instanceof RestException) {
        console.error(`Twilio error ${error.code}: ${error.message}`);
      }
      throw error;
    });
}

/**
 * ✅ GOOD: Webhook signature validation (Express example)
 */
function validateWebhookSignature(
  req: any,
  authToken: string
): boolean {
  const signature = req.headers['x-twilio-signature'];
  const url = `https://example.com/twilio/webhook`;

  const isValid = twilio.validateRequest(
    authToken,
    signature,
    url,
    req.body
  );

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  return true;
}

/**
 * ✅ GOOD: Initial API call with auth error handling
 */
async function testConnectionWithAuthHandling() {
  try {
    // Test credentials with a simple API call
    const account = await client.api.accounts(accountSid).fetch();
    console.log(`Connected to account: ${account.friendlyName}`);
  } catch (error) {
    if (error instanceof RestException) {
      if (error.code === 20003) {
        throw new Error('Invalid Twilio credentials - check ACCOUNT_SID and AUTH_TOKEN');
      } else if (error.code === 20005) {
        throw new Error('Twilio account is suspended');
      }
    }
    throw error;
  }
}

export {
  sendSmsWithProperErrorHandling,
  makeCallWithProperErrorHandling,
  sendVerificationCodeWithProperHandling,
  sendBulkSmsWithRateLimitHandling,
  sendSmsWithPromiseHandling,
  validateWebhookSignature,
  testConnectionWithAuthHandling
};
