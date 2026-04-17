/**
 * p-queue Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs:
 *   - add-unhandled-rejection
 *   - addall-unhandled-rejection
 *   - addall-partial-failure-background-tasks
 *   - onidle-resolves-once
 *   - onidle-paused-queue-hangs
 *   - onerror-does-not-replace-add-catch
 *   - onerror-never-resolves-hangs
 *   - onempty-not-all-done
 *   - onsizelessthan-excludes-pending
 *
 * Key rules:
 *   - await queue.add() without try-catch → SHOULD_FIRE
 *   - await queue.add() inside try-catch → SHOULD_NOT_FIRE
 *   - queue.add().catch() → SHOULD_NOT_FIRE (has .catch())
 *   - await queue.addAll() without try-catch → SHOULD_FIRE
 *   - await queue.onIdle() in paused queue without timeout → SHOULD_FIRE
 *   - await queue.onError() without Promise.race → SHOULD_FIRE
 *   - await queue.onEmpty() as "all done" signal → SHOULD_FIRE
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

// ─── 5. queue.addAll() — no try-catch ────────────────────────────────────────

// @expect-violation: addall-unhandled-rejection
export async function addAllWithoutCatch(items: string[]) {
  // If any task throws, the entire addAll() promise rejects unhandled
  // SHOULD_FIRE: addall-unhandled-rejection — await addAll() without try-catch
  await queue.addAll(items.map(item => async () => {
    if (!item) throw new Error('empty item');
    return item;
  }));
}

// ─── 6. queue.addAll() — inside try-catch ────────────────────────────────────

// @expect-clean
export async function addAllWithCatch(items: string[]) {
  // SHOULD_NOT_FIRE: addAll() inside try-catch — rejection is handled
  try {
    await queue.addAll(items.map(item => async () => {
      return item.toUpperCase();
    }));
  } catch (error) {
    console.error('batch failed:', error);
    throw error;
  }
}

// ─── 7. onError() awaited directly — hangs forever in success case ───────────

// @expect-clean (detection not implemented — behavioral pattern requires Promise.race context analysis)
export async function onErrorAwaitedDirectly() {
  const q = new PQueue({ concurrency: 2 });
  // hangs forever if no task ever errors. Must use Promise.race.
  q.add(async () => 'ok').catch(() => {});
  // Detection not implemented: requires Promise.race context analysis (no throws/returns field)
  await q.onError(); // never resolves if tasks succeed
}

// ─── 8. onError() used with Promise.race — correct ───────────────────────────

// @expect-clean
export async function onErrorWithPromiseRace() {
  const q = new PQueue({ concurrency: 2 });
  // SHOULD_NOT_FIRE: correct usage — race against onIdle for fail-fast pattern
  q.add(async () => 'task1').catch(() => {});
  q.add(async () => 'task2').catch(() => {});
  try {
    await Promise.race([q.onError(), q.onIdle()]);
  } catch (error) {
    q.pause();
    console.error('Queue failed:', error);
  }
}

// ─── 9. onEmpty() misused as "all done" signal ───────────────────────────────

// @expect-clean (detection not implemented — behavioral pattern, no throws/returns field)
export async function onEmptyMisusedasDoneSignal() {
  const q = new PQueue({ concurrency: 3 });
  // NOT when all executing tasks finish. Tasks in q.pending still run after this.
  // Each add() has .catch() so no add-unhandled-rejection fires
  q.add(async () => {
    await new Promise(r => setTimeout(r, 100));
    return 'result1';
  }).catch((err) => console.error(err));
  q.add(async () => {
    await new Promise(r => setTimeout(r, 200));
    return 'result2';
  }).catch((err) => console.error(err));
  // Detection not implemented: requires semantic analysis of "all done" vs "queue empty" (no throws/returns field)
  await q.onEmpty(); // queue is empty but tasks are still executing!
  // proceeding here while tasks are still running
}

// ─── 10. onIdle() used correctly as shutdown signal ──────────────────────────

// @expect-clean
export async function onIdleShutdown() {
  const q = new PQueue({ concurrency: 2 });
  // SHOULD_NOT_FIRE: onIdle() correctly waits for ALL tasks (queued + running)
  // Each add() has error handling so no add-unhandled-rejection fires
  q.add(async () => 'task1').catch((err) => console.error(err));
  q.add(async () => 'task2').catch((err) => console.error(err));
  await q.onIdle(); // resolves when size === 0 AND pending === 0
  // safe to proceed — all work is done
}

// ─── 11. onSizeLessThan backpressure — misuse counting total work ─────────────

// @expect-violation: onsizelessthan-excludes-pending
export async function onSizeLessThanMisusedForTotalWork() {
  const q = new PQueue({ concurrency: 5 });
  // SHOULD_FIRE: onSizeLessThan-does-not-include-pending
  // Caller expects no more than 5 items total (queued + running), but
  // onSizeLessThan only checks queue.size — up to 5 more tasks may be
  // running concurrently (q.pending), allowing 10 simultaneous tasks.
  for (let i = 0; i < 100; i++) {
    await q.onSizeLessThan(5); // only checks waiting queue, not running tasks
    q.add(async () => {
      await new Promise(r => setTimeout(r, 50));
    }).catch((err) => console.error(err)); // suppress add rejection — violation is about onSizeLessThan semantics
  }
}
