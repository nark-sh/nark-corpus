/**
 * body-parser Ground-Truth Fixture
 *
 * Documents expected scanner behavior for body-parser contracts.
 *
 * Contracted functions (from import "body-parser"):
 *   - json()        postconditions: malformed-json-throws, payload-too-large, unsupported-charset,
 *                                   json-verify-failed, json-encoding-unsupported, json-size-invalid,
 *                                   json-stream-encoding-set, json-stream-not-readable
 *   - urlencoded()  postconditions: payload-too-large, too-many-parameters, parse-failure,
 *                                   urlencoded-verify-failed, urlencoded-encoding-unsupported,
 *                                   urlencoded-size-invalid, urlencoded-stream-encoding-set,
 *                                   urlencoded-stream-not-readable, urlencoded-qs-depth-exceeded
 *   - raw()         postconditions: payload-too-large, raw-verify-failed, raw-encoding-unsupported,
 *                                   raw-size-invalid, raw-stream-encoding-set, raw-stream-not-readable
 *   - text()        postconditions: payload-too-large, unsupported-charset, text-verify-failed,
 *                                   text-encoding-unsupported, text-size-invalid,
 *                                   text-stream-encoding-set, text-stream-not-readable
 *
 * ⚠️  DETECTION MODEL MISMATCH (concern-2026-04-03-body-parser-1):
 * body-parser is Express middleware. Errors from parsing are passed to Express's
 * 4-argument error handler (err, req, res, next) — they are NOT thrown as async
 * exceptions from the bodyParser.*() call site.
 *
 * The scanner currently detects body-parser violations by checking for try-catch
 * around the bodyParser.*() call, which is architecturally WRONG for Express
 * middleware patterns. This produces false positives even when proper Express
 * error middleware is registered.
 *
 * All patterns below are SHOULD_NOT_FIRE because:
 *   1. The correct fix for body-parser errors is Express error middleware, not try-catch
 *   2. Scanner fires on all bodyParser.*() calls regardless of error middleware presence
 *   3. Until the scanner implements Express error middleware detection, all violations
 *      from body-parser are false positives
 *
 * When body-parser detection is properly implemented (checking for 4-arg error
 * middleware registration in the same Express app), update annotations accordingly.
 *
 * NEW in depth pass 2026-04-15:
 * Added error types: entity.verify.failed (403), encoding.unsupported (415),
 * request.size.invalid (400), stream.encoding.set (500), stream.not.readable (500),
 * and urlencoded qs depth-exceeded (400).
 * All follow the same detection model — require Express error middleware, not try-catch.
 */

import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';

const app = express();

// SHOULD_NOT_FIRE: malformed-json-throws — scanner should check for 4-arg error middleware, not try-catch
const jsonParser = bodyParser.json({ limit: '10mb' });

// SHOULD_NOT_FIRE: payload-too-large — same detection model mismatch
const urlencodedParser = bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100 });

// SHOULD_NOT_FIRE: payload-too-large — same detection model mismatch
const rawParser = bodyParser.raw({ limit: '10mb' });

// SHOULD_NOT_FIRE: payload-too-large, unsupported-charset — same detection model mismatch
const textParser = bodyParser.text({ limit: '10mb' });

app.post('/api/data', jsonParser, (req, res) => {
  res.json({ received: req.body });
});

app.post('/api/form', urlencodedParser, (req, res) => {
  res.json({ received: req.body });
});

// ✅ Correct error handling pattern for body-parser: 4-arg Express error middleware
// Comprehensive handler covering all contracted error types (pre-deepen + new)
app.use(((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Pre-existing contracted error types
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  if (err.type === 'parameters.too.many') {
    return res.status(413).json({ error: 'Too many parameters' });
  }
  if (err.type === 'charset.unsupported') {
    return res.status(415).json({ error: 'Unsupported charset' });
  }

  // New postconditions added in depth pass 2026-04-15:
  // @expect-clean: json-verify-failed, urlencoded-verify-failed, raw-verify-failed, text-verify-failed
  if (err.type === 'entity.verify.failed' || err.status === 403) {
    return res.status(403).json({ error: 'Verification failed' });
  }
  // @expect-clean: json-encoding-unsupported, urlencoded-encoding-unsupported, raw-encoding-unsupported, text-encoding-unsupported
  if (err.type === 'encoding.unsupported') {
    return res.status(415).json({ error: 'Unsupported content encoding' });
  }
  // @expect-clean: json-size-invalid, urlencoded-size-invalid, raw-size-invalid, text-size-invalid
  if (err.type === 'request.size.invalid') {
    return res.status(400).json({ error: 'Request size invalid' });
  }
  // @expect-clean: json-stream-encoding-set, urlencoded-stream-encoding-set, raw-stream-encoding-set, text-stream-encoding-set
  if (err.type === 'stream.encoding.set') {
    return res.status(500).json({ error: 'Internal server error' });
  }
  // @expect-clean: json-stream-not-readable, urlencoded-stream-not-readable, raw-stream-not-readable, text-stream-not-readable
  if (err.type === 'stream.not.readable') {
    return res.status(500).json({ error: 'Internal server error' });
  }
  // @expect-clean: urlencoded-qs-depth-exceeded
  if (err.status === 400 && err.message && err.message.includes('exceeded the depth')) {
    return res.status(400).json({ error: 'Input too deeply nested' });
  }

  next(err);
}) as ErrorRequestHandler);

// ❌ MISSING: App without error handlers for new error types — would violate all new postconditions
// SHOULD_NOT_FIRE: (detection model mismatch — scanner can't yet detect Express error middleware presence)
const appWithoutNewHandlers = express();
// @expect-violation: json-verify-failed (if scanner implements verify-callback detection)
const jsonParserWithVerify = bodyParser.json({
  verify: (req: any, res: any, buf: Buffer) => {
    // custom verification — but no error handler registered below
  }
});
appWithoutNewHandlers.post('/webhook', jsonParserWithVerify, (req, res) => {
  res.json({ ok: true });
});
// No error middleware registered — verify failures would propagate unhandled

export { app, appWithoutNewHandlers };
