/**
 * Fixture: missing-error-handling.ts
 *
 * Demonstrates INCORRECT usage of inngest.
 * All inngest.send() calls are missing try/catch.
 * Should produce multiple ERROR violations.
 */

import { Inngest } from 'inngest';

const inngest = new Inngest({ id: 'my-app' });

// ─── 1. Basic send — no try-catch ────────────────────────────────────────────

/**
 * WRONG: inngest.send() without try-catch.
 * Network failures, auth errors, or Inngest API outages will throw unhandled errors.
 */
export async function sendEventMissingErrorHandling(userId: string) {
  // should trigger violation
  const result = await inngest.send({
    name: 'app/user.created',
    data: { userId },
  });
  return result;
}

// ─── 2. Batch send — no try-catch ────────────────────────────────────────────

/**
 * WRONG: sending multiple events without try-catch.
 */
export async function sendBatchMissingErrorHandling(userIds: string[]) {
  // should trigger violation
  const result = await inngest.send(
    userIds.map((userId) => ({
      name: 'app/user.created' as const,
      data: { userId },
    }))
  );
  return result;
}

// ─── 3. Send in an API route handler — no try-catch ──────────────────────────

/**
 * WRONG: sending from an API route without error handling.
 * If Inngest is unreachable, the entire request fails with an unhandled 500.
 */
export async function apiRouteHandlerMissingErrorHandling(req: { userId: string }) {
  // should trigger violation
  await inngest.send({
    name: 'app/signup.completed',
    data: { userId: req.userId },
  });
  return { success: true };
}

// ─── 4. Send in a service class — no try-catch ───────────────────────────────

/**
 * WRONG: service method that sends an event without error handling.
 */
export class UserService {
  async onUserRegistered(userId: string) {
    // should trigger violation
    await inngest.send({
      name: 'app/user.registered',
      data: { userId },
    });
  }
}
