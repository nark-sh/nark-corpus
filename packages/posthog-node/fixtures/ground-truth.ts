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
 *   - getAllFlagsAndPayloads: postcondition get-all-flags-and-payloads-network-error — requires try-catch
 *   - getFeatureFlagPayload: postcondition get-feature-flag-payload-network-error — requires try-catch
 *   - getFeatureFlagResult: postcondition get-feature-flag-result-network-error — requires try-catch
 *   - flush: postcondition flush-network-error — warning, try-catch recommended
 *   - shutdown: postcondition shutdown-timeout-error — warning, try-catch recommended
 *   - getRemoteConfigPayload: postconditions get-remote-config-missing-personal-api-key
 *                             and get-remote-config-network-error — requires try-catch
 *
 * Fire-and-forget methods (capture, identify, alias, groupIdentify, captureImmediate,
 * identifyImmediate, aliasImmediate) are intentionally NOT contracted — they never
 * propagate errors to the caller by design.
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. getAllFlagsAndPayloads
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-all-flags-and-payloads-network-error
export async function getAllFlagsAndPayloadsNoCatch() {
  // SHOULD_FIRE: get-all-flags-and-payloads-network-error — network call without try-catch
  const { featureFlags, featureFlagPayloads } = await posthog.getAllFlagsAndPayloads(userId);
  return { featureFlags, featureFlagPayloads };
}

// @expect-clean
export async function getAllFlagsAndPayloadsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: get-all-flags-and-payloads-network-error — wrapped in try-catch
    const { featureFlags, featureFlagPayloads } = await posthog.getAllFlagsAndPayloads(userId, {
      personProperties: { plan: 'enterprise' },
    });
    return { featureFlags, featureFlagPayloads };
  } catch (err) {
    console.error('getAllFlagsAndPayloads failed:', err);
    return { featureFlags: {}, featureFlagPayloads: {} };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. getFeatureFlagPayload
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-feature-flag-payload-network-error
export async function getFeatureFlagPayloadNoCatch() {
  // SHOULD_FIRE: get-feature-flag-payload-network-error — network call without try-catch
  const payload = await posthog.getFeatureFlagPayload('ui-config', userId);
  return payload;
}

// @expect-clean
export async function getFeatureFlagPayloadWithCatch() {
  try {
    // SHOULD_NOT_FIRE: get-feature-flag-payload-network-error — wrapped in try-catch
    const payload = await posthog.getFeatureFlagPayload('ui-config', userId);
    return payload ?? null;
  } catch (err) {
    console.error('getFeatureFlagPayload failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. getFeatureFlagResult
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-feature-flag-result-network-error
export async function getFeatureFlagResultNoCatch() {
  // SHOULD_FIRE: get-feature-flag-result-network-error — network call without try-catch
  const result = await posthog.getFeatureFlagResult('checkout-v2', userId);
  return result;
}

// @expect-clean
export async function getFeatureFlagResultWithCatch() {
  try {
    // SHOULD_NOT_FIRE: get-feature-flag-result-network-error — wrapped in try-catch
    const result = await posthog.getFeatureFlagResult('checkout-v2', userId);
    return result;
  } catch (err) {
    console.error('getFeatureFlagResult failed:', err);
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. flush
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: flush-network-error
export async function flushNoCatch() {
  // SHOULD_FIRE: flush-network-error — flush makes network calls and can throw, no try-catch
  await posthog.flush();
}

// @expect-clean
export async function flushWithCatch() {
  try {
    // SHOULD_NOT_FIRE: flush-network-error — wrapped in try-catch
    await posthog.flush();
  } catch (err) {
    console.error('PostHog flush failed, events may be lost:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. getRemoteConfigPayload
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: get-remote-config-missing-personal-api-key
// @expect-violation: get-remote-config-network-error
export async function getRemoteConfigPayloadNoCatch() {
  // SHOULD_FIRE: get-remote-config-missing-personal-api-key + get-remote-config-network-error
  // — getRemoteConfigPayload throws synchronously without personalApiKey, or on network failure
  const config = await posthog.getRemoteConfigPayload('server-config');
  return config;
}

// @expect-clean
export async function getRemoteConfigPayloadWithCatch() {
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch handles both sync throw and async rejection
    const config = await posthog.getRemoteConfigPayload('server-config');
    return config ?? null;
  } catch (err) {
    console.error('getRemoteConfigPayload failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Fire-and-forget async methods — should NEVER fire (not contracted)
// ─────────────────────────────────────────────────────────────────────────────

export async function captureImmediateNoCatch() {
  // SHOULD_NOT_FIRE: captureImmediate catches errors internally, never propagates to caller
  await posthog.captureImmediate({
    distinctId: userId,
    event: 'payment_completed',
    properties: { amount: 99.99 },
  });
}

export async function reloadFeatureFlagsNoCatch() {
  // SHOULD_NOT_FIRE: reloadFeatureFlags swallows errors internally via .catch() in loadFeatureFlags()
  await posthog.reloadFeatureFlags();
}

export async function waitForLocalEvaluationReadyNoCatch() {
  // SHOULD_NOT_FIRE: waitForLocalEvaluationReady returns false on timeout (not throw)
  const ready = await posthog.waitForLocalEvaluationReady(5000);
  return ready;
}
