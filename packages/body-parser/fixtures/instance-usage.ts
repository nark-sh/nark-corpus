/**
 * Fixture: Instance Usage for body-parser
 *
 * This fixture tests detection of body-parser usage in various patterns:
 * - Parser instances stored in variables
 * - Parser configuration variations
 * - Middleware applied in different ways
 * - Edge cases
 *
 * Expected: Mix of violations and correct patterns
 */

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';

// ✅ GOOD: Create parser instances with proper configuration
const jsonParserGood = bodyParser.json({
  limit: '10mb',
  strict: true,
  type: 'application/json'
});

const urlencodedParserGood = bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 100,
  depth: 5
});

// ❌ BAD: Create parser instances without configuration
// Violations: body-parser-002, body-parser-003, body-parser-004
const jsonParserBad = bodyParser.json();
const urlencodedParserBad = bodyParser.urlencoded({ extended: true });

// Test: Route-specific middleware (good pattern)
const app1 = express();

app1.post('/api/good1', jsonParserGood, (req, res) => {
  // ✅ GOOD: Validate input
  if (!req.body || typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  res.json({ message: 'Success', name: req.body.name });
});

app1.post('/api/bad1', jsonParserBad, (req, res) => {
  // ❌ BAD: No validation
  // Violation: body-parser-005
  res.json(req.body);
});

// ✅ GOOD: Error middleware for app1
app1.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// Test: Multiple parsers per route
const app2 = express();

const customJsonParser = bodyParser.json({
  limit: '1mb',
  type: 'application/vnd.api+json' // Custom Content-Type
});

// ✅ GOOD: Custom parser with proper configuration
app2.post('/api/custom', customJsonParser, (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'No body' });
  }
  res.json({ message: 'Custom JSON received' });
});

// ✅ GOOD: Error middleware
app2.use(((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Parse error' });
  }
  next(err);
}) as ErrorRequestHandler);

// Test: Parser with verify function
const app3 = express();

const verifyingParser = bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    // Custom verification logic
    if (buf.length === 0) {
      throw new Error('Empty body');
    }
  }
});

app3.post('/api/verified', verifyingParser, (req, res) => {
  res.json({ message: 'Verified' });
});

// ✅ GOOD: Error middleware handles verification errors
app3.use(((err, req, res, next) => {
  if (err.type === 'entity.verify.failed') {
    return res.status(403).json({ error: 'Verification failed' });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
}) as ErrorRequestHandler);

// Test: Raw and text parsers
const app4 = express();

// ✅ GOOD: Raw parser with limit
const rawParser = bodyParser.raw({
  limit: '5mb',
  type: 'application/octet-stream'
});

// ✅ GOOD: Text parser with limit
const textParser = bodyParser.text({
  limit: '1mb',
  type: 'text/plain'
});

app4.post('/api/raw', rawParser, (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  res.json({ size: req.body.length });
});

app4.post('/api/text', textParser, (req, res) => {
  if (typeof req.body !== 'string') {
    return res.status(400).json({ error: 'Invalid text' });
  }
  res.json({ length: req.body.length });
});

// ✅ GOOD: Error middleware
app4.use(((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
}) as ErrorRequestHandler);

// Test: Parser reuse across multiple routes
const app5 = express();

const sharedJsonParser = bodyParser.json({ limit: '10mb' });

app5.post('/api/users', sharedJsonParser, (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No body' });
  res.json({ message: 'User created' });
});

app5.post('/api/posts', sharedJsonParser, (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No body' });
  res.json({ message: 'Post created' });
});

app5.post('/api/comments', sharedJsonParser, (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No body' });
  res.json({ message: 'Comment created' });
});

// ✅ GOOD: Single error middleware for all routes
app5.use(((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
}) as ErrorRequestHandler);

// Test: NO error middleware (bad!)
const app6 = express();

// ❌ BAD: Parser without limits
// Violations: body-parser-002
const badJsonParser = bodyParser.json();

app6.post('/api/unsafe', badJsonParser, (req, res) => {
  // ❌ BAD: No validation
  // Violation: body-parser-005
  res.json(req.body);
});

// ❌ CRITICAL: NO ERROR MIDDLEWARE!
// Violation: body-parser-001
// This app will crash on malformed JSON!

// Test: Mixed good and bad patterns
const app7 = express();

// ✅ GOOD: Properly configured parser
const goodParser = bodyParser.json({
  limit: '10mb',
  strict: true
});

// ❌ BAD: No configuration
// Violation: body-parser-002
const defaultParser = bodyParser.json();

app7.post('/api/good', goodParser, (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No body' });
  res.json({ message: 'OK' });
});

app7.post('/api/bad', defaultParser, (req, res) => {
  // ❌ BAD: No validation
  // Violation: body-parser-005
  res.json(req.body);
});

// ✅ GOOD: Has error middleware
app7.use(((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
}) as ErrorRequestHandler);

// Test: URL-encoded parser variations
const app8 = express();

// ✅ GOOD: All limits configured
const strictUrlencoded = bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 50,
  depth: 3
});

// ❌ BAD: Missing parameterLimit
// Violation: body-parser-003
const noParamLimit = bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
  depth: 5
});

// ❌ BAD: Missing depth
// Violation: body-parser-004
const noDepthLimit = bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 100
});

// ❌ BAD: Missing both
// Violations: body-parser-003, body-parser-004
const noLimits = bodyParser.urlencoded({
  extended: true
});

app8.post('/api/strict', strictUrlencoded, (req, res) => {
  res.json({ message: 'Strict parsing' });
});

app8.post('/api/loose', noLimits, (req, res) => {
  // ❌ BAD: No validation
  // Violation: body-parser-005
  res.json(req.body);
});

// ✅ GOOD: Error middleware with specific checks
app8.use(((err, req, res, next) => {
  if (err.type === 'parameters.too.many') {
    return res.status(413).json({ error: 'Too many parameters' });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Parse error' });
  }
  next(err);
}) as ErrorRequestHandler);

// Export all apps for testing
export {
  app1,
  app2,
  app3,
  app4,
  app5,
  app6, // No error middleware - should trigger violation
  app7,
  app8,
  jsonParserGood,
  jsonParserBad,
  urlencodedParserGood,
  urlencodedParserBad
};
