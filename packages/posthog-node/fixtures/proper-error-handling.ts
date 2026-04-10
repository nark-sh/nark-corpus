/**
 * posthog-node Proper Error Handling Fixtures
 *
 * These patterns SHOULD NOT trigger violations.
 * They demonstrate correct usage of posthog-node's async methods.
 *
 * Key distinction:
 *   - capture(), identify(), alias() are fire-and-forget — no try-catch needed (correct as-is)
 *   - getFeatureFlag(), isFeatureEnabled(), getAllFlags() are async network calls — MUST have try-catch
 *   - shutdown() is async and should have try-catch
 */

import { PostHog } from 'posthog-node';

const posthog = new PostHog('phc_test_key', { host: 'https://app.posthog.com' });
const userId = 'user-123';

// ─── Fire-and-forget methods (no try-catch needed) ───────────────────────────

/**
 * capture() is fire-and-forget. The SDK queues events and delivers them
 * asynchronously. Errors are swallowed by the SDK — never thrown to callers.
 * Correct to call without try-catch.
 */
export function captureEventNoTryCatchIsCorrect(): void {
  posthog.capture({
    distinctId: userId,
    event: 'user_signed_up',
    properties: { plan: 'pro', referral: 'organic' },
  });
}

/**
 * identify() is fire-and-forget. Same behavior as capture().
 */
export function identifyUserNoTryCatchIsCorrect(): void {
  posthog.identify({
    distinctId: userId,
    properties: { email: 'user@example.com', name: 'Alice' },
  });
}

// ─── getFeatureFlag — with proper try-catch ───────────────────────────────────

/**
 * getFeatureFlag with try-catch. The async network call is properly guarded.
 */
export async function getFeatureFlagWithCatch(): Promise<string | boolean | undefined> {
  try {
    const flag = await posthog.getFeatureFlag('new-dashboard', userId);
    return flag;
  } catch (err) {
    console.error('Feature flag check failed:', err);
    return undefined; // Fall back to default
  }
}

/**
 * getFeatureFlag using .catch() chain is also valid.
 */
export async function getFeatureFlagWithPromiseCatch(): Promise<boolean | undefined> {
  const flag = await posthog.getFeatureFlag('dark-mode', userId).catch((err: Error) => {
    console.error('Feature flag check failed:', err);
    return undefined;
  });
  return flag as boolean | undefined;
}

// ─── isFeatureEnabled — with proper try-catch ─────────────────────────────────

/**
 * isFeatureEnabled with try-catch is safe.
 */
export async function isFeatureEnabledWithCatch(): Promise<boolean> {
  try {
    const enabled = await posthog.isFeatureEnabled('beta-feature', userId);
    return enabled ?? false;
  } catch (err) {
    console.error('Feature flag evaluation failed:', err);
    return false; // Default to disabled
  }
}

// ─── getAllFlags — with proper try-catch ──────────────────────────────────────

/**
 * getAllFlags with try-catch prevents unhandled rejection.
 */
export async function getAllFlagsWithCatch(): Promise<Record<string, string | boolean>> {
  try {
    const flags = await posthog.getAllFlags(userId);
    return flags;
  } catch (err) {
    console.error('Failed to fetch feature flags:', err);
    return {}; // Safe default: all flags disabled
  }
}

/**
 * getAllFlags in a service method with proper error handling.
 */
export class FeatureFlagService {
  private posthogClient: PostHog;

  constructor() {
    this.posthogClient = new PostHog('phc_test_key', {
      host: 'https://app.posthog.com',
    });
  }

  async getFlags(userId: string): Promise<Record<string, string | boolean>> {
    try {
      return await this.posthogClient.getAllFlags(userId, {
        personProperties: { plan: 'pro' },
      });
    } catch (err) {
      console.error('PostHog getAllFlags failed:', err);
      return {};
    }
  }

  async checkFlag(flagKey: string, userId: string): Promise<boolean> {
    try {
      const enabled = await this.posthogClient.isFeatureEnabled(flagKey, userId);
      return enabled ?? false;
    } catch (err) {
      console.error(`Feature flag ${flagKey} check failed:`, err);
      return false;
    }
  }
}

// ─── shutdown — with proper try-catch ────────────────────────────────────────

/**
 * shutdown() should be called with try-catch to handle flush failures gracefully.
 */
export async function shutdownWithCatch(): Promise<void> {
  try {
    await posthog.shutdown();
  } catch (err) {
    console.error('PostHog shutdown failed:', err);
    // Continue with process exit — non-critical
  }
}
