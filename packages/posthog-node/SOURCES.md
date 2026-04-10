# Sources — posthog-node

All behavioral claims in `contract.yaml` are documented here with direct references.

---

## Official Documentation

### PostHog Node.js SDK Guide
**URL:** https://posthog.com/docs/libraries/node
**Covers:**
- All method signatures: `capture`, `identify`, `getFeatureFlag`, `isFeatureEnabled`, `getAllFlags`, `shutdown`
- Fire-and-forget design of `capture`/`identify`: "The SDK does not throw errors for things happening in the background to ensure it doesn't affect your process."
- Async nature of feature flag methods
- `shutdown()` async behavior

### PostHog SDK Reference
**URL:** https://posthog.com/docs/references/posthog-node
**Covers:**
- Full API reference with TypeScript signatures
- Return types for all methods
- Options parameters

### Feature Flags Guide
**URL:** https://posthog.com/docs/feature-flags/bootstrapping-and-local-evaluation
**Covers:**
- `getFeatureFlag`, `isFeatureEnabled`, `getAllFlags` make network calls
- Error handling recommendations for feature flag evaluation
- Local evaluation option (still requires initial network call for flag definitions)

### Error Tracking
**URL:** https://posthog.com/docs/error-tracking/capture
**Covers:**
- `captureException()` method behavior
- Exception schema requirements

---

## GitHub Repository

### posthog-js-lite (Node SDK source)
**URL:** https://github.com/PostHog/posthog-js-lite/tree/main/posthog-node
**Evidence:**
- Source code confirms async nature of `getFeatureFlag`, `isFeatureEnabled`, `getAllFlags`
- `shutdown()` implementation shows async flush behavior

---

## Real-World Evidence

### n8n — getAllFlags without try-catch (True Positive)
**Stars:** >90,000 GitHub stars
**File:** `packages/cli/src/posthog/index.ts`
**Pattern:**
```typescript
return await this.postHog.getAllFlags(fullId, {
  personProperties: { created_at_timestamp: user.createdAt.getTime().toString() },
});
```
No try-catch. If PostHog API is unreachable, this rejects and the error propagates to callers.
**Evidence quality:** partial (>1k stars, confirmed anti-pattern)

---

## TODO: Additional Real-World Evidence Needed

To upgrade `evidence_quality` from `partial` to `confirmed`, find repos that use `getFeatureFlag` or `isFeatureEnabled` directly (not just `capture`/`identify`). The repos scanned so far mostly use posthog-node for telemetry events only — the feature flag surface has limited real-world coverage.

**High-value targets to find:**
- SaaS apps with feature flag gating (A/B test rollouts, beta access)
- Next.js apps using PostHog feature flags for server-side rendering decisions
- Search GitHub for: `posthog-node getFeatureFlag` or `isFeatureEnabled` in TypeScript files

**Confirmed repos using only capture/identify (no feature flag calls to analyze):**
- documenso, trigger.dev, hoppscotch, medusa — telemetry-only usage

---

## Security Advisories

### Shai-Hulud 2.0 Supply Chain Attack (November 2025)
**URL:** https://posthog.com/blog/nov-24-shai-hulud-attack-post-mortem
**Relevance:** Package integrity (supply chain), not behavioral contracts.
**Action:** Use posthog-node >=5.25.0 or verify package integrity.
