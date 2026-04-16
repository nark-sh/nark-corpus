/**
 * Ground-truth fixtures for passport contract deepening pass (2026-04-13).
 * Tests for new postconditions: logIn, logout, session, authorize, serializeUser, deserializeUser.
 *
 * Annotations:
 *   // @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   // @expect-clean                           — scanner MUST NOT flag this
 */

import passport from 'passport';
import express, { Request, Response, NextFunction } from 'express';

const app = express();

// ─── req.logIn fixtures ─────────────────────────────────────────────────────

// @expect-violation: login-missing-callback
// @expect-violation: login-session-save-error
// Calling req.logIn without a callback — throws synchronously in passport >= 0.6
function loginWithoutCallback(req: Request, user: Express.User) {
  // ❌ No callback provided — throws Error('req#login requires a callback function')
  (req as any).logIn(user);
}

// @expect-violation: login-session-save-error
// @expect-violation: login-serialize-error
// Calling req.logIn and ignoring the error in the callback
function loginIgnoringError(req: Request, res: Response, user: Express.User) {
  req.logIn(user, function(err) {
    // ❌ err is ignored — session save or serialize failure swallowed silently
    res.json({ success: true });
  });
}

// @expect-clean
// Correct req.logIn usage — checks err and forwards to next(err)
function loginWithProperErrorHandling(req: Request, res: Response, next: NextFunction, user: Express.User) {
  req.logIn(user, function(err) {
    if (err) { return next(err); }
    res.json({ user: req.user });
  });
}

// @expect-clean
// req.logIn with session:false — no callback needed for stateless API auth
function loginStateless(req: Request, res: Response, user: Express.User) {
  req.logIn(user, { session: false }, function(err) {
    if (err) { return; }
    res.json({ user });
  });
}

// ─── req.logout fixtures ───────────────────────────────────────────────────

// @expect-violation: logout-missing-callback
// req.logout() called without a callback — throws in passport >= 0.6
app.post('/logout-no-callback', function(req, res) {
  // ❌ Missing callback — throws Error('req#logout requires a callback function')
  req.logout({} as any);
  res.redirect('/');
});

// @expect-violation: logout-session-save-error
// req.logout() with callback that ignores the error
app.post('/logout-ignore-error', function(req, res) {
  req.logout(function(err) {
    // ❌ err is ignored — session may not be destroyed in the store
    res.redirect('/');
  });
});

// @expect-clean
// Correct req.logout usage
app.post('/logout-correct', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// ─── passport.session() / deserializeUser fixtures ──────────────────────────

// @expect-violation: session-deserialize-error
// deserializeUser that conflates database errors with "user not found"
passport.deserializeUser(function(id: unknown, done: (err: any, user?: any) => void) {
  // ❌ Any DB error causes done(false) instead of done(err) — masks errors as "not found"
  // (wrong: should call done(err) for database errors, done(null, false) for not-found)
  try {
    // simulate DB call that throws
    const user = null;
    done(null, user);
  } catch (err) {
    done(null, false); // ❌ swallows real database errors as "user not found"
  }
});

// @expect-violation: deserialize-database-error
// deserializeUser that calls done(err) for all errors — correct error propagation
// but demonstrates the amplified impact: fires on every authenticated request
passport.deserializeUser(function(id: unknown, done: (err: any, user?: any) => void) {
  // ❌ No error handling around the DB call — any exception leaks as uncaught
  const userId = id as number;
  // hypothetical sync DB call that can throw
  const user = { id: userId, name: 'test' };
  done(null, user);
});

// @expect-clean
// Correct deserializeUser — distinguishes DB errors from "user not found"
passport.deserializeUser(function(id: unknown, done: (err: any, user?: any) => void) {
  try {
    const userId = id as number;
    if (!userId) {
      return done(null, false); // user not found — not an error
    }
    const user = { id: userId, name: 'test' };
    done(null, user);
  } catch (err) {
    done(err); // DB error — propagate to error handler
  }
});

// ─── serializeUser fixtures ──────────────────────────────────────────────────

// @expect-violation: serialize-chain-failure
// serializeUser that calls done without an ID in some code paths
passport.serializeUser(function(user: Express.User, done: (err: any, id?: any) => void) {
  const u = user as any;
  if (u.id) {
    done(null, u.id);
  }
  // ❌ Falls through without calling done() when user.id is falsy
  // Chain exhaustion: 'Failed to serialize user into session'
});

// @expect-clean
// Correct serializeUser — always calls done
passport.serializeUser(function(user: Express.User, done: (err: any, id?: any) => void) {
  const u = user as any;
  if (!u.id) {
    return done(new Error('User has no ID — cannot serialize'));
  }
  done(null, u.id);
});

// ─── passport.authorize() fixtures ───────────────────────────────────────────

// @expect-violation: authorize-strategy-error
// Using authorize() without any callback or failureRedirect — strategy errors silently ignored
app.get('/oauth/callback/github',
  passport.authorize('github', { session: false }),
  function(req, res) {
    // ❌ If strategy errors, next(err) is called but no error handler is mounted
    const account = (req as any).account;
    res.json({ account });
  }
);

// @expect-clean
// Correct authorize() usage with callback
app.get('/oauth/callback/twitter',
  (req, res, next) => {
    passport.authorize('twitter', function(err: any, user: any, info: any) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/settings?error=auth_failed'); }
      const account = (req as any).account;
      // Link account to req.user here
      res.redirect('/settings');
    })(req, res, next);
  }
);

export { app };
