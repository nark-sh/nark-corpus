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
 *   - onpendingzero-ignores-queued-tasks
 *   - onpendingzero-resolves-immediately-when-no-running-tasks
 *   - onratelimit-no-intervalcap-never-resolves         (added pass 9, 2026-06-23)
 *   - onratelimit-resolves-immediately-misses-transition (added pass 9, 2026-06-23)
 *   - onratelimitcleared-paused-queue-hangs              (added pass 9, 2026-06-23)
 *   - onratelimitcleared-resolves-immediately-when-not-rate-limited (added pass 9, 2026-06-23)
 *
 * Key rules:
 *   - await queue.add() without try-catch → SHOULD_FIRE
 *   - await queue.add() inside try-catch → SHOULD_NOT_FIRE
 *   - queue.add().catch() → SHOULD_NOT_FIRE (has .catch())
 *   - await queue.addAll() without try-catch → SHOULD_FIRE
 *   - await queue.onIdle() in paused queue without timeout → SHOULD_FIRE
 *   - await queue.onError() without Promise.race → SHOULD_FIRE
 *   - await queue.onEmpty() as "all done" signal → SHOULD_FIRE
 *   - await queue.onPendingZero() used as "all work done" signal → SHOULD_FIRE (behavioral)
 *   - await queue.onRateLimit() on queue without intervalCap → SHOULD_FIRE (behavioral)
 *   - await queue.onRateLimitCleared() on paused queue → SHOULD_FIRE (behavioral)
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

// ─── 12. onPendingZero() misused as "all work done" signal ────────────────────

// @expect-violation: onpendingzero-ignores-queued-tasks
export async function onPendingZeroMisusedAsAllDoneSignal() {
  const q = new PQueue({ concurrency: 2 });
  // Add many tasks to the queue — they will start running up to concurrency limit
  for (let i = 0; i < 10; i++) {
    q.add(async () => {
      await new Promise(r => setTimeout(r, 50));
      return i;
    }).catch((err) => console.error(err));
  }
  // SHOULD_FIRE: onpendingzero-ignores-queued-tasks
  // Caller expects all 10 tasks to be done, but onPendingZero() resolves when
  // queue.pending === 0 — the 8 remaining queued tasks (not yet started) are ignored.
  // This is the same mistake as using onEmpty() instead of onIdle().
  await q.onPendingZero(); // resolves after first 2 tasks complete — 8 tasks still queued!
  // proceed assuming all work is done — but it's not
}

// ─── 13. onPendingZero() used correctly with pause() ─────────────────────────

// @expect-clean
export async function onPendingZeroCorrectUsageWithPause() {
  const q = new PQueue({ concurrency: 2 });
  // Start some tasks
  q.add(async () => {
    await new Promise(r => setTimeout(r, 50));
    return 'task1';
  }).catch((err) => console.error(err));
  q.add(async () => {
    await new Promise(r => setTimeout(r, 50));
    return 'task2';
  }).catch((err) => console.error(err));

  // Pause the queue before draining in-flight tasks
  q.pause();
  // SHOULD_NOT_FIRE: correct use — pause first, then drain in-flight tasks only
  // We explicitly want to drain pending tasks while keeping queued tasks paused
  await q.onPendingZero();
  // All running tasks finished — safe to mutate shared state
  // Queued tasks are still waiting (intentionally held by pause)
}

// ─── 14. onPendingZero() resolves immediately when no tasks running ───────────

// @expect-violation: onpendingzero-resolves-immediately-when-no-running-tasks
export async function onPendingZeroCalledWhenQueuePausedNotStarted() {
  const q = new PQueue({ concurrency: 2, autoStart: false });
  // Add tasks to a paused queue — they are queued but never run (autoStart: false)
  q.add(async () => 'task1').catch((err) => console.error(err));
  q.add(async () => 'task2').catch((err) => console.error(err));
  q.add(async () => 'task3').catch((err) => console.error(err));
  // SHOULD_FIRE: onpendingzero-resolves-immediately-when-no-running-tasks
  // q.pending === 0 (no tasks have started), so this resolves immediately
  // even though q.size === 3 (3 tasks are waiting to run)
  await q.onPendingZero(); // resolves immediately — nothing is running
  // caller mistakenly thinks all 3 tasks finished, but they never ran
}

// ─── 15. onRateLimit() on queue WITHOUT intervalCap — hangs forever ──────────

// @expect-clean (detection not implemented — requires construction-options tracking on PQueue receiver)
export async function onRateLimitWithoutIntervalCapHangs() {
  const q = new PQueue({ concurrency: 5 });   // no intervalCap, no interval
  q.add(async () => 'task1').catch(() => {});
  q.add(async () => 'task2').catch(() => {});
  // Behavioral violation: queue can NEVER enter rate-limited state without intervalCap,
  // so this awaits indefinitely with no timeout. Detection requires tracking the
  // constructor options on the PQueue instance — concern-20260623-p-queue-deepen-1.
  await q.onRateLimit();
  // caller never reaches this line — silent infinite wait
}

// ─── 16. onRateLimit() on queue WITH intervalCap — correct usage ─────────────

// @expect-clean
export async function onRateLimitWithIntervalCapCorrect() {
  const q = new PQueue({ intervalCap: 5, interval: 1000 });
  for (let i = 0; i < 10; i++) {
    q.add(async () => 'task' + i).catch(() => {});
  }
  // SHOULD_NOT_FIRE: configured intervalCap + interval means the queue CAN enter rate-limited state
  await q.onRateLimit();
  // safely reaches here when the 5th task in the current interval starts
}

// ─── 17. onRateLimitCleared() on PAUSED queue — hangs forever ────────────────

// @expect-clean (detection not implemented — requires pause()/start() lifecycle tracking on PQueue receiver)
export async function onRateLimitClearedPausedQueueHangs() {
  const q = new PQueue({ intervalCap: 3, interval: 1000 });
  q.add(async () => 'task1').catch(() => {});
  q.add(async () => 'task2').catch(() => {});
  q.add(async () => 'task3').catch(() => {});
  q.add(async () => 'task4').catch(() => {});   // this one trips rate-limit
  q.pause();                                     // CRITICAL: queue stops processing
  // Behavioral violation: 'rateLimitCleared' event only fires from #next() which a
  // paused queue never runs — silent deadlock. Detection requires pause()/start()
  // lifecycle analysis on the receiver — concern-20260623-p-queue-deepen-2.
  await q.onRateLimitCleared();
  // caller never reaches this line — deadlock
}

// ─── 18. onRateLimitCleared() on running queue — correct usage ───────────────

// @expect-clean
export async function onRateLimitClearedDrainPattern() {
  const q = new PQueue({ intervalCap: 5, interval: 1000 });
  for (let i = 0; i < 20; i++) {
    if (q.isRateLimited) {
      // SHOULD_NOT_FIRE: correct drain pattern — gated on isRateLimited check
      await q.onRateLimitCleared();
    }
    q.add(async () => 'task' + i).catch(() => {});
  }
}
