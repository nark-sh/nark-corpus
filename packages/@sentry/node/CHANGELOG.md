# CHANGELOG — @sentry/node

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** @sentry/node@10.58.0
- **Profile semver:** `>=7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @sentry/node@10.57.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — deepen pass — coverage 36% → 73%

- **Profile:** `packages/@sentry/node/contract.yaml`
- **Functions added:** startSpanManual, startInactiveSpan, withMonitor, captureCheckIn (4 total)
- **Postconditions added:** 7
  - startSpanManual: span-manual-finish-never-called, span-manual-callback-rethrows
  - startInactiveSpan: inactive-span-end-never-called
  - withMonitor: monitor-callback-rethrows, monitor-slug-not-configured
  - captureCheckIn: checkin-completion-missing
- **Functions intentionally omitted this pass:** withScope (scope utility, re-throws transparently, no distinct error contract), withIsolationScope (same), wrapMcpServerWithSentry (sync MCP wrapper, async contract covered by @modelcontextprotocol/sdk profile)
- **Scanner concerns queued:** 4 (`concern-20260611-sentry-node-deepen-1` through `-4`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://docs.sentry.io/platforms/javascript/guides/node/tracing/instrumentation/custom-instrumentation/
  - https://docs.sentry.io/platforms/javascript/guides/node/crons/
  - https://docs.sentry.io/platforms/javascript/guides/node/configuration/draining/
  - @sentry/core source: `build/cjs/tracing/trace.js`, `build/cjs/exports.js`, `build/cjs/asyncContext/stackStrategy.js`
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T20:25:00Z)

## 2026-06-10 — backfilled

- **Verified against:** @sentry/node@>=7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
