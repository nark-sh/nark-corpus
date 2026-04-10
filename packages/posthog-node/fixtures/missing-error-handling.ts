/**
 * posthog-node Missing Error Handling Fixtures
 *
 * These patterns SHOULD trigger violations.
 * Each async network call is made without try-catch.
 */

import { PostHog } from 'posthog-node';

const posthog = new PostHog('phc_test_key', { host: 'https://app.posthog.com' });
const userId = 'user-123';

// ─── getFeatureFlag — missing try-catch ───────────────────────────────────────

/**
 * getFeatureFlag without try-catch — should trigger violation.
 * If PostHog API is unreachable, this produces an unhandled promise rejection.
 */
export async function getFeatureFlagNoCatch(): Promise<string | boolean | undefined> {
  // should trigger violation
  const flag = await posthog.getFeatureFlag('new-dashboard', userId);
  return flag;
}

/**
 * getFeatureFlag in a try-finally without catch — should trigger violation.
 * The finally block runs cleanup but errors still propagate uncaught.
 */
export async function getFeatureFlagTryFinallyNoCatch(): Promise<string | boolean | undefined> {
  try {
    // should trigger violation — try-finally has no catch
    const flag = await posthog.getFeatureFlag('new-dashboard', userId);
    return flag;
  } finally {
    console.log('cleanup');
  }
}

// ─── isFeatureEnabled — missing try-catch ─────────────────────────────────────

/**
 * isFeatureEnabled without try-catch — should trigger violation.
 */
export async function isFeatureEnabledNoCatch(): Promise<boolean | undefined> {
  // should trigger violation
  const enabled = await posthog.isFeatureEnabled('beta-feature', userId);
  return enabled;
}

// ─── getAllFlags — missing try-catch ──────────────────────────────────────────

/**
 * getAllFlags without try-catch — should trigger violation.
 * This is the pattern found in n8n (real-world anti-pattern).
 */
export async function getAllFlagsNoCatch(): Promise<Record<string, string | boolean>> {
  // should trigger violation
  const flags = await posthog.getAllFlags(userId);
  return flags;
}

/**
 * getAllFlags without try-catch via instance method — should trigger violation.
 */
export class PostHogClientMissingErrorHandling {
  private client: PostHog;

  constructor() {
    this.client = new PostHog('phc_test_key', { host: 'https://app.posthog.com' });
  }

  async getFeatureFlags(userId: string): Promise<Record<string, string | boolean>> {
    // should trigger violation — same pattern as n8n
    return await this.client.getAllFlags(userId, {
      personProperties: { plan: 'pro' },
    });
  }

  async checkFlag(flagKey: string, userId: string): Promise<boolean | undefined> {
    // should trigger violation
    return await this.client.isFeatureEnabled(flagKey, userId);
  }
}
