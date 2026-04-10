/**
 * body-parser Ground-Truth Fixture
 *
 * Documents expected scanner behavior for body-parser contracts.
 *
 * Contracted functions (from import "body-parser"):
 *   - json()        postconditions: malformed-json-throws, payload-too-large, unsupported-charset
 *   - urlencoded()  postconditions: payload-too-large, too-many-parameters, parse-failure
 *   - raw()         postcondition:  payload-too-large
 *   - text()        postconditions: payload-too-large, unsupported-charset
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
app.use(((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  next(err);
}) as ErrorRequestHandler);

export { app };
