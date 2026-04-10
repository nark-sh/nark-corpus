/**
 * express Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec and FP-fix concerns, NOT V1 behavior.
 *
 * Contracted functions (from import "express"):
 *   - app.use()          postcondition: async-middleware-unhandled-rejection
 *   - app.get/post/etc.  postcondition: async-route-handler-unhandled-rejection
 *   - router.use()       postcondition: async-router-middleware-unhandled-rejection
 *   - router.get/etc.    postcondition: async-router-handler-unhandled-rejection
 *   - express.json()     postcondition: json-parse-syntax-error, json-payload-too-large, json-charset-unsupported
 *   - express.urlencoded() postcondition: urlencoded-parameters-too-many, urlencoded-payload-too-large
 *   - res.sendFile()     postcondition: sendfile-file-not-found, sendfile-forbidden-path
 *   - res.download()     postcondition: download-file-error
 *   - app.listen()       postcondition: listen-eaddrinuse, listen-eacces
 *   - res.render()       postcondition: render-view-not-found, render-template-error
 *   - express.static()   postcondition: static-fallthrough-disabled
 *
 * Key behaviors under test:
 *   - app.use(asyncCallback) without try-catch → SHOULD_FIRE
 *   - app.use(syncFactory()) → SHOULD_NOT_FIRE (concern-20260401-express-1)
 *   - app.use(asyncCallback with full-body try-catch) → SHOULD_NOT_FIRE (concern-20260401-express-2)
 *   - app.get(asyncCallback) without try-catch → SHOULD_FIRE
 *   - app.get(asyncCallback with full-body try-catch) → SHOULD_NOT_FIRE
 *
 * Detection path: express imported → app.use/app.get/router.use/router.get call →
 *   async callback arg → ContractMatcher checks try-catch → postcondition fires
 */

import express, { Request, Response, NextFunction } from 'express';

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. app.use() — sync factory (no async function arg) → SHOULD_NOT_FIRE
//    concern-20260401-express-1: sync middleware factories are not async
// ─────────────────────────────────────────────────────────────────────────────

declare function cors(): (req: Request, res: Response, next: NextFunction) => void;
declare function helmet(): (req: Request, res: Response, next: NextFunction) => void;

// SHOULD_NOT_FIRE: cors() is a sync factory — no async function literal arg, postcondition does not apply.
app.use(cors());

// SHOULD_NOT_FIRE: helmet() is a sync factory — no async function literal arg, postcondition does not apply.
app.use(helmet());

// SHOULD_NOT_FIRE: express.json() is a sync factory — no async function literal arg.
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// 2. app.use() — async middleware WITHOUT try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

declare function authenticateUser(token: string | undefined): Promise<void>;

// SHOULD_FIRE: async-middleware-unhandled-rejection — async middleware without try-catch. Express 4 does not catch unhandled promise rejections.
app.use(async (req: Request, res: Response, next: NextFunction) => {
  await authenticateUser(req.headers.authorization);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. app.use() — async middleware WITH full-body try-catch → SHOULD_NOT_FIRE
//    concern-20260401-express-2: full-body try-catch satisfies postcondition
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: async middleware with full-body try-catch — postcondition satisfied.
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authenticateUser(req.headers.authorization);
    next();
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. app.use() — async middleware WITHOUT try-catch, path-prefixed → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

declare function fetchUser(id: string): Promise<any>;

// SHOULD_FIRE: async-middleware-unhandled-rejection — path-prefixed async middleware without try-catch.
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  const user = await fetchUser(req.headers['x-user-id'] as string);
  res.json(user);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. express.json() — no error-handling middleware → SHOULD_FIRE
//    json-parse-syntax-error: malformed JSON body causes SyntaxError (400)
// ─────────────────────────────────────────────────────────────────────────────

const jsonApp = express();

// SHOULD_FIRE: json-parse-syntax-error — express.json() used without error-handling middleware to catch SyntaxError.
jsonApp.use(express.json());
jsonApp.post('/data', (req: Request, res: Response) => {
  res.json(req.body);
});
// Missing: jsonApp.use((err, req, res, next) => { ... }) error handler

// ─────────────────────────────────────────────────────────────────────────────
// 6. express.json() — WITH error-handling middleware → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

const jsonAppHandled = express();

// SHOULD_NOT_FIRE: express.json() with proper error-handling middleware.
jsonAppHandled.use(express.json());
jsonAppHandled.post('/data', (req: Request, res: Response) => {
  res.json(req.body);
});
jsonAppHandled.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ error: 'Bad request' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. res.sendFile() — without error callback → SHOULD_FIRE
//    sendfile-file-not-found: file serving without error handling
// ─────────────────────────────────────────────────────────────────────────────

import path from 'path';

// SHOULD_FIRE: sendfile-file-not-found — res.sendFile() without error callback or error middleware.
app.get('/files/:name', (req: Request, res: Response) => {
  res.sendFile(path.join('/uploads', req.params.name));
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. res.sendFile() — WITH error callback → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: res.sendFile() with error callback handling.
app.get('/files-safe/:name', (req: Request, res: Response) => {
  res.sendFile(path.join('/uploads', req.params.name), (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('File not found');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. res.download() — without error callback → SHOULD_FIRE
//    download-file-error: file download without error handling
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: download-file-error — res.download() without error callback.
app.get('/download/:name', (req: Request, res: Response) => {
  res.download('/reports/' + req.params.name);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. res.download() — WITH error callback → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: res.download() with error callback.
app.get('/download-safe/:name', (req: Request, res: Response) => {
  res.download('/reports/' + req.params.name, (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('File not found');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. app.listen() — without error handling → SHOULD_FIRE
//     listen-eaddrinuse: server started without error listener
// ─────────────────────────────────────────────────────────────────────────────

const listenApp = express();

// SHOULD_FIRE: listen-eaddrinuse — app.listen() without error handler on returned server.
listenApp.listen(3000);

// ─────────────────────────────────────────────────────────────────────────────
// 12. app.listen() — WITH error handling → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

const listenAppSafe = express();

// SHOULD_NOT_FIRE: app.listen() with error event handler.
const server = listenAppSafe.listen(3001);
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
    process.exit(1);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. res.render() — without callback → SHOULD_FIRE
//     render-view-not-found: template rendering without error handling
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: render-view-not-found — res.render() without callback passes error to default handler.
app.get('/dashboard', (req: Request, res: Response) => {
  res.render('dashboard', { title: 'Dashboard' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. res.render() — WITH callback → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: res.render() with error-handling callback.
app.get('/dashboard-safe', (req: Request, res: Response) => {
  res.render('dashboard', { title: 'Dashboard' }, (err: Error, html: string) => {
    if (err) {
      return res.status(500).send('Template error');
    }
    res.send(html);
  });
});
