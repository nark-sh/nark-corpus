/**
 * EventEmitter2 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the eventemitter2 contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - new EventEmitter2() without .on('error', handler) → SHOULD_FIRE: eventemitter2-001
 *   - emit('error', ...) without error listener attached → SHOULD_FIRE: eventemitter2-emit-unhandled-error
 *   - emitAsync('error', ...) without error listener → SHOULD_FIRE: eventemitter2-emit-async-unhandled-error
 *   - await emitAsync() without try-catch (listeners may reject) → SHOULD_FIRE: eventemitter2-emit-async-listener-rejection
 *   - waitFor(..., {timeout: N}) without try-catch → SHOULD_FIRE: eventemitter2-wait-for-timeout
 *   - await EventEmitter2.once(...) without try-catch → SHOULD_FIRE: eventemitter2-static-once-error-rejection
 *   - listenTo() with non-object target → SHOULD_FIRE: eventemitter2-listen-to-invalid-target
 *
 * Functions with proper error handling should SHOULD_NOT_FIRE.
 */

import EventEmitter2 from 'eventemitter2';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Constructor: missing .on('error') listener
// ─────────────────────────────────────────────────────────────────────────────

export function createWithoutErrorListener() {
  // SHOULD_FIRE: eventemitter2-001 — new EventEmitter2() without .on('error') crashes on error events
  const emitter = new EventEmitter2();
  emitter.on('data', (msg: unknown) => console.log(msg));
  return emitter;
}

export function createWithErrorListener() {
  // SHOULD_NOT_FIRE: .on('error') registered — requirement satisfied
  const emitter = new EventEmitter2();
  emitter.on('error', (err: Error) => console.error('Emitter error:', err));
  emitter.on('data', (msg: unknown) => console.log(msg));
  return emitter;
}

