/**
 * posthog-node Instance Usage Fixtures
 *
 * Tests that verify-cli detects violations through instance-based usage.
 * PostHog clients are typically instantiated once and used as instances.
 */

import { PostHog } from 'posthog-node';

// ─── Direct instance usage ────────────────────────────────────────────────────

class AnalyticsService {
  private posthog: PostHog;

  constructor(apiKey: string) {
    this.posthog = new PostHog(apiKey, {
      host: 'https://eu.posthog.com',
    });
  }

  /**
   * Feature flag check without error handling.
   * Should trigger violation via instance tracking.
   */
  async isFeatureEnabled(flagKey: string, userId: string): Promise<boolean | undefined> {
    // should trigger violation — instance method without try-catch
    return await this.posthog.isFeatureEnabled(flagKey, userId);
  }

  /**
   * Get all flags without error handling.
   * Should trigger violation via instance tracking.
   */
  async getAllFlags(userId: string): Promise<Record<string, string | boolean>> {
    // should trigger violation — instance method without try-catch
    return await this.posthog.getAllFlags(userId);
  }
}

// ─── Module-level singleton ───────────────────────────────────────────────────

const posthogInstance = new PostHog('phc_module_key', {
  host: 'https://app.posthog.com',
});

/**
 * Uses module-level singleton without try-catch.
 * Should trigger violation.
 */
export async function getFeatureFlagFromSingleton(
  flagKey: string,
  userId: string,
): Promise<string | boolean | undefined> {
  // should trigger violation — module singleton, no try-catch
  return await posthogInstance.getFeatureFlag(flagKey, userId);
}

export { AnalyticsService };
