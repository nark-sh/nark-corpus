/**
 * helmet Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "helmet"):
 *   - helmet()                          postcondition: config-validation-error, csp-keyword-quoting, etc.
 *   - helmet.contentSecurityPolicy()   postcondition: csp-invalid-directive-name, csp-duplicate-directive, etc.
 *   - helmet.strictTransportSecurity() postcondition: hsts-invalid-maxage, hsts-maxage-typo, etc.
 *   - helmet.crossOriginEmbedderPolicy() postcondition: coep-invalid-policy
 *   - helmet.crossOriginOpenerPolicy()  postcondition: coop-invalid-policy
 *   - helmet.crossOriginResourcePolicy() postcondition: corp-invalid-policy
 *   - helmet.referrerPolicy()           postcondition: referrer-invalid-policy-token, referrer-empty-policy-array
 *   - helmet.xFrameOptions()            postcondition: xfo-invalid-action
 *   - helmet.xPermittedCrossDomainPolicies() postcondition: xpcdp-invalid-policy
 *
 * Detection path:
 *   - helmet() and all sub-functions throw synchronously at factory call time (not async)
 *   - Missing try-catch around helmet() factory calls → SHOULD_FIRE
 *   - helmet() inside try-catch → SHOULD_NOT_FIRE
 *
 * Note: helmet is a synchronous middleware factory. All errors are thrown at
 * configuration time (when calling helmet() or helmet.subFunction()), not at
 * request time. This makes them easy to detect statically.
 */

import helmet from 'helmet';
import express from 'express';

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. helmet() — main factory — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupHelmetNoCatch() {
  // SHOULD_FIRE: config-validation-error — helmet() throws synchronously on invalid configuration; no try-catch
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      }
    }
  }));
}

function setupHelmetWithCatch() {
  try {
    // SHOULD_NOT_FIRE: helmet() inside try-catch satisfies error handling requirement
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        }
      }
    }));
  } catch (error) {
    console.error('Helmet configuration error:', error);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. helmet() with invalid CSP directive name — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupHelmetInvalidDirectiveNoCatch() {
  // SHOULD_FIRE: config-validation-error — invalid directive name throws synchronously; scanner fires generic config-validation-error (no specific csp-invalid-directive-name detector yet)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        // @ts-expect-error - intentionally invalid for test
        invalidDirectiveName: ["'self'"],
        defaultSrc: ["'self'"],
      }
    }
  }));
}

