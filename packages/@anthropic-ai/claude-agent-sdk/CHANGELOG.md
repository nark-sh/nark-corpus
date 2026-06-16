# CHANGELOG — @anthropic-ai/claude-agent-sdk

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** @anthropic-ai/claude-agent-sdk@0.3.178
- **Profile semver:** `>=0.1.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @anthropic-ai/claude-agent-sdk@0.3.177
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 69% → 75%

- **Profile:** `packages/@anthropic-ai/claude-agent-sdk/contract.yaml`
- **Functions added:** deleteSession, importSessionToStore, resolveSettings (3 total)
- **Postconditions added:** 6 (delete-session-not-found, delete-session-invalid-uuid, import-session-partial-failure, import-session-source-missing, resolve-settings-subprocess-failure, resolve-settings-default-mode-not-filtered)
- **Functions intentionally omitted this pass:**
  - bridge module (attachBridgeSession, createCodeSession, fetchRemoteCredentials): @alpha, CCR-only, narrow adoption
  - assistant module (runAssistantWorker): @alpha, claude.ai bridge daemon, narrow adoption
  - Query interface control methods (interrupt, setMcpServers, reconnectMcpServer, toggleMcpServer, setModel, etc): subsumed by query() postconditions — only callable on a Query handle already obtained via query()
- **Scanner concerns queued:** 4 (`concern-20260612-claude-agent-sdk-deepen-1` through `-4`)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.174/sdk.d.ts (read directly from installed types)
  - https://code.claude.com/docs/en/agent-sdk/sessions
  - https://code.claude.com/docs/en/agent-sdk/typescript
- **Notes:** Surface grew from 13 (v0.2.91) → 16 (v0.3.174) async-callable functions. The 0.3.x line introduced deleteSession, importSessionToStore, resolveSettings as top-level exports. Key security finding: resolveSettings() returns `permissions.defaultMode` as-is across all settings tiers including project — callers MUST pass the result through `filterEscalatingDefaultMode()` before honoring escalating modes (`bypassPermissions`, `auto`, `acceptEdits`), otherwise a repo-committed `.claude/settings.json` can silently elevate permissions (SECURITY_RISK). This is explicitly documented in sdk.d.ts lines 2546-2550. importSessionToStore() has a DATA_LOSS pattern: batches are appended one at a time so mid-import failure leaves partial state in the destination store; naive retry corrupts the transcript. All 189 corpus contracts validate.
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T01:38:00Z, deepen-stream-2)

## 2026-04-17 — backfilled

- **Verified against:** @anthropic-ai/claude-agent-sdk@>=0.1.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
