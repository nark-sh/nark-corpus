/**
 * Ground-truth fixture for @anthropic-ai/claude-agent-sdk
 *
 * Annotations use the format:
 * // SHOULD_FIRE: <postcondition-id> — <reason>
 * // SHOULD_NOT_FIRE: <reason>
 *
 * Each annotation applies to the NEXT line (the call site detected by the scanner).
 * The V2 scanner detects violations on the `query({...})` CallExpression node.
 *
 * Scanner capability note: The scanner detects query() calls without try/catch.
 * It fires on the `query({...})` CallExpression regardless of whether the caller
 * uses `for await` or stores the result. The try/catch must wrap the query() call
 * itself (or the for-await loop that contains it) for the violation to be suppressed.
 */
import { query, unstable_v2_prompt, unstable_v2_createSession } from '@anthropic-ai/claude-agent-sdk';

async function noTryCatch(prompt: string): Promise<void> {
  // SHOULD_FIRE: query-abort-error — query() called in for-await without try/catch, AbortError propagates
  for await (const message of query({ prompt })) {
    console.log(message);
  }
}

async function withTryCatch(prompt: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: query() is inside try/catch that wraps the for-await loop
    for await (const message of query({ prompt })) {
      console.log(message);
    }
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return;
    }
    throw error;
  }
}

// ─── V2 API fixtures (unstable_v2_prompt, SDKSession) ───────────────────────

// --- V2 API fixtures (unstable_v2_prompt, SDKSession) ---
// NOTE: Scanner rules for V2 API not yet implemented.
// These are documented fixtures for future detection via bc-scanner-upgrade.
// Concerns queued: concern-20260417-claude-agent-sdk-deepen-8 through -10

// Demonstrates v2-prompt-result-error-unchecked + v2-prompt-no-try-catch violations
// (no scanner rules yet — proactive contract added via API surface analysis)
async function v2PromptMissingSubtypeCheck(): Promise<string> {
  const result = await unstable_v2_prompt('What is 2 + 2?', { model: 'claude-opus-4-7' });
  return (result as any).result; // silently undefined when subtype is 'error_*'
}

// Demonstrates proper pattern for unstable_v2_prompt()
async function v2PromptWithProperChecking(): Promise<string> {
  try {
    const result = await unstable_v2_prompt('What is 2 + 2?', { model: 'claude-opus-4-7' });
    if (result.subtype === 'success') {
      return result.result;
    } else {
      throw new Error(`Agent failed: ${result.errors.join(', ')}`);
    }
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error; // intentional abort
    }
    throw error;
  }
}

// Demonstrates v2-session-not-closed violation
// (no scanner rules yet — proactive contract added via API surface analysis)
async function v2SessionNotClosed(): Promise<void> {
  const session = unstable_v2_createSession({ model: 'claude-opus-4-7' });
  await session.send('Hello!');
  for await (const msg of session.stream()) {
    if (msg.type === 'result') break;
  }
  // Missing: session.close() or `await using`
}

// Demonstrates proper cleanup for SDKSession
async function v2SessionWithProperCleanup(): Promise<void> {
  const session = unstable_v2_createSession({ model: 'claude-opus-4-7' });
  try {
    await session.send('Hello!');
    for await (const msg of session.stream()) {
      if (msg.type === 'result') break;
    }
  } finally {
    session.close();
  }
}

// ---- deleteSession fixtures (added 2026-06-12 deepen pass) ----
import { deleteSession, importSessionToStore, resolveSettings } from '@anthropic-ai/claude-agent-sdk';

async function deleteSessionMissingTryCatch(sessionId: string): Promise<void> {
  // SHOULD_FIRE: delete-session-not-found — deleteSession() called without try/catch; throws if session is missing
  await deleteSession(sessionId);
}

async function deleteSessionWithProperGuard(sessionId: string): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: deleteSession() wrapped in try/catch that swallows "not found" as idempotent success
    await deleteSession(sessionId);
  } catch (err: any) {
    if (err?.message?.includes('not found')) {
      return; // idempotent — already gone
    }
    throw err;
  }
}

async function deleteSessionInvalidUuidUnchecked(rawId: unknown): Promise<void> {
  // SHOULD_FIRE: delete-session-invalid-uuid — caller passes through an untrusted id without UUID validation
  await deleteSession(rawId as string);
}

// ---- importSessionToStore fixtures ----
async function importSessionMissingTryCatch(sessionId: string, store: any): Promise<void> {
  // NOTE: import-session-partial-failure is contracted but the scanner only fires one
  //       postcondition per call site; the no-try-catch detector picks the source-missing
  //       variant. Detection of the partial-failure variant requires data-flow analysis
  //       across the batched store.append() loop — queued as concern-20260612-claude-agent-sdk-deepen-2.
  // SHOULD_FIRE: import-session-source-missing — no try/catch around the import
  await importSessionToStore(sessionId, store, { batchSize: 100 });
}

async function importSessionWithPartialFailureTracking(
  sessionIds: string[],
  store: any,
): Promise<{ migrated: string[]; partial: string[] }> {
  const migrated: string[] = [];
  const partial: string[] = [];
  for (const sessionId of sessionIds) {
    try {
      // SHOULD_NOT_FIRE: try/catch with partial-failure tracking
      await importSessionToStore(sessionId, store, { batchSize: 100 });
      migrated.push(sessionId);
    } catch (err: any) {
      partial.push(sessionId);
    }
  }
  return { migrated, partial };
}

