/**
 * express-session Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the express-session contract spec.
 *
 * Key contract rules (session instance methods):
 *   - req.session.destroy(callback) — callback MUST check err
 *   - req.session.regenerate(callback) — callback MUST check err (session fixation risk)
 *   - req.session.save(callback) — callback MUST check err (especially before redirects)
 *   - req.session.reload(callback) — callback MUST check err ('failed to load session')
 *
 * express-session uses callback pattern (not Promise), so the scanner looks for
 * callback-based calls where the err argument is not handled.
 */

import session from 'express-session';
import express from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// 1. req.session.destroy — missing error check
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// SHOULD_FIRE: destroy-callback-error-unchecked — callback does not check err
app.post('/logout-bad', (req, res) => {
  req.session.destroy(function(err) {
    // @expect-violation: destroy-callback-error-unchecked
    // err is ignored — if Redis disconnects, session persists in store while
    // client thinks they are logged out (split-brain)
    res.redirect('/login');
  });
});

// SHOULD_FIRE: destroy-no-callback — no callback provided at all
app.post('/logout-no-callback', (req, res) => {
  // @expect-violation: destroy-no-callback
  req.session.destroy();
  res.redirect('/login'); // fires immediately, session may not be destroyed
});

// SHOULD_NOT_FIRE: destroy with proper error handling
app.post('/logout-good', (req, res, next) => {
  req.session.destroy(function(err) {
    // SHOULD_NOT_FIRE: err is checked
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. req.session.regenerate — missing error check (session fixation risk)
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: regenerate-callback-error-unchecked — callback ignores err
app.post('/login-bad', (req, res) => {
  // After authentication succeeds...
  req.session.regenerate(function(err) {
    // @expect-violation: regenerate-callback-error-unchecked
    // err not checked — if store fails, old session ID persists (session fixation)
    req.session.userId = 'user-123';
    res.redirect('/dashboard');
  });
});

// SHOULD_NOT_FIRE: regenerate with proper error check
app.post('/login-good', (req, res, next) => {
  req.session.regenerate(function(err) {
    // SHOULD_NOT_FIRE: err checked before proceeding
    if (err) {
      return next(err);
    }
    req.session.userId = 'user-123';
    req.session.save(function(saveErr) {
      if (saveErr) return next(saveErr);
      res.redirect('/dashboard');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. req.session.save — missing error check before redirect
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: save-callback-error-unchecked — err not checked before redirect
app.post('/profile-update-bad', (req, res) => {
  req.session.username = 'alice';
  req.session.save(function(err) {
    // @expect-violation: save-callback-error-unchecked
    // err ignored — if save fails, username is not persisted but redirect proceeds
    res.redirect('/profile');
  });
});

// SHOULD_FIRE: save-before-redirect-missing — redirect without saving first
app.post('/profile-update-no-save', (req, res) => {
  req.session.username = 'alice';
  // @expect-violation: save-before-redirect-missing
  // Redirecting without explicit save — automatic save may not fire in time
  res.redirect('/profile');
});

// SHOULD_NOT_FIRE: save with proper error check before redirect
app.post('/profile-update-good', (req, res, next) => {
  req.session.username = 'alice';
  req.session.save(function(err) {
    // SHOULD_NOT_FIRE: err checked, redirect inside callback
    if (err) return next(err);
    res.redirect('/profile');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. req.session.reload — missing error check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: reload-session-not-found or reload-store-error — err not checked
app.get('/dashboard-bad', (req, res) => {
  req.session.reload(function(err) {
    // @expect-violation: reload-session-not-found
    // @expect-violation: reload-store-error
    // err ignored — if session expired or store is down, stale data is used
    const userId = req.session.userId;
    res.json({ userId });
  });
});

// SHOULD_NOT_FIRE: reload with proper error handling
app.get('/dashboard-good', (req, res, next) => {
  req.session.reload(function(err) {
    // SHOULD_NOT_FIRE: err checked and handled appropriately
    if (err) {
      if (err.message === 'failed to load session') {
        // Session expired — redirect to login
        return res.redirect('/login');
      }
      return next(err); // store error — propagate
    }
    const userId = req.session.userId;
    res.json({ userId });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Factory function — already contracted, kept for regression
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: missing-secret — session() called without secret
// @expect-violation: missing-secret
const badMiddleware = session({} as any); // TypeScript cast to bypass type-check for test

// SHOULD_NOT_FIRE: session() called with all required options
const goodMiddleware = session({
  secret: process.env.SESSION_SECRET || 'development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, sameSite: 'strict' }
});
