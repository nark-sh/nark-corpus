/**
 * Fixture: Missing Error Handling for body-parser
 *
 * This fixture demonstrates INCORRECT usage of body-parser with:
 * - NO error handling middleware
 * - NO size limits configured
 * - NO parameter limits configured
 * - NO depth limits configured
 *
 * Expected: Multiple ERROR violations for missing error handling
 * Expected: Multiple WARNING violations for missing configuration
 */

import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// ❌ BAD: No limits configured, uses defaults
// Violation: body-parser-002 (no size limit)
const jsonParser = bodyParser.json();

// ❌ BAD: No parameterLimit, no depth limit
// Violation: body-parser-003 (no parameter limit)
// Violation: body-parser-004 (no depth limit)
const urlencodedParser = bodyParser.urlencoded({ extended: true });

// ❌ BAD: No size limit
const rawParser = bodyParser.raw();

// ❌ BAD: No size limit
const textParser = bodyParser.text();

// ❌ BAD: Global middleware without limits
// Violation: body-parser-002 (no size limit)
app.use(bodyParser.json());

// ❌ BAD: No parameter or depth limits
// Violation: body-parser-003 (no parameter limit)
// Violation: body-parser-004 (no depth limit)
app.use(bodyParser.urlencoded({ extended: true }));

// Routes that will crash on malformed input
app.post('/api/users', (req, res) => {
  // ❌ BAD: No input validation
  // Violation: body-parser-005 (no validation)
  // This will crash if req.body.name is undefined or not a string!
  const name = req.body.name.toString();
  res.json({ message: 'User created', name });
});

app.post('/api/form', (req, res) => {
  // ❌ BAD: No validation, directly accessing properties
  // Violation: body-parser-005 (no validation)
  const email = req.body.email; // May be undefined!
  const password = req.body.password; // May be undefined!

  // This will crash if email doesn't have toLowerCase method
  const normalizedEmail = email.toLowerCase();

  res.json({ message: 'Form submitted', email: normalizedEmail });
});

app.post('/api/data', (req, res) => {
  // ❌ BAD: Directly using req.body without validation
  // Violation: body-parser-005 (no validation)
  res.json({ received: req.body });
});

app.post('/api/unsafe', (req, res) => {
  // ❌ BAD: Prototype pollution risk - no validation
  // Violation: body-parser-005 (no validation)
  const data = req.body;

  // This could be exploited for prototype pollution
  Object.assign({}, data);

  res.json({ message: 'Data processed' });
});

// ❌ CRITICAL: NO ERROR HANDLING MIDDLEWARE!
// Violation: body-parser-001 (missing error handling)
// Application will CRASH on:
// - Malformed JSON
// - Payload exceeding default 100kb limit
// - Unsupported charset
// - Request aborted
// - Any other parsing error

// Example: Alternative pattern that's also wrong
function setupBadGlobalMiddleware() {
  const app2 = express();

  // ❌ BAD: No configuration, no limits
  // Violations: body-parser-002, body-parser-003, body-parser-004
  app2.use(bodyParser.json());
  app2.use(bodyParser.urlencoded({ extended: true }));

  app2.post('/api/test', (req, res) => {
    // ❌ BAD: No validation
    // Violation: body-parser-005
    res.json(req.body);
  });

  // ❌ BAD: No error middleware!
  // Violation: body-parser-001

  return app2;
}

// Example: Wrong error middleware signature (doesn't work!)
function setupBrokenErrorMiddleware() {
  const app3 = express();

  app3.use(bodyParser.json());

  app3.post('/api/data', (req, res) => {
    res.json(req.body);
  });

  // ❌ WRONG: Only 3 parameters - this is NOT error middleware!
  // This middleware will NEVER catch errors from body-parser
  // Violation: body-parser-001 (still missing proper error handling)
  app3.use((req, res, next) => {
    // This is regular middleware, not error middleware
    // Error middleware MUST have 4 parameters: (err, req, res, next)
    res.status(500).json({ error: 'This never gets called for errors!' });
  });

  return app3;
}

// Example: Error middleware in wrong place
function setupWrongOrderMiddleware() {
  const app4 = express();

  app4.use(bodyParser.json());

  // ❌ WRONG: Error middleware BEFORE routes
  // This won't catch route errors!
  app4.use((err, req, res, next) => {
    res.status(500).json({ error: 'Too early!' });
  });

  // Routes defined AFTER error middleware
  app4.post('/api/data', (req, res) => {
    res.json(req.body);
  });

  // Error middleware should be LAST, after all routes!
  // Violation: body-parser-001 (improper error handling placement)

  return app4;
}

// Example: Overly permissive Content-Type
function setupPermissiveContentType() {
  const app5 = express();

  // ❌ BAD: Too permissive - accepts any Content-Type
  // Violation: body-parser-008 (overly permissive type)
  app5.use(bodyParser.json({ type: '*/*' }));

  app5.post('/api/data', (req, res) => {
    res.json(req.body);
  });

  // ❌ BAD: Still no error middleware
  // Violation: body-parser-001

  return app5;
}

// Export for testing
export { app, setupBadGlobalMiddleware, setupBrokenErrorMiddleware, setupWrongOrderMiddleware, setupPermissiveContentType };
