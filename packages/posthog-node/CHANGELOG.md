# CHANGELOG — posthog-node

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (drift mode, +1 function)

- **Profile:** `packages/posthog-node/contract.yaml`
- **Installed version inspected:** posthog-node@5.38.4 (was 5.x at 2026-04-17 deepen pass)
- **Functions added:** evaluateFlags (1 total)
- **Postconditions added:** 2 (evaluate-flags-network-error, evaluate-flags-quota-limited-silent)
- **Functions intentionally omitted this pass:** fetch (marked @internal in client.d.ts), prepareEventMessage (undocumented, no JSDoc / error semantics), _shutdown (private underscore-prefixed impl of shutdown()).
- **Scanner concerns queued:** 2 (`concern-20260624-posthog-node-deepen-1`, `concern-20260624-posthog-node-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Drift findings:** posthog-node@5.38+ added evaluateFlags() as the canonical replacement for getFeatureFlag / isFeatureEnabled / getFeatureFlagPayload (all three now @deprecated and emit one-shot console deprecation warnings recommending evaluateFlags). The deprecated single-flag methods still ship at 5.38.4 — the new function entry is additive. evaluateFlags() internally calls super.getFeatureFlagDetailsStateless() (same network path as the @deprecated methods) so the network-error postcondition mirrors the existing getFeatureFlag/getAllFlags shape. The new quota-limited-silent postcondition is unique to evaluateFlags() — the returned snapshot carries a .quotaLimited boolean that callers must check before trusting .isEnabled() / .getFlag() reads. contract_version bumped 1.0.0 → 1.1.0.
- **Sources fetched:** `/private/tmp/claude/bc-deepen/posthog-node/node_modules/posthog-node/dist/client.d.ts` (lines 810-811, evaluateFlags signature), `dist/client.js` (lines 559-668, evaluateFlags impl; lines 445, 455, 484, deprecation warnings; line 615, quotaLimited propagation). Reference docs: https://posthog.com/docs/libraries/node
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T08:41:14Z, deepen-stream-2 pass 68)

## 2026-06-18 — re-verified clean

- **Latest published:** posthog-node@5.38.1
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** posthog-node@5.38.0
- **Profile semver:** >=3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** posthog-node@5.38.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** posthog-node@5.37.1
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** posthog-node@5.37.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** posthog-node@>=3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
