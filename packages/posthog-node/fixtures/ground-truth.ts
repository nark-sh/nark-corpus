/**
 * posthog-node Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the posthog-node contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - getFeatureFlag: postcondition network-error — requires try-catch
 *   - isFeatureEnabled: postcondition network-error — requires try-catch
 *   - getAllFlags: postcondition network-error — requires try-catch
 *   - shutdown: postcondition flush-error — warning, try-catch recommended
 *
 * Fire-and-forget methods (capture, identify, alias, groupIdentify) are
 * intentionally NOT contracted — they never throw by design.
 */

import { PostHog } from 'posthog-node';

const posthog = new PostHog('phc_test_key', { host: 'https://app.posthog.com' });
const userId = 'user-123';

// ─────────────────────────────────────────────────────────────────────────────
// 1. getFeatureFlag
// ─────────────────────────────────────────────────────────────────────────────

export async function getFeatureFlagNoCatch() {
  // SHOULD_FIRE: network-error — getFeatureFlag makes a network call and can reject, no try-catch
  const flag = await posthog.getFeatureFlag('my-flag', userId);
  return flag;
}

export async function getFeatureFlagWithCatch() {
  try {
    // SHOULD_NOT_FIRE: network-error — getFeatureFlag inside try-catch satisfies requirement
    const flag = await posthog.getFeatureFlag('my-flag', userId);
    return flag;
  } catch (err) {
    console.error('Feature flag failed:', err);
    return undefined;
  }
}

export async function getFeatureFlagTryFinallyNoCatch() {
  try {
    // SHOULD_FIRE: network-error — try-finally has no catch clause, errors propagate
    const flag = await posthog.getFeatureFlag('my-flag', userId);
    return flag;
  } finally {
    console.log('cleanup');
  }
}

export async function getFeatureFlagWithPromiseCatch() {
  // SHOULD_NOT_FIRE: network-error — .catch() chain handles the rejection
  const flag = await posthog.getFeatureFlag('my-flag', userId).catch(() => undefined);
  return flag;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. isFeatureEnabled
// ─────────────────────────────────────────────────────────────────────────────

export async function isFeatureEnabledNoCatch() {
  // SHOULD_FIRE: network-error — isFeatureEnabled makes a network call, no try-catch
  const enabled = await posthog.isFeatureEnabled('beta-ui', userId);
  return enabled;
}

export async function isFeatureEnabledWithCatch() {
  try {
    // SHOULD_NOT_FIRE: network-error — inside try-catch
    const enabled = await posthog.isFeatureEnabled('beta-ui', userId);
    return enabled ?? false;
  } catch (err) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. getAllFlags
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllFlagsNoCatch() {
  // SHOULD_FIRE: network-error — getAllFlags makes a network call, no try-catch (real-world pattern from n8n)
  return await posthog.getAllFlags(userId);
}

export async function getAllFlagsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: network-error — getAllFlags inside try-catch
    return await posthog.getAllFlags(userId, {
      personProperties: { plan: 'pro' },
    });
  } catch (err) {
    console.error('getAllFlags failed:', err);
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Fire-and-forget methods — should NEVER fire (not contracted)
// ─────────────────────────────────────────────────────────────────────────────

export function captureEvent() {
  // SHOULD_NOT_FIRE: capture is fire-and-forget, never throws, not contracted
  posthog.capture({
    distinctId: userId,
    event: 'page_viewed',
    properties: { page: '/dashboard' },
  });
}

export function identifyUser() {
  // SHOULD_NOT_FIRE: identify is fire-and-forget, never throws, not contracted
  posthog.identify({
    distinctId: userId,
    properties: { email: 'user@example.com' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Instance-based usage
// ─────────────────────────────────────────────────────────────────────────────

class PostHogService {
  private client: PostHog;

  constructor() {
    this.client = new PostHog('phc_service_key', {
      host: 'https://app.posthog.com',
    });
  }

  async getFlagsNoCatch(userId: string) {
    // SHOULD_FIRE: network-error — instance.getAllFlags without try-catch
    return await this.client.getAllFlags(userId);
  }

  async getFlagsWithCatch(userId: string) {
    try {
      // SHOULD_NOT_FIRE: network-error — instance.getAllFlags inside try-catch
      return await this.client.getAllFlags(userId);
    } catch (err) {
      return {};
    }
  }

  async checkFlagNoCatch(flagKey: string, userId: string) {
    // SHOULD_FIRE: network-error — instance.isFeatureEnabled without try-catch
    return await this.client.isFeatureEnabled(flagKey, userId);
  }
}

export { PostHogService };
