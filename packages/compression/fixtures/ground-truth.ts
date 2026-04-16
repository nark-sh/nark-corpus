/**
 * Ground-truth test fixtures for compression postconditions.
 *
 * Annotations:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                          — scanner MUST NOT flag this
 *
 * Postconditions covered:
 *   - sse-missing-flush             (error)   SSE stream without res.flush() after write
 *   - zlib-stream-unhandled-error   (error)   No process.on('uncaughtException') for zlib stream crash
 *   - flush-noop-before-stream      (info)    flush() before stream init is safe
 *   - cache-control-no-transform    (warning) no-transform bypasses compression
 */

import compression from 'compression';
import express, { Request, Response } from 'express';

// ─── VIOLATION FIXTURES ───────────────────────────────────────────────────────

/**
 * @expect-violation: sse-missing-flush
 *
 * SSE endpoint using compression middleware but NOT calling res.flush() after each write.
 * Data accumulates in the zlib buffer and clients receive no real-time events.
 */
function setupSseWithoutFlush(app: ReturnType<typeof express>) {
  app.use(compression());

  app.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const timer = setInterval(() => {
      res.write('data: ping\n\n');
      // ❌ Missing res.flush() — data is buffered by zlib, never reaches SSE client
    }, 2000);

    res.on('close', () => {
      clearInterval(timer);
    });
  });
}

// ─── CLEAN FIXTURES ───────────────────────────────────────────────────────────

/**
 * @expect-clean
 *
 * SSE endpoint correctly calling res.flush() after each write.
 * Compressed data is immediately delivered to the client.
 */
function setupSseWithFlush(app: ReturnType<typeof express>) {
  app.use(compression());

  app.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const timer = setInterval(() => {
      res.write('data: ping\n\n');
      res.flush(); // ✅ Forces compressed chunk to client immediately
    }, 2000);

    res.on('close', () => {
      clearInterval(timer);
    });
  });
}

/**
 * @expect-clean
 *
 * Standard JSON endpoint — no streaming, no SSE.
 * res.flush() is not needed; res.json() sends and ends the response.
 */
function setupJsonEndpoint(app: ReturnType<typeof express>) {
  app.use(compression());

  app.get('/data', (req: Request, res: Response) => {
    res.json({ ok: true, items: new Array(1000).fill('data') });
    // ✅ No flush needed for non-streaming JSON responses
  });
}

// ─── ZLIB STREAM ERROR FIXTURES ──────────────────────────────────────────────

/**
 * @expect-violation: zlib-stream-unhandled-error
 *
 * Server using compression() middleware with no process.on('uncaughtException')
 * or app.use(4-arg error handler). The internal zlib stream in compression
 * has no .on('error') handler — any zlib fault emits an unhandled error event
 * that crashes the process.
 *
 * NOTE: This postcondition targets process-level crash risk. The scanner
 * detects this as "no-detector" (proactive deepen) — scanner concern queued.
 */
function setupServerWithoutZlibErrorHandling() {
  const app = express();

  // ❌ No 4-argument Express error handler, no process.on('uncaughtException')
  // A zlib stream error inside compression() will crash the process.
  app.use(compression());

  app.get('/data', (_req: Request, res: Response) => {
    res.json({ items: [] });
  });

  return app;
}

/**
 * @expect-clean
 *
 * Server using compression() with a global process.on('uncaughtException')
 * handler protecting against zlib stream crashes.
 */
function setupServerWithZlibErrorHandling() {
  const app = express();

  // ✅ Global uncaught exception handler guards against zlib stream crashes
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception (possible zlib stream error):', err);
    // Process can recover or gracefully shutdown
  });

  app.use(compression());

  app.get('/data', (_req: Request, res: Response) => {
    res.json({ items: [] });
  });

  return app;
}
