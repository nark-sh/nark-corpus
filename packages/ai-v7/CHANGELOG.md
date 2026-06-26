# CHANGELOG — ai-v7

## 2026-06-26 — deepened: allowSystemInMessages postconditions added

- **Deepened by:** deepen-stream-1 pass 5 (2026-06-26)
- **contract_version:** 1.0.0 → 1.1.0
- **coverage_score:** 0.94 → 0.96
- **New postconditions:**
  - `generate-text-system-message-in-messages-rejected` on `generateText()`: v7.0.0 (CHANGELOG 4e095b0) changed the default from allowing system-role messages in the messages array to rejecting them with InvalidPromptError. Common migration failure: chat apps that persisted the system prompt as `messages[0]` in v6. Evidence: source-confirmed from `ai/dist/index.js` lines 2446-2450.
  - `stream-text-system-message-in-messages-rejected` on `streamText()`: identical guard path as generateText — error thrown synchronously before any streaming begins. Callers who only catch errors at the stream consumer level will miss this.
- **Fixtures added:** `packages/ai-v7/fixtures/ground-truth.ts` — 10 annotated call sites covering SHOULD_FIRE and SHOULD_NOT_FIRE cases for both postconditions.
- **Concerns queued:** `concern-20260626-ai-v7-deepen-1` (generateText detection), `concern-20260626-ai-v7-deepen-2` (streamText detection)
- **Note:** The "open gap" from 2026-06-26 drift sweep (NoOutputGeneratedError for streamText) was investigated. The parent contract's `api-error-generic` postcondition covers unhandled streaming errors. The NoOutputGeneratedError is a subset of this and does not need a separate postcondition in the current schema.

## 2026-06-26 — re-verified clean

- **Latest published:** ai@7.0.2 (patch bump from 7.0.0)
- **Profile semver:** >=7.0.0 (unchanged)
- **Verdict:** no error-handling changes in 7.0.1 or 7.0.2
- **Open gap:** streamText NoOutputGeneratedError — v7 rejects result promises when stream ends without output; parent says streamText does not throw; ai-v7 should override this postcondition. Queued for bc-deepen-contract.
- **Verified by:** bc-version-drift (sweep 2026-06-26)
All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-25 — extends-fork created for v7+

- **Latest published:** ai@7.0.0
- **New profile:** `packages/ai-v7/contract.yaml` (extends `../ai/contract.yaml`)
- **Parent narrowed to:** already at `>=2.0.0 <7.0.0` — no change needed
- **Diverged postconditions overridden:** none — parent postconditions all valid in v7
- **New postconditions added:** `tool-context-schema-validation` (TypeValidationError from contextSchema validation, new in v7 CHANGELOG f319fde)
- **Fork rationale:** ai v7.0.0 adds runtime enforcement of tool contextSchema validation (f319fde). The change throws TypeValidationError when a tool's contextSchema is declared and the caller-supplied toolsContext fails validation. Previously this was silently skipped. The parent's remaining 14 function contracts are all valid in v7 — only this one new postcondition on tool() is v7-specific. Extends-fork is the correct shape: 1 new postcondition, 0 invalidated parent postconditions.
- **Verified by:** bc-version-drift (sweep 2026-06-25)
