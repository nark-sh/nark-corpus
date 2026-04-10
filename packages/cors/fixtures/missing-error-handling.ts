/**
 * CORS Fixtures - Missing Error Handling / Security Issues
 *
 * This file demonstrates INCORRECT CORS configuration patterns.
 * These SHOULD trigger violations.
 */

import express from 'express';
import cors from 'cors';

const app = express();

// ❌ VIOLATION: Wildcard origin (default) - bypasses CORS protection
// Should trigger: CORS_WILDCARD_ORIGIN_PRODUCTION
app.use(cors());

// ❌ VIOLATION: Explicit wildcard origin - bypasses CORS protection
// Should trigger: CORS_WILDCARD_ORIGIN_PRODUCTION
app.use(cors({ origin: '*' }));

// ❌ VIOLATION: Origin reflection without validation - bypasses CORS
// Should trigger: CORS_ORIGIN_REFLECTION_NO_VALIDATION
app.use(cors({ origin: true }));

// ❌ VIOLATION: Credentials with wildcard - invalid configuration
// Should trigger: CORS_CREDENTIALS_WITH_WILDCARD
app.use(cors({
  origin: '*',
  credentials: true
}));

// ❌ VIOLATION: Credentials with wildcard (reversed property order)
// Should trigger: CORS_CREDENTIALS_WITH_WILDCARD
app.use(cors({
  credentials: true,
  origin: '*'
}));

// ❌ VIOLATION: Invalid regex pattern - unescaped dot
// Should trigger: CORS_INVALID_ORIGIN_REGEX_PATTERN (if analyzer supports regex analysis)
app.use(cors({
  origin: /.example.com$/  // Missing backslash - matches "xexample.com"
}));

// ❌ VIOLATION: Missing error handling in validation callback
// Should trigger: CORS_MISSING_ORIGIN_VALIDATION_ERROR_HANDLING (if analyzer supports callback analysis)
const allowedOrigins = ['https://example.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);  // Silent failure - no error passed
    }
  }
}));

// ❌ VIOLATION: Origin validation callback with no error handling at all
// Should trigger: CORS_MISSING_ORIGIN_VALIDATION_ERROR_HANDLING
app.use(cors({
  origin: (origin, callback) => {
    // No validation, just allows everything
    callback(null, true);
  }
}));

// ❌ VIOLATION: Missing preflight handler for DELETE
// Should trigger: CORS_MISSING_PREFLIGHT_HANDLER (if analyzer supports control flow)
app.delete('/api/resource/:id', cors(), (req, res) => {
  // Missing: app.options('/api/resource/:id', cors());
  res.json({ message: 'Deleted' });
});

// ❌ VIOLATION: Missing preflight handler for PUT
// Should trigger: CORS_MISSING_PREFLIGHT_HANDLER
app.put('/api/resource/:id', cors(), (req, res) => {
  // Missing OPTIONS handler
  res.json({ message: 'Updated' });
});

// ❌ VIOLATION: Missing preflight handler for PATCH
// Should trigger: CORS_MISSING_PREFLIGHT_HANDLER
app.patch('/api/resource/:id', cors(), (req, res) => {
  // Missing OPTIONS handler
  res.json({ message: 'Patched' });
});

// ❌ VIOLATION: Wrong middleware order - CORS after body parser
// Should trigger: CORS_WRONG_MIDDLEWARE_ORDER (if analyzer supports middleware order analysis)
const app2 = express();
app2.use(express.json());
app2.use(express.urlencoded({ extended: true }));
app2.use(cors());  // Too late - should be before body parsers

// ❌ VIOLATION: Wildcard for authenticated endpoint (conceptual mistake)
app.get('/api/user/profile', cors({ origin: '*' }), (req, res) => {
  // Using wildcard CORS for authenticated endpoint is a security mistake
  // Should use specific origins with credentials
  res.json({ user: 'data' });
});

// ❌ VIOLATION: Origin reflection with credentials
app.use(cors({
  origin: true,  // Reflects any origin
  credentials: true  // With credentials - extremely dangerous
}));

// ❌ VIOLATION: Multiple unescaped dots in regex
app.use(cors({
  origin: /.example.com|.staging.example.com$/
}));

// ❌ VIOLATION: Callback that doesn't validate null origin
app.use(cors({
  origin: (origin, callback) => {
    // Doesn't handle null origin (from non-browser clients)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
}));

// ❌ VIOLATION: Async callback without error handling
app.use(cors({
  origin: async (origin, callback) => {
    // No try-catch - if database call fails, it will crash
    // const allowed = await db.isOriginAllowed(origin);
    const allowed = true;
    callback(null, allowed);
  }
}));

export default app;
