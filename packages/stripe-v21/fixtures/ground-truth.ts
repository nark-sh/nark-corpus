/**
 * Stripe v21 Ground-Truth Fixture
 *
 * Tests v21-specific API contracts:
 *   - parseEventNotification() — new v21 thin event entry point
 *   - EventNotification.fetchRelatedObject() — async method on parsed notifications
 *   - EventNotification.fetchEvent() — async method on parsed notifications
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the stripe-v21 contract spec and stripe-node v21.0.1 source.
 *
 * Key v21 contracts:
 *   - parseEventNotification throws StripeSignatureVerificationError + plain Error
 *   - fetchRelatedObject() is async, throws StripeError, returns null (not throws) for no related_object
 *   - fetchEvent() is async, throws StripeError, throws TemporarySessionExpiredError
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';

// ─────────────────────────────────────────────────────────────────────────────
// 1. parseEventNotification — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function parseEventNotificationNoCatch(payload: string, header: string) {
  // SHOULD_FIRE: parse-event-notification-signature-failed — no try-catch
  const notification = stripe.parseEventNotification(payload, header, webhookSecret);
  return notification;
}

export async function parseEventNotificationWithCatch(payload: string, header: string) {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch satisfies error handling
    const notification = stripe.parseEventNotification(payload, header, webhookSecret);
    return notification;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new Error('Invalid webhook signature');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. fetchRelatedObject — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchRelatedObjectNoCatch(payload: string, header: string) {
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = stripe.parseEventNotification(payload, header, webhookSecret);
  } catch (err) {
    throw err;
  }
  // SHOULD_FIRE: fetch-related-object-no-try-catch — fetchRelatedObject without try-catch
  const related = await notification.fetchRelatedObject();
  return related;
}

export async function fetchRelatedObjectWithCatch(payload: string, header: string) {
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = stripe.parseEventNotification(payload, header, webhookSecret);
  } catch (err) {
    throw err;
  }
  try {
    // SHOULD_NOT_FIRE: fetchRelatedObject inside try-catch satisfies error handling
    const related = await notification.fetchRelatedObject();
    if (!related) return null; // null check for notifications without related_object
    return related;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to fetch related object: ${err.message}`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. fetchEvent — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchEventNoCatch(payload: string, header: string) {
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = stripe.parseEventNotification(payload, header, webhookSecret);
  } catch (err) {
    throw err;
  }
  // SHOULD_FIRE: fetch-event-no-try-catch — fetchEvent without try-catch
  const event = await notification.fetchEvent();
  return event;
}

export async function fetchEventWithCatch(payload: string, header: string) {
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = stripe.parseEventNotification(payload, header, webhookSecret);
  } catch (err) {
    throw err;
  }
  try {
    // SHOULD_NOT_FIRE: fetchEvent inside try-catch satisfies error handling
    const event = await notification.fetchEvent();
    return event;
  } catch (err) {
    if (err instanceof Stripe.errors.TemporarySessionExpiredError) {
      // Re-fetch via direct events API when context expires
      throw new Error(`Session expired, re-fetch via stripe.v2.core.events.retrieve()`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Full webhook handler patterns
// ─────────────────────────────────────────────────────────────────────────────

export async function properV21WebhookHandler(
  rawBody: string,
  signature: string
): Promise<void> {
  // SHOULD_NOT_FIRE: all calls properly wrapped
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = stripe.parseEventNotification(rawBody, signature, webhookSecret);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new Error('400: Invalid webhook signature');
    }
    throw err;
  }

  if (notification.type === 'v1.billing.meter.error_report_triggered') {
    try {
      const meter = await notification.fetchRelatedObject();
      if (!meter) return;
      console.log('Meter status:', meter);
    } catch (err) {
      if (err instanceof Stripe.errors.TemporarySessionExpiredError) {
        console.error('Context expired, delaying processing');
      } else {
        throw err;
      }
    }
  }
}

export async function brokenV21WebhookHandler(
  rawBody: string,
  signature: string
): Promise<void> {
  // SHOULD_FIRE: parse-event-notification-signature-failed — no outer try-catch
  const notification = stripe.parseEventNotification(rawBody, signature, webhookSecret);

  // SHOULD_FIRE: fetch-related-object-no-try-catch — fetchRelatedObject uncaught
  const related = await notification.fetchRelatedObject();
  console.log(related);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. parseEventNotificationAsync — added 2026-06-24 (deepen pass 2)
//    Async mirror of parseEventNotification. Required in Edge Runtimes.
// ─────────────────────────────────────────────────────────────────────────────

export async function parseEventNotificationAsyncNoCatch(payload: string, header: string) {
  // SHOULD_FIRE: parse-event-notification-async-signature-failed
  const notification = await stripe.parseEventNotificationAsync(payload, header, webhookSecret);
  return notification;
}

export async function parseEventNotificationAsyncWithCatch(payload: string, header: string) {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch satisfies error handling
    const notification = await stripe.parseEventNotificationAsync(payload, header, webhookSecret);
    return notification;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new Error('400: Invalid webhook signature');
    }
    throw err;
  }
}

export async function edgeRuntimeWebhookHandler(
  rawBody: string,
  signature: string
): Promise<void> {
  // SHOULD_NOT_FIRE: Edge Runtime pattern with proper try-catch on async parse
  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = await stripe.parseEventNotificationAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new Error('400: Invalid webhook signature');
    }
    // Plain Error from wrong-payload-type guard caught here too
    throw err;
  }

  if (notification.type === 'v1.billing.meter.error_report_triggered') {
    try {
      const meter = await notification.fetchRelatedObject();
      if (!meter) return;
      console.log('Meter:', meter);
    } catch (err) {
      if (err instanceof Stripe.errors.TemporarySessionExpiredError) {
        console.error('Context expired');
      } else {
        throw err;
      }
    }
  }
}

export async function brokenEdgeRuntimeHandler(
  rawBody: string,
  signature: string
): Promise<void> {
  // SHOULD_FIRE: parse-event-notification-async-signature-failed — no outer try-catch
  const notification = await stripe.parseEventNotificationAsync(rawBody, signature, webhookSecret);
  console.log(notification.id);
}
