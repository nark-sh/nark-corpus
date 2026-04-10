/**
 * Twilio Instance Usage Examples
 *
 * This file tests detection of Twilio client instances and method chaining.
 * Tests that the analyzer can detect violations on instance methods.
 */

import twilio from 'twilio';
import { Twilio } from 'twilio';

// Create client instance
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Test 1: Instance method without error handling
 * ❌ Should trigger violation
 */
class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  // ❌ No try-catch - should trigger violation
  async sendSms(to: string, body: string) {
    const message = await this.client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return message.sid;
  }

  // ❌ No try-catch - should trigger violation
  async makeCall(to: string, url: string) {
    const call = await this.client.calls.create({
      url,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return call.sid;
  }
}

/**
 * Test 2: Stored instance reference without error handling
 * ❌ Should trigger violation
 */
async function useStoredInstance() {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  // ❌ No try-catch - should trigger violation
  const message = await twilioClient.messages.create({
    body: 'Test',
    to: '+12345678901',
    from: '+10987654321'
  });

  return message;
}

/**
 * Test 3: Method chaining without error handling
 * ❌ Should trigger violation
 */
async function useMethodChaining() {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

  // ❌ No try-catch on chained method
  const verification = await client.verify
    .services(serviceSid)
    .verifications
    .create({ to: '+12345678901', channel: 'sms' });

  return verification;
}

/**
 * Test 4: Client passed as parameter without error handling
 * ❌ Should trigger violation
 */
async function sendViaParameter(twilioClient: Twilio, to: string) {
  // ❌ No try-catch - should trigger violation
  const message = await twilioClient.messages.create({
    body: 'Parameter test',
    to,
    from: '+10987654321'
  });
  return message;
}

/**
 * Test 5: Instance with proper error handling
 * ✅ Should NOT trigger violation
 */
class TwilioServiceWithErrorHandling {
  private client: Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  // ✅ Has try-catch
  async sendSms(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      return message.sid;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

/**
 * Test 6: Factory pattern without error handling
 * ❌ Should trigger violation
 */
function createTwilioService() {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  return {
    // ❌ No try-catch - should trigger violation
    sendSms: async (to: string, body: string) => {
      const message = await client.messages.create({
        body,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      return message;
    }
  };
}

/**
 * Test 7: Multiple instance operations in sequence
 * ❌ Should trigger multiple violations
 */
async function multipleOperationsWithoutHandling() {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  // ❌ Violation 1: No try-catch on messages.create
  const message = await twilioClient.messages.create({
    body: 'First message',
    to: '+12345678901',
    from: '+10987654321'
  });

  // ❌ Violation 2: No try-catch on calls.create
  const call = await twilioClient.calls.create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: '+12345678901',
    from: '+10987654321'
  });

  return { message, call };
}

export {
  TwilioService,
  useStoredInstance,
  useMethodChaining,
  sendViaParameter,
  TwilioServiceWithErrorHandling,
  createTwilioService,
  multipleOperationsWithoutHandling
};
