# CHANGELOG — ai-v7

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-25 — extends-fork created for v7+

- **Latest published:** ai@7.0.0
- **New profile:** `packages/ai-v7/contract.yaml` (extends `../ai/contract.yaml`)
- **Parent narrowed to:** already at `>=2.0.0 <7.0.0` — no change needed
- **Diverged postconditions overridden:** none — parent postconditions all valid in v7
- **New postconditions added:** `tool-context-schema-validation` (TypeValidationError from contextSchema validation, new in v7 CHANGELOG f319fde)
- **Fork rationale:** ai v7.0.0 adds runtime enforcement of tool contextSchema validation (f319fde). The change throws TypeValidationError when a tool's contextSchema is declared and the caller-supplied toolsContext fails validation. Previously this was silently skipped. The parent's remaining 14 function contracts are all valid in v7 — only this one new postcondition on tool() is v7-specific. Extends-fork is the correct shape: 1 new postcondition, 0 invalidated parent postconditions.
- **Verified by:** bc-version-drift (sweep 2026-06-25)
