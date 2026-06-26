/**
 * ai-v7 (Vercel AI SDK v7) Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the ai-v7 contract spec (which extends packages/ai/contract.yaml).
 *
 * This fixture file covers ONLY the postconditions ADDED by ai-v7 (v7-specific changes).
 * Postconditions inherited from the parent ai profile are covered in packages/ai/fixtures/ground-truth.ts.
 *
 * Contracted functions covered here:
 *   - generateText()  postcondition: generate-text-system-message-in-messages-rejected
 *   - streamText()    postcondition: stream-text-system-message-in-messages-rejected
 *   - tool()          postcondition: tool-context-schema-validation (added v7.0.0, CHANGELOG f319fde)
 *
 * v7 breaking change source:
 *   ai/dist/index.js lines 2446-2450 (v7.0.2, confirmed):
 *     if (!allowSystemInMessages && messages.some((message) => message.role === "system")) {
 *       throw new InvalidPromptError2({ ... })
 *     }
 *   Migration guide: https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0
 *
 * Note on analyzer coverage:
 *   The v7 system-message check fires BEFORE any API call — it's a synchronous guard
 *   executed at the top of generateText/streamText. The scanner should detect the
 *   pattern: messages array argument contains a literal { role: 'system' } entry and
 *   allowSystemInMessages option is absent or false.
 */

import { generateText, streamText, tool } from 'ai';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// 1. generateText() — v7 allowSystemInMessages: false default
// ─────────────────────────────────────────────────────────────────────────────

export async function generateTextSystemMessageInMessages() {
  // SHOULD_FIRE: generate-text-system-message-in-messages-rejected
  // messages array contains { role: 'system' } and allowSystemInMessages is not true.
  // Common v6->v7 migration bug: persisted chat history stored system prompt as first message.
  const result = await generateText({
    model: {} as any,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' },
    ],
  });
  return result.text;
}

export async function generateTextSystemMessageInMessagesWithCatch() {
  // SHOULD_FIRE: generate-text-system-message-in-messages-rejected
  // NOTE: The error is thrown synchronously before any network call.
  // A try-catch handles it correctly at runtime but the postcondition still fires
  // because the caller has not migrated away from the v7-deprecated pattern.
  // Required_handling: use `instructions` option or set allowSystemInMessages: true.
  try {
    const result = await generateText({
      model: {} as any,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ],
    });
    return result.text;
  } catch (error) {
    // Catches InvalidPromptError at runtime, but this is the wrong mitigation.
    // Correct fix: use `instructions` param or set allowSystemInMessages: true.
    throw error;
  }
}

export async function generateTextSystemMessageAllowedExplicitly() {
  // SHOULD_NOT_FIRE: allowSystemInMessages: true opts back into v6 behavior.
  // Safe ONLY when messages come from a trusted server-side source (not user input).
  const result = await generateText({
    model: {} as any,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ],
    allowSystemInMessages: true,
  });
  return result.text;
}

export async function generateTextWithInstructionsOption() {
  // SHOULD_NOT_FIRE: canonical v7 pattern — system prompt via `instructions` option, not messages.
  // This is the recommended migration path from v6.
  const result = await generateText({
    model: {} as any,
    system: 'You are a helpful assistant.',
    messages: [{ role: 'user', content: 'Hello' }],
  });
  return result.text;
}

export async function generateTextNoSystemMessage() {
  // SHOULD_NOT_FIRE: no system-role entry in messages array — not affected by v7 change.
  const result = await generateText({
    model: {} as any,
    messages: [
      { role: 'user', content: 'What is 2+2?' },
      { role: 'assistant', content: '4' },
      { role: 'user', content: 'And 3+3?' },
    ],
  });
  return result.text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. streamText() — v7 allowSystemInMessages: false default
//    Identical guard path as generateText (same source location in ai/dist/index.js).
// ─────────────────────────────────────────────────────────────────────────────

export async function streamTextSystemMessageInMessages() {
  // SHOULD_FIRE: stream-text-system-message-in-messages-rejected
  // Error is thrown synchronously BEFORE any chunk is emitted.
  // A try-catch at the chunk-consumer level will NOT catch this.
  const result = streamText({
    model: {} as any,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ],
  });
  return result;
}

export async function streamTextSystemMessageInMessagesWithCatch() {
  // SHOULD_FIRE: stream-text-system-message-in-messages-rejected
  // The try-catch correctly wraps the streamText() CALL (not just the consumer),
  // so InvalidPromptError is caught — but this is still the deprecated v7 pattern.
  // Required fix: migrate system prompt to `instructions` or add allowSystemInMessages: true.
  try {
    const result = streamText({
      model: {} as any,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ],
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function streamTextSystemMessageAllowedExplicitly() {
  // SHOULD_NOT_FIRE: allowSystemInMessages: true opts back into v6 behavior.
  const result = streamText({
    model: {} as any,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ],
    allowSystemInMessages: true,
  });
  return result;
}

export async function streamTextWithSystemOption() {
  // SHOULD_NOT_FIRE: `system` top-level param — this is NOT a messages-array system entry.
  // The v7 guard only fires for messages[].role === 'system', not the `system` param.
  const result = streamText({
    model: {} as any,
    system: 'You are a helpful assistant.',
    messages: [{ role: 'user', content: 'Hello' }],
  });
  return result;
}

export async function streamTextNoSystemMessage() {
  // SHOULD_NOT_FIRE: no system-role entry in messages — not affected by v7 change.
  const result = streamText({
    model: {} as any,
    messages: [
      { role: 'user', content: 'What is 2+2?' },
    ],
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. tool() — v7 contextSchema runtime validation
//    CHANGELOG f319fde: contextSchema now validated at runtime (was silently skipped in v6).
// ─────────────────────────────────────────────────────────────────────────────

const weatherContextSchema = z.object({
  userId: z.string(),
  locale: z.string(),
});

// Note: tool() itself is synchronous — TypeValidationError is thrown when the
// tool is CALLED via generateText/streamText with an invalid toolsContext.
// These fixtures demonstrate the tool DEFINITION — scanner concern queued in
// upgrade-concerns.json to handle the cross-function detection pattern.

export const weatherToolWithContextSchema = tool({
  description: 'Get weather for a location',
  parameters: z.object({ location: z.string() }),
  contextSchema: weatherContextSchema,
  execute: async ({ location }, { context }) => {
    // context is typed as { userId: string; locale: string } — validated at runtime in v7
    return `Weather in ${location} for user ${(context as any).userId}`;
  },
});

export const weatherToolWithoutContextSchema = tool({
  description: 'Get weather for a location (no context schema)',
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    return `Weather in ${location}`;
  },
});