export function createWithIgnoreErrors() {
  // KNOWN_FP: ignoreErrors: true disables the throw-on-missing-error behavior — scanner does not yet
  // inspect constructor options to suppress eventemitter2-001 when ignoreErrors:true is passed.
  // This is a known false positive pending scanner upgrade (concern-20260413-eventemitter2-deepen-6).
  const emitter = new EventEmitter2({ ignoreErrors: true });
  emitter.on('data', (msg: unknown) => console.log(msg));
  return emitter;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. emit(): synchronous throw on unhandled error event
// ─────────────────────────────────────────────────────────────────────────────

export function emitErrorWithoutListener() {
  const emitter = new EventEmitter2();
  emitter.on('data', (msg: unknown) => console.log(msg));
  // SHOULD_FIRE: eventemitter2-emit-unhandled-error — emit('error') with no listener throws
  emitter.emit('error', new Error('something broke'));
}

export function emitErrorWithListener() {
  const emitter = new EventEmitter2();
  emitter.on('error', (err: Error) => console.error('handled:', err));
  // KNOWN_FP: error listener IS registered, emit('error') will not throw — but scanner does not yet
  // track that prior .on('error') registration satisfies the postcondition for subsequent emit() calls.
  // Known FP pending scanner upgrade (concern-20260413-eventemitter2-deepen-6).
  emitter.emit('error', new Error('something broke'));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. emitAsync(): Promise rejection on unhandled error event
// ─────────────────────────────────────────────────────────────────────────────

export async function emitAsyncErrorWithoutHandling() {
  const emitter = new EventEmitter2();
  emitter.on('data', (msg: unknown) => console.log(msg));
  // SHOULD_FIRE: eventemitter2-emit-async-unhandled-error — emitAsync('error') without listener returns rejected Promise
  await emitter.emitAsync('error', new Error('async error'));
}

export async function emitAsyncListenerRejectWithoutHandling() {
  const emitter = new EventEmitter2();
  emitter.on('process', async () => {
    throw new Error('listener failed');
  });
  // NO_DETECTOR: eventemitter2-emit-async-listener-rejection — listener rejection propagates via Promise.all
  // No scanner rule yet exists for detecting async listener rejections propagated via Promise.all.
  // Pending implementation in bc-scanner-upgrade (concern-20260413-eventemitter2-deepen-2).
  await emitter.emitAsync('process', 'payload');
}

export async function emitAsyncWithProperHandling() {
  const emitter = new EventEmitter2();
  emitter.on('error', (err: Error) => console.error('handled:', err));
  emitter.on('process', async (data: unknown) => {
    console.log('processing:', data);
  });
  // SHOULD_NOT_FIRE: try-catch wraps emitAsync, error listener registered
  try {
    await emitter.emitAsync('process', 'payload');
  } catch (err) {
    console.error('emit failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. waitFor(): timeout and cancellation rejections
// ─────────────────────────────────────────────────────────────────────────────

export async function waitForWithTimeoutNoHandling() {
  const emitter = new EventEmitter2();
  // SHOULD_FIRE: eventemitter2-wait-for-timeout — timeout rejection not handled
  await emitter.waitFor('ready', { timeout: 5000 });
}

export async function waitForWithTimeoutAndHandling() {
  const emitter = new EventEmitter2();
  // SHOULD_NOT_FIRE: try-catch handles timeout rejection
  try {
    await emitter.waitFor('ready', { timeout: 5000 });
  } catch (err) {
    if ((err as Error).message === 'timeout') {
      console.error('Timed out waiting for ready event');
    } else {
      throw err;
    }
  }
}

export function waitForCancelWithoutHandling() {
  const emitter = new EventEmitter2();
  const promise = emitter.waitFor('ready');
  // NO_DETECTOR: eventemitter2-wait-for-cancel — cancel() rejects, no .catch() handler
  // No scanner rule yet for detecting unhandled cancel() calls on CancelablePromise.
  // Pending implementation in bc-scanner-upgrade (concern-20260413-eventemitter2-deepen-3).
  promise.cancel('aborting');
}

export function waitForCancelWithHandling() {
  const emitter = new EventEmitter2();
  const promise = emitter.waitFor('ready');
  promise.catch((err: Error) => console.log('cancelled:', err.message));
  // SHOULD_NOT_FIRE: .catch() handles the rejection from cancel()
  promise.cancel('aborting');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EventEmitter2.once() — static method rejections
// ─────────────────────────────────────────────────────────────────────────────

export async function staticOnceWithoutHandling() {
  const emitter = new EventEmitter2();
  // SHOULD_FIRE: eventemitter2-static-once-error-rejection — no try-catch, error event may reject
  await EventEmitter2.once(emitter, 'ready');
}

export async function staticOnceWithTimeoutNoHandling() {
  const emitter = new EventEmitter2();
  // NO_DETECTOR: eventemitter2-static-once-timeout — timeout rejection not handled
  // Scanner fires eventemitter2-static-once-error-rejection at this line but not the
  // timeout-specific postcondition. Marking as no-detector for the timeout variant.
  // Pending scanner upgrade (concern-20260413-eventemitter2-deepen-4).
  await EventEmitter2.once(emitter, 'ready', { timeout: 3000 });
}

export async function staticOnceWithProperHandling() {
  const emitter = new EventEmitter2();
  // SHOULD_NOT_FIRE: try-catch handles both error-event rejection and timeout rejection
  try {
    const [data] = await EventEmitter2.once(emitter, 'ready', { timeout: 3000 });
    console.log('ready:', data);
  } catch (err) {
    console.error('once failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. listenTo(): invalid target throws synchronously
// ─────────────────────────────────────────────────────────────────────────────

export function listenToWithInvalidTarget() {
  const emitter = new EventEmitter2();
  // SHOULD_FIRE: eventemitter2-listen-to-invalid-target — null is not a valid target
  emitter.listenTo(null as unknown as EventEmitter2, 'event');
}

export function listenToWithValidTarget() {
  const emitter = new EventEmitter2();
  const source = new EventEmitter2();
  // KNOWN_FP: source is a valid EventEmitter2 instance with on/off methods — scanner does not yet
  // distinguish valid from invalid targets for listenTo(); it fires eventemitter2-listen-to-invalid-target
  // for all listenTo() calls. Pending scanner upgrade (concern-20260413-eventemitter2-deepen-5).
  emitter.listenTo(source, 'data');
}
