/**
 * p-queue Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: add-unhandled-rejection
 *
 * Key rules:
 *   - await queue.add() without try-catch → SHOULD_FIRE
 *   - await queue.add() inside try-catch → SHOULD_NOT_FIRE
 *   - queue.add().catch() → SHOULD_NOT_FIRE (has .catch())
 */

import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 2 });

// ─── 1. await queue.add() — no try-catch ──────────────────────────────────────

export async function addWithoutCatch() {
  // SHOULD_FIRE: add-unhandled-rejection — await queue.add() with no try-catch
  await queue.add(async () => {
    throw new Error('task error');
  });
}

// ─── 2. await queue.add() — inside try-catch ─────────────────────────────────

export async function addWithCatch() {
  try {
    // SHOULD_NOT_FIRE: await queue.add() inside try-catch — handled
    await queue.add(async () => {
      return 'result';
    });
  } catch (error) {
    throw error;
  }
}

// ─── 3. queue.add() without await or .catch() ────────────────────────────────

export function addFireAndForget() {
  // SHOULD_FIRE: add-unhandled-rejection — no await, no .catch() on returned Promise
  queue.add(async () => {
    return 'result';
  });
}

// ─── 4. queue.add().catch() ───────────────────────────────────────────────────

export function addWithChainedCatch() {
  // SHOULD_NOT_FIRE: .catch() on returned Promise handles rejection
  queue.add(async () => {
    return 'result';
  }).catch((error) => {
    console.error('task error:', error);
  });
}
