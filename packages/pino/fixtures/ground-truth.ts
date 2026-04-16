/**
 * pino Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec and observed scanner behavior.
 *
 * Contracted functions (from import "pino"):
 *   - pino()              postcondition: destination-error, invalid-level
 *   - logger.child()      postcondition: child-bindings-serializer-error
 *   - pino.transport()    postcondition: transport-error-event-unhandled, transport-module-not-found
 *   - pino.destination()  postcondition: destination-write-error-event
 *   - logger.flush()      postcondition: flush-callback-error-ignored
 *   - pino.multistream()  postcondition: multistream-invalid-stream-entry
 *
 * Scanner behavior (as of 2026-04-03):
 *   - pino(dest) where dest is a pino.destination() call → SHOULD_FIRE: destination-error
 *   - pino(dest) with dest.on('error') registered → still fires (FP — scanner doesn't check listener registration)
 *   - pino() with options only → fires (FP — no destination stream involved)
 *   - logger.child() → fires (FP — child does not have independent destination stream)
 *   - pino.transport() without .on('error') → NEW: SHOULD_FIRE: transport-error-event-unhandled
 *   - pino.destination() without .on('error') → NEW: SHOULD_FIRE: destination-write-error-event
 *   - logger.flush() without error check in callback → NEW: SHOULD_FIRE: flush-callback-error-ignored
 *
 * Known FPs registered in concern-2026-04-03-pino-1.
 * New scanner concerns for Phase 5: transport, destination, flush detection.
 */

import pino from 'pino';

// ─────────────────────────────────────────────────────────────────────────────
// 1. pino() with custom destination — missing error handler
// ─────────────────────────────────────────────────────────────────────────────

const dest = pino.destination('/var/log/app.log');
// SHOULD_FIRE: destination-error — pino(dest) without error handler on destination stream
const loggerNoErrHandler = pino(dest);

const destWithError = pino.destination('/var/log/app.log');
destWithError.on('error', (err: Error) => { console.error('Log error:', err); });
// SHOULD_NOT_FIRE: destination-error — pino(dest) with error handler registered (FP: scanner fires anyway)
const loggerWithErrHandler = pino(destWithError);

// ─────────────────────────────────────────────────────────────────────────────
// 2. pino() without custom destination — no destination stream, no destination-error risk
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: destination-error — pino() with no destination stream (FP: scanner fires anyway)
const loggerGood = pino({ level: 'info' });

// SHOULD_NOT_FIRE: destination-error — pino() with no destination stream (FP: scanner fires anyway)
const loggerDefault = pino();

// ─────────────────────────────────────────────────────────────────────────────
// 3. logger.child() — no independent destination stream
// ─────────────────────────────────────────────────────────────────────────────

const logger = pino({ level: 'info' });

// SHOULD_NOT_FIRE: child-bindings-serializer-error — simple child, no throwing serializer (FP: scanner fires anyway)
const child = logger.child({ requestId: 'abc123' });

// SHOULD_NOT_FIRE: child-bindings-serializer-error — safe serializer (FP: scanner fires anyway)
const childWithSerializer = logger.child(
  { req: { id: 1, url: '/api' } },
  { serializers: { req: (req: { id: number; url: string }) => ({ id: req.id, url: req.url }) } }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. pino.transport() — transport-error-event-unhandled
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: transport-error-event-unhandled
// SHOULD_NOT_FIRE: scanner gap — transport() without error listener — unhandled worker error crashes process
const transportNoErrorHandler = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true },
});
const loggerWithTransportNoHandler = pino(transportNoErrorHandler);

// @expect-clean
// SHOULD_NOT_FIRE: transport() with error listener properly attached
const transportWithErrorHandler = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true },
});
transportWithErrorHandler.on('error', (err: Error) => {
  console.error('transport error (unrecoverable):', err);
  process.exit(1);
});
const loggerWithTransportGood = pino(transportWithErrorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 5. pino.destination() — destination-write-error-event
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: destination-write-error-event
// SHOULD_NOT_FIRE: scanner gap — destination() without error listener — disk/permission errors crash process
const destNoHandler = pino.destination({ dest: '/var/log/app.log', sync: false });
const loggerDestNoHandler = pino(destNoHandler);

// @expect-clean
// SHOULD_NOT_FIRE: destination() with error listener attached
const destWithHandler = pino.destination({ dest: '/var/log/app.log', sync: false });
destWithHandler.on('error', (err: Error) => {
  console.error('destination write error:', err);
  // fallback: switch to stdout or alert ops
});
const loggerDestGood = pino(destWithHandler);

// ─────────────────────────────────────────────────────────────────────────────
// 6. logger.flush() — flush-callback-error-ignored
// ─────────────────────────────────────────────────────────────────────────────

const loggerForFlush = pino(pino.destination({ dest: '/var/log/app.log', sync: false }));

// @expect-violation: flush-callback-error-ignored
// SHOULD_NOT_FIRE: scanner gap — flush() callback ignores err parameter — silent log loss on shutdown
loggerForFlush.flush(() => {
  process.exit(0);  // exits without checking if flush succeeded
});

// @expect-clean
// SHOULD_NOT_FIRE: flush() callback properly checks error
loggerForFlush.flush((err?: Error) => {
  if (err) {
    console.error('flush failed, some logs may be lost:', err.message);
  }
  process.exit(0);
});
