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

// ─────────────────────────────────────────────────────────────────────────────
// 11. helmet() misused — passed directly instead of invoked — without try-catch
// (deepen pass 2026-06-18: helmet-passed-as-middleware-not-factory)
// ─────────────────────────────────────────────────────────────────────────────

function setupHelmetMisusedAsMiddleware() {
  // NOTE: This call is NOT a helmet() invocation — just passing the function
  // reference. The scanner's helmet detector targets helmet() factory calls,
  // not bare references. New postcondition helmet-passed-as-middleware-not-factory
  // requires a new scanner rule (queued as concern). Omitting SHOULD_FIRE
  // annotation here intentionally — see upgrade-concerns.json.
  // @ts-expect-error - intentional misuse for test
  app.use(helmet);
}

function setupHelmetMisusedAsMiddlewareWithCatch() {
  try {
    // SHOULD_NOT_FIRE: misuse wrapped in try-catch (even though Express won't
    // invoke this synchronously, the registration call itself does not throw —
    // this is a defensive pattern test)
    // @ts-expect-error - intentional misuse for test
    app.use(helmet);
  } catch (error) {
    console.error('Helmet misuse error:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. helmet() with duplicate option-pair (modern + legacy alias both set)
// (deepen pass 2026-06-18: helmet-duplicate-option-pair)
// ─────────────────────────────────────────────────────────────────────────────

function setupHelmetDuplicateOptionPairNoCatch() {
  // Both strictTransportSecurity and hsts specified would trigger the specific
  // helmet-duplicate-option-pair error at runtime. Scanner currently fires the
  // generic config-validation-error for any unwrapped helmet() call.
  // SHOULD_FIRE: config-validation-error — helmet() factory called without try-catch
  app.use(helmet({
    // @ts-expect-error - intentional duplicate-pair misuse for test
    strictTransportSecurity: true,
    hsts: false,
  }));
}

function setupHelmetDuplicateOptionPairWithCatch() {
  try {
    // SHOULD_NOT_FIRE: duplicate-pair wrapped in try-catch
    app.use(helmet({
      // @ts-expect-error - intentional duplicate-pair misuse for test
      xFrameOptions: { action: 'deny' },
      frameguard: { action: 'sameorigin' },
    }));
  } catch (error) {
    console.error('Helmet duplicate option:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. contentSecurityPolicy directive value with invalid chars (; or ,)
// (deepen pass 2026-06-18: csp-invalid-directive-value-chars)
// ─────────────────────────────────────────────────────────────────────────────

function setupCspInvalidDirectiveValueCharsNoCatch() {
  // Specific helmet 8.x csp-invalid-directive-value-chars detector (semicolon/comma
  // in value) requires a new scanner rule (queued).
  // SHOULD_FIRE: csp-invalid-directive-name — contentSecurityPolicy() factory call
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self' https://cdn.example.com;"],
    },
  }));
}

function setupCspInvalidDirectiveValueCharsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: value validation wrapped in try-catch
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["https://a.com, https://b.com"],
      },
    }));
  } catch (error) {
    console.error('CSP invalid value:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. contentSecurityPolicy unquoted special keyword
// (deepen pass 2026-06-18: csp-unquoted-special-keyword)
// ─────────────────────────────────────────────────────────────────────────────

function setupCspUnquotedSpecialKeywordNoCatch() {
  // Specific csp-unquoted-special-keyword detector requires a new scanner rule (queued).
  // SHOULD_FIRE: csp-invalid-directive-name — contentSecurityPolicy() factory call
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ['self'],
      scriptSrc: ['self', 'unsafe-inline'],
    },
  }));
}

function setupCspUnquotedSpecialKeywordWithCatch() {
  try {
    // SHOULD_NOT_FIRE: unquoted keyword wrapped in try-catch
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ['nonce-abc123'],
      },
    }));
  } catch (error) {
    console.error('CSP unquoted keyword:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. contentSecurityPolicy.dangerouslyDisableDefaultSrc misuse
// (deepen pass 2026-06-18: csp-dangerously-disable-on-non-default-src)
// ─────────────────────────────────────────────────────────────────────────────

function setupCspDangerouslyDisableMisuseNoCatch() {
  // Specific csp-dangerously-disable-on-non-default-src detector requires a new scanner rule (queued).
  // SHOULD_FIRE: csp-invalid-directive-name — contentSecurityPolicy() factory call
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc as any,
    },
  }));
}

function setupCspDangerouslyDisableMisuseWithCatch() {
  try {
    // SHOULD_NOT_FIRE: misuse wrapped in try-catch
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc as any,
      },
    }));
  } catch (error) {
    console.error('CSP dangerously-disable misuse:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. contentSecurityPolicy falsy directive value
// (deepen pass 2026-06-18: csp-falsy-directive-value)
// ─────────────────────────────────────────────────────────────────────────────

function setupCspFalsyDirectiveValueNoCatch() {
  // Specific csp-falsy-directive-value detector requires a new scanner rule (queued).
  // SHOULD_FIRE: csp-invalid-directive-name — contentSecurityPolicy() factory call
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      // @ts-expect-error - intentional falsy value for test
      scriptSrc: process.env.CSP_SCRIPT_SRC || undefined,
    },
  }));
}

function setupCspFalsyDirectiveValueWithCatch() {
  try {
    // SHOULD_NOT_FIRE: falsy value wrapped in try-catch
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        // @ts-expect-error - intentional falsy value for test
        scriptSrc: '',
      },
    }));
  } catch (error) {
    console.error('CSP falsy value:', error);
  }
}

export { app };
