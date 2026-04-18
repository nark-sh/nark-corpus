/**
 * passport-jwt Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "passport-jwt"):
 *   - new Strategy(options, verify)     postconditions:
 *       missing-secret-throws               — both secretOrKey and secretOrKeyProvider absent
 *       both-secret-and-provider-throws     — both secretOrKey AND secretOrKeyProvider present
 *       missing-verify-callback-throws      — verify callback not provided
 *       missing-jwt-from-request-throws     — jwtFromRequest not provided
 *       verify-callback-db-error            — db error not passed to done()
 *       token-invalid-or-expired            — token validation failure
 *       token-extraction-fails              — extractor returns null
 *   - ExtractJwt.fromExtractors(extractors) postconditions:
 *       from-extractors-non-array-throws    — non-array passed to fromExtractors
 *
 * Detection notes:
 *   - passport-jwt uses callback pattern (done()), not async/await.
 *   - The scanner detects the constructor call and configuration patterns.
 *   - Synchronous throws during construction require static analysis of options.
 *   - Most postconditions in this package are synchronous init-time errors,
 *     not async runtime errors — scanner concern queued for constructor analysis.
 *
 * IMPORTANT: Due to the callback-based verify pattern, the scanner currently cannot
 * detect missing try-catch in the verify callback. The ground-truth tests below
 * annotate what SHOULD be detected once scanner support is implemented.
 */

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// Placeholder user model
declare const User: { findById(id: string): Promise<{ id: string } | null> };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Strategy construction — proper configuration
// ─────────────────────────────────────────────────────────────────────────────

export function setupJwtStrategyCorrect() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
  };

  // SHOULD_NOT_FIRE: Proper configuration — secretOrKey + jwtFromRequest + verify callback
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.sub);
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Strategy construction — missing secretOrKey (sync throw at init time)
// ─────────────────────────────────────────────────────────────────────────────

export function setupStrategyMissingSecret() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // MISSING: secretOrKey or secretOrKeyProvider
  } as any;

  // SHOULD_FIRE: missing-secret-throws — no secretOrKey or secretOrKeyProvider
  // Throws: TypeError: JwtStrategy requires a secret or key
  passport.use(new JwtStrategy(opts, function(jwt_payload: any, done: any) {
    done(null, { id: jwt_payload.sub });
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Strategy construction — both secretOrKey and secretOrKeyProvider (conflict)
// ─────────────────────────────────────────────────────────────────────────────

export function setupStrategyBothSecrets() {
  const myProvider = (req: any, rawToken: any, done: any) => done(null, 'my-key');

  // SHOULD_FIRE: both-secret-and-provider-throws — providing both secretOrKey and secretOrKeyProvider
  // Throws: TypeError: JwtStrategy has been given both a secretOrKey and a secretOrKeyProvider
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'static-secret',
    secretOrKeyProvider: myProvider,
  } as any;
  passport.use(new JwtStrategy(opts, function(jwt_payload: any, done: any) {
    done(null, { id: jwt_payload.sub });
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Strategy construction — missing jwtFromRequest (sync throw at init time)
// ─────────────────────────────────────────────────────────────────────────────

export function setupStrategyMissingJwtFromRequest() {
  // SHOULD_FIRE: missing-jwt-from-request-throws — jwtFromRequest not provided
  // Throws: TypeError: JwtStrategy requires a function to retrieve jwt from requests
  const opts = {
    secretOrKey: 'secret',
    // MISSING: jwtFromRequest
  } as any;
  passport.use(new JwtStrategy(opts, function(jwt_payload: any, done: any) {
    done(null, { id: jwt_payload.sub });
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Verify callback — missing try-catch around database lookup
// ─────────────────────────────────────────────────────────────────────────────

export function setupStrategyMissingVerifyTryCatch() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
  };

  // SHOULD_FIRE: verify-callback-db-error — async db call without try-catch in verify
  // If User.findById rejects, the rejection propagates as uncaught and crashes
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    // No try-catch — if findById throws, error is swallowed by passport's catch
    // but done() is never called, leaving the request hanging
    const user = await User.findById(jwt_payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ExtractJwt.fromExtractors — non-array argument
// ─────────────────────────────────────────────────────────────────────────────

export function setupExtractorWrongType() {
  // SHOULD_FIRE: from-extractors-non-array-throws — passing a function directly instead of array
  // Throws: TypeError: extractors.fromExtractors expects an array
  const extractor = ExtractJwt.fromExtractors(
    ExtractJwt.fromAuthHeaderAsBearerToken() as any
  );
  return extractor;
}

export function setupExtractorCorrect() {
  // SHOULD_NOT_FIRE: fromExtractors called with array — correct usage
  const extractor = ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromUrlQueryParameter('token'),
  ]);
  return extractor;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Complete multi-extractor setup — correct pattern
// ─────────────────────────────────────────────────────────────────────────────

export function setupStrategyMultiExtractor() {
  // SHOULD_NOT_FIRE: Proper multi-extractor setup with correct configuration
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromUrlQueryParameter('access_token'),
    ]),
    secretOrKey: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
  };
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.sub);
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }));
}
