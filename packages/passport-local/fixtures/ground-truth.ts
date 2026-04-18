/**
 * Ground-truth test fixtures for passport-local behavioral contract.
 *
 * Annotations:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                          — scanner SHOULD NOT flag this
 *
 * New postconditions added in deepen pass 2026-04-18:
 *   - pass-req-callback-signature-mismatch
 *   - missing-body-parser-silent-400
 *   - field-name-mismatch-silent-400
 */

import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// ---------------------------------------------------------------------------
// passReqToCallback signature mismatch
// ---------------------------------------------------------------------------

// @expect-violation: pass-req-callback-signature-mismatch
// passReqToCallback: true but callback uses old (username, password, done) signature.
// req is silently bound to username param — done() is never called.
passport.use('broken-req-callback', new LocalStrategy(
  { passReqToCallback: true },
  async function(username: string, password: string, done: Function) {
    // BUG: 'username' here is actually the req object.
    // 'password' is the actual username string.
    // 'done' is the actual password string.
    // The real 'done' callback was never passed — request hangs forever.
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return done(null, false);
      const ok = await user.comparePassword(password);
      return done(null, ok ? user : false);
    } catch (err) {
      return done(err);
    }
  }
));

// @expect-clean
// passReqToCallback: true with correct (req, username, password, done) signature.
passport.use('correct-req-callback', new LocalStrategy(
  { passReqToCallback: true },
  async function(req: express.Request, username: string, password: string, done: Function) {
    try {
      const tenantId = req.headers['x-tenant-id'];
      const user = await UserModel.findOne({ username, tenantId });
      if (!user) return done(null, false);
      const ok = await user.comparePassword(password);
      return done(null, ok ? user : false);
    } catch (err) {
      return done(err);
    }
  }
));

// ---------------------------------------------------------------------------
// Missing body-parser / field name mismatch (configuration issues)
// These are middleware/configuration-level concerns, documented for completeness.
// The scanner checks strategy configuration; runtime middleware ordering
// is detected by static analysis of middleware registration order.
// ---------------------------------------------------------------------------

// @expect-violation: field-name-mismatch-silent-400
// Form sends 'email' and 'pass' fields but strategy uses default 'username'/'password'.
passport.use('mismatched-fields', new LocalStrategy(
  // No usernameField/passwordField options — defaults to 'username' and 'password'
  async function(username: string, password: string, done: Function) {
    // This function is never called: strategy returns 400 because it can't find
    // req.body.username or req.body.password (form sends 'email' and 'pass').
    try {
      const user = await UserModel.findOne({ email: username });
      if (!user) return done(null, false);
      const ok = await user.comparePassword(password);
      return done(null, ok ? user : false);
    } catch (err) {
      return done(err);
    }
  }
));

// @expect-clean
// Form sends 'email' and 'pass' — correctly configured to match.
passport.use('correct-fields', new LocalStrategy(
  { usernameField: 'email', passwordField: 'pass' },
  async function(email: string, pass: string, done: Function) {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return done(null, false);
      const ok = await user.comparePassword(pass);
      return done(null, ok ? user : false);
    } catch (err) {
      return done(err);
    }
  }
));

// ---------------------------------------------------------------------------
// Pre-existing postconditions (async-verify-error-handling, verify-callback-done)
// ---------------------------------------------------------------------------

// @expect-violation: async-verify-error-handling
// Async verify callback with no try-catch — unhandled promise rejection.
passport.use('no-try-catch', new LocalStrategy(
  async function(username: string, password: string, done: Function) {
    // Missing try-catch — if findOne() throws, it's an unhandled rejection
    const user = await UserModel.findOne({ username });
    if (!user) return done(null, false);
    const ok = await user.comparePassword(password);
    return done(null, ok ? user : false);
  }
));

// @expect-clean
// Correct async verify callback with try-catch.
passport.use('with-try-catch', new LocalStrategy(
  async function(username: string, password: string, done: Function) {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      const ok = await user.comparePassword(password);
      return done(null, ok ? user : false, ok ? undefined : { message: 'Invalid credentials' });
    } catch (err) {
      return done(err);
    }
  }
));

// @expect-violation: authentication-failure-error-type
// Authentication failure returned as Error (causes HTTP 500 instead of 401/redirect).
passport.use('failure-as-error', new LocalStrategy(
  async function(username: string, password: string, done: Function) {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return done(new Error('User not found')); // WRONG: should be done(null, false)
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        return done(new Error('Invalid password')); // WRONG: should be done(null, false)
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// ---------------------------------------------------------------------------
// Placeholder types
// ---------------------------------------------------------------------------

interface IUser {
  comparePassword(password: string): Promise<boolean>;
}

class UserModel {
  static async findOne(_query: Record<string, unknown>): Promise<IUser | null> {
    return null;
  }
}
