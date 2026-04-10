/**
 * Fixture: Proper Error Handling for body-parser
 *
 * This fixture demonstrates CORRECT usage of body-parser with:
 * - Error handling middleware
 * - Explicit size limits
 * - Parameter limits
 * - Depth limits
 *
 * Expected: 0 violations (this is the correct pattern)
 */

import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// ✅ GOOD: Configure parsers with explicit limits
const jsonParser = bodyParser.json({
  limit: '10mb',           // Explicit size limit
  strict: true,            // Only accept objects/arrays
  type: 'application/json' // Strict Content-Type
});

const urlencodedParser = bodyParser.urlencoded({
  extended: true,
  limit: '10mb',           // Explicit size limit
  parameterLimit: 100,     // Reduce from default 1000
  depth: 5                 // Reduce from default 32
});

const rawParser = bodyParser.raw({
  limit: '10mb',
  type: 'application/octet-stream'
});

const textParser = bodyParser.text({
  limit: '10mb',
  type: 'text/plain'
});

// ✅ GOOD: Route-specific middleware (recommended pattern)
app.post('/api/users', jsonParser, (req, res) => {
  // Validate input before using
  if (!req.body || typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const name = req.body.name;
  res.json({ message: 'User created', name });
});

app.post('/api/form', urlencodedParser, (req, res) => {
  // Validate input
  if (!req.body || typeof req.body.email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  res.json({ message: 'Form submitted' });
});

app.post('/api/raw', rawParser, (req, res) => {
  // req.body is a Buffer
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  res.json({ message: 'Data received', size: req.body.length });
});

app.post('/api/text', textParser, (req, res) => {
  // req.body is a string
  if (typeof req.body !== 'string') {
    return res.status(400).json({ error: 'Invalid text' });
  }

  res.json({ message: 'Text received', length: req.body.length });
});

// ✅ GOOD: Error handling middleware AFTER routes
// Must have 4 parameters: (err, req, res, next)
app.use((err, req, res, next) => {
  // JSON parse errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON'
    });
  }

  // Size limit errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds size limit'
    });
  }

  // Parameter limit errors (URL-encoded)
  if (err.type === 'parameters.too.many') {
    return res.status(413).json({
      error: 'Too many parameters',
      message: 'URL-encoded body contains too many parameters'
    });
  }

  // Charset errors
  if (err.type === 'charset.unsupported') {
    return res.status(415).json({
      error: 'Unsupported charset',
      message: 'Character encoding not supported'
    });
  }

  // Encoding errors
  if (err.type === 'encoding.unsupported') {
    return res.status(415).json({
      error: 'Unsupported encoding',
      message: 'Content-Encoding not supported'
    });
  }

  // Request aborted
  if (err.type === 'request.aborted') {
    return res.status(400).json({
      error: 'Request aborted',
      message: 'Client aborted request before completion'
    });
  }

  // Default error handler
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Example: Alternative global middleware pattern (less recommended)
function setupGlobalMiddleware() {
  const app2 = express();

  // ✅ GOOD: Still configure limits even with global middleware
  app2.use(bodyParser.json({
    limit: '10mb',
    strict: true
  }));

  app2.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 100,
    depth: 5
  }));

  // Routes
  app2.post('/api/data', (req, res) => {
    if (!req.body) {
      return res.status(400).json({ error: 'No body' });
    }
    res.json({ message: 'Received', data: req.body });
  });

  // ✅ GOOD: Error middleware AFTER routes
  app2.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    next(err);
  });

  return app2;
}

// Export for testing
export { app, setupGlobalMiddleware };