// ---- resolveSettings fixtures ----
async function resolveSettingsMissingTryCatch(): Promise<unknown> {
  // SHOULD_FIRE: resolve-settings-subprocess-failure — no try/catch; spawn failure crashes startup
  const settings = await resolveSettings();
  return settings;
}

async function resolveSettingsWithFallback(): Promise<unknown> {
  try {
    // SHOULD_NOT_FIRE: try/catch with fallback to defaults
    return await resolveSettings();
  } catch (err) {
    return { permissions: {} }; // fallback defaults
  }
}

// Demonstrates security-bypass: caller reads defaultMode without filterEscalatingDefaultMode()
async function resolveSettingsUnfilteredDefaultMode(): Promise<string | undefined> {
  try {
    const resolved = await resolveSettings();
    // NOTE: resolve-settings-default-mode-not-filtered is contracted but requires a
    //       flow-sensitive detector that checks whether the resolved value was passed
    //       through filterEscalatingDefaultMode() before defaultMode is read. Queued as
    //       concern-20260612-claude-agent-sdk-deepen-4. Until that detector lands, this
    //       fixture documents the violating pattern but does not assert a scanner hit.
    return (resolved as any).permissions?.defaultMode;
  } catch {
    return undefined;
  }
}

// ---- session-inspection fixtures (added 2026-06-24 deepen pass) ----
import {
  listSessions,
  getSessionInfo,
  getSessionMessages,
  listSubagents,
  getSubagentMessages,
} from '@anthropic-ai/claude-agent-sdk';

async function listSessionsMissingTryCatch(store: any): Promise<unknown> {
  // SHOULD_FIRE: list-sessions-store-method-missing — sessionStore may lack listSessions method; no try/catch
  return await listSessions({ sessionStore: store, dir: process.cwd() });
}

async function listSessionsWithFeatureDetect(store: any): Promise<unknown> {
  if (typeof store.listSessions === 'function') {
    try {
      // SHOULD_NOT_FIRE: feature-detect plus try/catch — store-missing path handled
      return await listSessions({ sessionStore: store, dir: process.cwd() });
    } catch {
      return [];
    }
  }
  return [];
}

async function listSessionsEmptyUnchecked(): Promise<string> {
  // NOTE: list-sessions-empty-result-unchecked is contracted but requires a
  //       flow-sensitive detector that checks whether the returned array is
  //       guarded before being indexed. Queued as concern-20260624-claude-agent-sdk-deepen-1.
  //       Until that detector lands, this fixture documents the violating pattern
  //       but does not assert a scanner hit.
  const sessions = await listSessions({ limit: 1 });
  return (sessions as any)[0].sessionId;
}

async function getSessionInfoUndefinedUnchecked(sessionId: string): Promise<string> {
  // NOTE: get-session-info-undefined-unchecked is contracted but requires a
  //       flow-sensitive detector that checks whether the returned value is
  //       guarded against undefined before property access. Queued as
  //       concern-20260624-claude-agent-sdk-deepen-2.
  const info = await getSessionInfo(sessionId);
  return (info as any).summary;
}

async function getSessionInfoWithStoreNoTryCatch(sessionId: string, store: any): Promise<unknown> {
  // SHOULD_FIRE: get-session-info-store-load-failure — sessionStore.load() may reject; no try/catch
  return await getSessionInfo(sessionId, { sessionStore: store });
}

async function getSessionInfoStoreWithRetry(sessionId: string, store: any): Promise<unknown> {
  try {
    // SHOULD_NOT_FIRE: try/catch around store-backed lookup distinguishes transient vs absent
    const info = await getSessionInfo(sessionId, { sessionStore: store });
    return info ?? null;
  } catch (err) {
    console.error('Session lookup failed (transient):', err);
    throw err;
  }
}

async function getSessionMessagesEmptyVsThrownUnchecked(sessionId: string): Promise<unknown[]> {
  // SHOULD_FIRE: get-session-messages-empty-vs-thrown — corrupted JSONL can throw; no try/catch
  return await getSessionMessages(sessionId, { limit: 100 });
}

async function getSessionMessagesWithCorruptionGuard(sessionId: string): Promise<unknown[]> {
  try {
    // SHOULD_NOT_FIRE: try/catch around transcript read distinguishes empty vs unreadable
    return await getSessionMessages(sessionId, { limit: 100 });
  } catch (err) {
    console.error('Session transcript unreadable:', err);
    throw err;
  }
}

async function listSubagentsStoreMissingNoTryCatch(sessionId: string, store: any): Promise<string[]> {
  // SHOULD_FIRE: list-subagents-store-method-missing — sessionStore may lack listSubagents; no try/catch
  return await listSubagents(sessionId, { sessionStore: store });
}

async function listSubagentsWithFeatureDetect(sessionId: string, store: any): Promise<string[]> {
  try {
    // SHOULD_NOT_FIRE: try/catch around the store-backed listing
    return await listSubagents(sessionId, { sessionStore: store });
  } catch {
    return [];
  }
}

async function getSubagentMessagesEmptyVsThrownUnchecked(
  sessionId: string,
  agentId: string,
): Promise<unknown[]> {
  // SHOULD_FIRE: get-subagent-messages-empty-vs-thrown — corrupted JSONL can throw; no try/catch
  return await getSubagentMessages(sessionId, agentId);
}

async function getSubagentMessagesWithCorruptionGuard(
  sessionId: string,
  agentId: string,
): Promise<unknown[]> {
  try {
    // SHOULD_NOT_FIRE: try/catch around subagent transcript read
    return await getSubagentMessages(sessionId, agentId);
  } catch (err) {
    console.error('Subagent transcript unreadable:', err);
    throw err;
  }
}