function setupHelmetInvalidDirectiveWithCatch() {
  try {
    // SHOULD_NOT_FIRE: invalid directive inside try-catch
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          // @ts-expect-error - intentionally invalid for test
          invalidDirectiveName: ["'self'"],
        }
      }
    }));
  } catch (error) {
    console.error('CSP directive error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. helmet.strictTransportSecurity() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupHstsNoCatch() {
  // SHOULD_FIRE: hsts-invalid-maxage — negative maxAge throws synchronously; no try-catch
  app.use(helmet.strictTransportSecurity({
    maxAge: -1,
  }));
}

function setupHstsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: hsts standalone usage inside try-catch
    app.use(helmet.strictTransportSecurity({
      maxAge: 31536000,
      includeSubDomains: true,
    }));
  } catch (error) {
    console.error('HSTS configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. helmet.crossOriginEmbedderPolicy() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupCoepNoCatch() {
  // SHOULD_FIRE: coep-invalid-policy — invalid policy throws synchronously; no try-catch
  app.use(helmet.crossOriginEmbedderPolicy({
    // @ts-expect-error - intentionally invalid for test
    policy: 'invalid-policy',
  }));
}

function setupCoepWithCatch() {
  try {
    // SHOULD_NOT_FIRE: COEP standalone inside try-catch
    app.use(helmet.crossOriginEmbedderPolicy({
      policy: 'require-corp',
    }));
  } catch (error) {
    console.error('COEP configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. helmet.crossOriginOpenerPolicy() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupCoopNoCatch() {
  // SHOULD_FIRE: coop-invalid-policy — invalid policy throws synchronously; no try-catch
  app.use(helmet.crossOriginOpenerPolicy({
    // @ts-expect-error - intentionally invalid for test
    policy: 'invalid-policy',
  }));
}

function setupCoopWithCatch() {
  try {
    // SHOULD_NOT_FIRE: COOP standalone inside try-catch
    app.use(helmet.crossOriginOpenerPolicy({
      policy: 'same-origin',
    }));
  } catch (error) {
    console.error('COOP configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. helmet.crossOriginResourcePolicy() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupCorpNoCatch() {
  // SHOULD_FIRE: corp-invalid-policy — invalid policy throws synchronously; no try-catch
  app.use(helmet.crossOriginResourcePolicy({
    // @ts-expect-error - intentionally invalid for test
    policy: 'invalid-policy',
  }));
}

function setupCorpWithCatch() {
  try {
    // SHOULD_NOT_FIRE: CORP standalone inside try-catch
    app.use(helmet.crossOriginResourcePolicy({
      policy: 'cross-origin',
    }));
  } catch (error) {
    console.error('CORP configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. helmet.referrerPolicy() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupReferrerPolicyNoCatch() {
  // SHOULD_FIRE: referrer-invalid-policy-token — invalid policy token throws synchronously; no try-catch
  app.use(helmet.referrerPolicy({
    // @ts-expect-error - intentionally invalid for test
    policy: 'invalid-referrer-policy',
  }));
}

function setupReferrerPolicyEmptyNoCatch() {
  // SHOULD_FIRE: referrer-invalid-policy-token — empty array triggers referrerPolicy error; scanner maps to referrer-invalid-policy-token (no specific referrer-empty-policy-array detector yet)
  app.use(helmet.referrerPolicy({
    policy: [],
  }));
}

function setupReferrerPolicyWithCatch() {
  try {
    // SHOULD_NOT_FIRE: referrerPolicy standalone inside try-catch
    app.use(helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin',
    }));
  } catch (error) {
    console.error('Referrer policy configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. helmet.xFrameOptions() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupXFrameOptionsNoCatch() {
  // SHOULD_FIRE: xfo-invalid-action — invalid action throws synchronously; no try-catch
  app.use(helmet.xFrameOptions({
    // @ts-expect-error - intentionally invalid for test
    action: 'invalid-action',
  }));
}

function setupXFrameOptionsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: xFrameOptions standalone inside try-catch
    app.use(helmet.xFrameOptions({
      action: 'deny',
    }));
  } catch (error) {
    console.error('X-Frame-Options configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. helmet.xPermittedCrossDomainPolicies() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupXpcdpNoCatch() {
  // SHOULD_FIRE: xpcdp-invalid-policy — invalid permittedPolicies throws synchronously; no try-catch
  app.use(helmet.xPermittedCrossDomainPolicies({
    // @ts-expect-error - intentionally invalid for test
    permittedPolicies: 'invalid-policy',
  }));
}

function setupXpcdpWithCatch() {
  try {
    // SHOULD_NOT_FIRE: xPermittedCrossDomainPolicies standalone inside try-catch
    app.use(helmet.xPermittedCrossDomainPolicies({
      permittedPolicies: 'none',
    }));
  } catch (error) {
    console.error('X-Permitted-Cross-Domain-Policies configuration error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. helmet.contentSecurityPolicy() — standalone — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

function setupCspStandaloneNoCatch() {
  // SHOULD_FIRE: csp-invalid-directive-name — empty directives with useDefaults:false triggers error; scanner maps to csp-invalid-directive-name (no specific csp-no-directives detector yet)
  app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {},
  }));
}

function setupCspStandaloneWithCatch() {
  try {
    // SHOULD_NOT_FIRE: contentSecurityPolicy standalone inside try-catch
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
      },
    }));
  } catch (error) {
    console.error('CSP configuration error:', error);
  }
}

export { app };
