/**
 * @clerk/nextjs - Webhook Verification Testing
 *
 * Tests detection of webhook signature verification patterns.
 * CRITICAL SECURITY: Webhooks must verify signatures to prevent forgery.
 *
 * Security Advisory: GHSA-9mp4-77wg-rwx9
 * Unverified webhooks allow attackers to forge user events.
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';

// ❌ CRITICAL VIOLATION: No signature verification
// Accepts and processes any webhook payload without validation
export async function POST_NoVerification(req: Request) {
  const event = await req.json();

  // SECURITY FLAW: Processing unverified data
  // Attacker can forge events like user.created, user.updated, etc.
  if (event.type === 'user.created') {
    await database.createUser({
      id: event.data.id,
      email: event.data.email_addresses[0].email_address,
      // Forged data being written to database!
    });
  }

  if (event.type === 'user.deleted') {
    await database.deleteUser(event.data.id);
    // Attacker can delete any user by sending forged webhook!
  }

  return Response.json({ success: true });
}

// ❌ VIOLATION: Signature verified but not in try-catch
// Invalid signature causes 500 instead of proper 400
export async function POST_VerifyNoCatch(req: Request) {
  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  const wh = new Webhook(webhookSecret);

  // No try-catch - throws on invalid signature
  const event = wh.verify(payload, {
    'svix-id': svixId!,
    'svix-timestamp': svixTimestamp!,
    'svix-signature': svixSignature!,
  });

  await processEvent(event);

  return Response.json({ success: true });
}

// ❌ VIOLATION: Missing webhook secret
// Will fail at runtime but not caught
export async function POST_MissingSecret(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  // No check if CLERK_WEBHOOK_SECRET exists
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const event = wh.verify(payload, headers);
    await processEvent(event);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }
}

// ❌ VIOLATION: Partial verification (checks header but doesn't verify)
export async function POST_FakeVerification(req: Request) {
  const signature = req.headers.get('svix-signature');

  // SECURITY FLAW: Just checking if header exists, not verifying signature
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  const event = await req.json();

  // Processing event without actual signature verification
  await processEvent(event);

  return Response.json({ success: true });
}

// ❌ VIOLATION: Using wrong secret (development vs production)
export async function POST_WrongSecret(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  // WRONG: Using hardcoded or wrong secret
  const wh = new Webhook('whsec_development_secret_123');

  try {
    const event = wh.verify(payload, headers);
    await processEvent(event);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }
}

// ✅ CORRECT: Proper webhook verification with error handling
export async function POST_ProperVerification(req: Request) {
  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  // Validate headers exist
  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  // Check secret is configured
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  try {
    // Verify signature - throws if invalid
    const event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    // Safe to process verified event
    await processEvent(event);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}

// ✅ CORRECT: Alternative pattern with headers() from Next.js
export async function POST_ProperVerificationAlt(req: Request) {
  const payload = await req.text();
  const headersList = headers();

  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Missing headers' }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  try {
    const event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    // Process verified event
    if (event.type === 'user.created') {
      await handleUserCreated(event.data);
    } else if (event.type === 'user.updated') {
      await handleUserUpdated(event.data);
    } else if (event.type === 'user.deleted') {
      await handleUserDeleted(event.data);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }
}

// ❌ VIOLATION: Event processing happens before verification
export async function POST_ProcessBeforeVerify(req: Request) {
  const event = await req.json();

  // SECURITY FLAW: Processing event first
  await processEvent(event);

  // Verification happens too late
  const payload = JSON.stringify(event);
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    wh.verify(payload, headers);
    return Response.json({ success: true });
  } catch (err) {
    // Too late - already processed unverified data!
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }
}

// ❌ VIOLATION: Ignoring verification errors
export async function POST_IgnoreVerificationError(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const event = wh.verify(payload, headers);
    await processEvent(event);
  } catch (err) {
    // SECURITY FLAW: Silently continuing on verification failure
    console.log('Verification failed, processing anyway...');
    const event = JSON.parse(payload);
    await processEvent(event); // Processing unverified data!
  }

  return Response.json({ success: true });
}

// Helper functions (mock implementations)
const database = {
  createUser: async (data: any) => {},
  updateUser: async (id: string, data: any) => {},
  deleteUser: async (id: string) => {},
};

async function processEvent(event: any) {
  console.log('Processing event:', event.type);
}

async function handleUserCreated(data: any) {
  await database.createUser(data);
}

async function handleUserUpdated(data: any) {
  await database.updateUser(data.id, data);
}

async function handleUserDeleted(data: any) {
  await database.deleteUser(data.id);
}

// Export all scenarios
export {
  POST_NoVerification,
  POST_VerifyNoCatch,
  POST_MissingSecret,
  POST_FakeVerification,
  POST_WrongSecret,
  POST_ProperVerification,
  POST_ProperVerificationAlt,
  POST_ProcessBeforeVerify,
  POST_IgnoreVerificationError,
};
