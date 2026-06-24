/**
 * Ground-truth test fixtures for express-async-errors
 *
 * This package is a side-effect-only monkey-patch — it exports nothing callable.
 * Violations are detected by usage patterns, not by direct function calls.
 *
 * Test annotations:
 *   // @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   // @expect-clean                           — scanner SHOULD NOT flag this
 */
import express from 'express';

// ---------------------------------------------------------------------------
// CLEAN patterns — should NOT be flagged
// ---------------------------------------------------------------------------

// @expect-clean
// Correct pattern: express-async-errors required, error handler registered
function setupAppCorrectly(): void {
  require('express-async-errors');
  const app = express();

  app.get('/users', async (req: express.Request, res: express.Response) => {
    // Async handler — errors automatically forwarded by the library
    const users: unknown[] = [];
    res.json(users);
  });

  // Error handler registered — required for async errors to be caught
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message });
  });
}

// @expect-clean
// Correct param middleware pattern — param middleware errors also caught
function setupParamMiddlewareCorrectly(): void {
  require('express-async-errors');
  const app = express();

  // Param middleware is also wrapped by the library — async errors forwarded
  app.param('userId', async (req: express.Request, res: express.Response, next: express.NextFunction, id: string) => {
    if (!id) throw new Error(`Invalid userId: ${id}`);
    next();
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(400).json({ error: err.message });
  });
}

// ---------------------------------------------------------------------------
// VIOLATION patterns — scanner SHOULD flag these
// ---------------------------------------------------------------------------

// @expect-violation: async-error-not-forwarded-without-error-handler
// WRONG: No Express error handler registered — async errors have nowhere to go
function setupAppWithoutErrorHandler(): void {
  require('express-async-errors');
  const app = express();

  app.get('/users', async (req: express.Request, res: express.Response) => {
    // Async errors forwarded by library, but no error handler to receive them
    const users: unknown[] = [];
    res.json(users);
  });

  // Missing: app.use((err, req, res, next) => { ... })
  // Async errors will result in generic 500 or unhandled rejection
}

// @expect-violation: bundler-code-splitting-breaks-patch
// WRONG (documentation): Code-splitting in bundlers silently breaks the patch
// The patch works in dev but fails silently in production bundle
// (This is a deployment pattern violation, not directly detectable in source)

// ---------------------------------------------------------------------------
// INCOMPATIBILITY patterns — document known failure modes
// ---------------------------------------------------------------------------

// @expect-violation: express-v5-incompatible
// WRONG: express-async-errors cannot be required in Express v5 projects
// The library's require('express/lib/router') throws in Express v5
// (Detection requires checking peerDependency vs installed express version)
function wouldFailWithExpressV5(): void {
  // In an Express v5 project, the following line throws at require-time:
  // require('express-async-errors');  // Error: Cannot find module 'express/lib/router'
}

// @expect-violation: esm-not-supported
// WRONG: Cannot use import syntax in strict ESM environments
// import 'express-async-errors';  // ReferenceError: require is not defined in ES module scope
// (Detectable by package.json "type": "module" combined with express-async-errors import)
function wouldFailInEsm(): void {
  // ESM import would fail — using require() is the only supported form
}

// ---------------------------------------------------------------------------
// Added 2026-06-24 (deepen-stream-2 pass 74) — callback-middleware + noop-fallback
// ---------------------------------------------------------------------------

// SHOULD_FIRE: callback-based-middleware-not-caught
function multerCallbackThrowEscapes(): void {
  require('express-async-errors');
  const app = express();
  const fakeMulter = { diskStorage: (opts: { destination: (req: express.Request, file: unknown, cb: (e: Error | null, p?: string) => void) => void }) => opts };
  const storage = fakeMulter.diskStorage({
    destination: (req, file, cb) => {
      if (!(req as express.Request & { user?: unknown }).user) throw new Error('unauthorized');
      cb(null, '/uploads');
    },
  });
  app.post('/upload', async (req: express.Request, res: express.Response) => {
    void storage;
    res.json({ ok: true });
  });
}

// SHOULD_NOT_FIRE: callback-based-middleware-not-caught
function multerCallbackPassesErrorToCb(): void {
  require('express-async-errors');
  const app = express();
  const fakeMulter = { diskStorage: (opts: { destination: (req: express.Request, file: unknown, cb: (e: Error | null, p?: string) => void) => void }) => opts };
  const storage = fakeMulter.diskStorage({
    destination: (req, file, cb) => {
      if (!(req as express.Request & { user?: unknown }).user) return cb(new Error('unauthorized'));
      cb(null, '/uploads');
    },
  });
  app.post('/upload', async (req: express.Request, res: express.Response) => {
    void storage;
    res.json({ ok: true });
  });
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message });
  });
}

// SHOULD_FIRE: noop-fallback-silent-swallow
async function invokeWrappedHandlerDirectlyWithoutNext(): Promise<void> {
  require('express-async-errors');
  const handler = async (req: express.Request, res: express.Response) => {
    const user = (req as express.Request & { user?: { id: string } }).user;
    if (!user) throw new Error('not found');
    res.json(user);
  };
  const fakeReq = {} as express.Request;
  const fakeRes = { json: () => undefined } as unknown as express.Response;
  await handler(fakeReq, fakeRes);
}

// SHOULD_NOT_FIRE: noop-fallback-silent-swallow
async function invokeWrappedHandlerWithExplicitNext(): Promise<void> {
  require('express-async-errors');
  const handler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as express.Request & { user?: { id: string } }).user;
    if (!user) return next(new Error('not found'));
    res.json(user);
  };
  const fakeReq = {} as express.Request;
  const fakeRes = { json: () => undefined } as unknown as express.Response;
  let capturedErr: Error | undefined;
  await handler(fakeReq, fakeRes, (err) => { capturedErr = err as Error; });
  void capturedErr;
}
