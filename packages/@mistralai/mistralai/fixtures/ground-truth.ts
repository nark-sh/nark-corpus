/**
 * Ground-truth fixture for @mistralai/mistralai.
 *
 * Annotations placed DIRECTLY before the violating call site.
 *
 * Postcondition IDs:
 *   complete-no-error-handling
 *   stream-no-error-handling
 */
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// ──────────────────────────────────────────────────
// 1. chat.complete — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_complete_missing(userMessage: string) {
  // SHOULD_FIRE: complete-no-error-handling — chat.complete without try-catch
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.choices?.[0]?.message?.content ?? '';
}

// 1. chat.complete — with try-catch (SHOULD_NOT_FIRE)
async function gt_complete_with_try_catch(userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: chat.complete has try-catch
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 1. chat.complete — with .catch() (SHOULD_NOT_FIRE)
async function gt_complete_with_catch_chain(userMessage: string) {
  // SHOULD_NOT_FIRE: chat.complete has .catch() handler
  const response = await client.chat
    .complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
  return response.choices?.[0]?.message?.content ?? '';
}

// ──────────────────────────────────────────────────
// 2. chat.stream — missing try-catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_stream_missing(userMessage: string) {
  // SHOULD_FIRE: stream-no-error-handling — chat.stream without try-catch
  const stream = await client.chat.stream({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: userMessage }],
  });
  return stream;
}

// 2. chat.stream — with try-catch (SHOULD_NOT_FIRE)
async function gt_stream_with_try_catch(userMessage: string) {
  try {
    // SHOULD_NOT_FIRE: chat.stream has try-catch
    const stream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    });
    return stream;
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// 2. chat.stream — with .catch() (SHOULD_NOT_FIRE) — pattern from cline
async function gt_stream_with_catch_chain(userMessage: string) {
  // SHOULD_NOT_FIRE: chat.stream has .catch() handler
  const stream = await client.chat
    .stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: userMessage }],
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
  return stream;
}
