/**
 * Missing Error Handling for helmet
 *
 * This fixture demonstrates INCORRECT usage of helmet without error handling.
 * Should trigger MULTIPLE ERROR violations.
 */

import helmet from 'helmet';
import express from 'express';

const app = express();

// ❌ VIOLATION helmet-001: No error handling around helmet()
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  }
}));

// ❌ VIOLATION helmet-002: Missing quotes on CSP keywords
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['self'],  // Should be ["'self'"]
      scriptSrc: ['self', 'none'],  // Should be ["'self'", "'none'"]
      objectSrc: ['none']  // Should be ["'none'"]
    }
  }
}));

// ❌ VIOLATION helmet-003: Invalid CSP directive name
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      invalidDirectiveName: ["'self'"],  // Not a valid CSP directive
      defaultSrc: ["'self'"]
    }
  }
}));

// ❌ VIOLATION helmet-004: Using 'unsafe-inline' weakens XSS protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Defeats XSS protection
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// ❌ VIOLATION helmet-005: Using 'unsafe-eval' weakens XSS protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-eval'"]  // Allows eval()
    }
  }
}));

// ❌ VIOLATION helmet-006: Misspelled HSTS option 'includeSubDomains'
app.use(helmet({
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubdomains: true  // Should be includeSubDomains (capital D)
  }
}));

// ❌ VIOLATION helmet-006: Another misspelling variant
app.use(helmet({
  strictTransportSecurity: {
    maxAge: 31536000,
    include_sub_domains: true  // Should be includeSubDomains (camelCase)
  }
}));

// ❌ VIOLATION helmet-007: Short HSTS maxAge in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    strictTransportSecurity: {
      maxAge: 86400  // Only 1 day - should be at least 1 year (31536000)
    }
  }));
}

// ❌ VIOLATION helmet-009: Invalid crossOriginEmbedderPolicy value
app.use(helmet({
  crossOriginEmbedderPolicy: {
    policy: 'invalid-value'  // Should be 'require-corp' or 'credentialless'
  }
}));

// ❌ VIOLATION helmet-010: Invalid crossOriginOpenerPolicy value
app.use(helmet({
  crossOriginOpenerPolicy: {
    policy: 'invalid-policy'  // Should be 'same-origin', 'same-origin-allow-popups', or 'unsafe-none'
  }
}));

// ❌ VIOLATION helmet-011: Using deprecated helmet 4.x API (will break in v5+)
// @ts-ignore - Deprecated API
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"]
  }
}));

// ❌ VIOLATION helmet-011: Another deprecated API usage
// @ts-ignore - Deprecated API
app.use(helmet.hsts({
  maxAge: 31536000
}));

// ❌ VIOLATION helmet-012: upgrade-insecure-requests enabled in development
if (process.env.NODE_ENV !== 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: []  // Should be disabled in development
      }
    }
  }));
}

// ❌ VIOLATION helmet-013: Security headers disabled in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false,  // CRITICAL: Removes XSS protection in production!
    strictTransportSecurity: false  // CRITICAL: Removes HTTPS enforcement!
  }));
}

// ❌ MULTIPLE VIOLATIONS: Combination of errors
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['self'],  // VIOLATION: Missing quotes
      scriptSrc: ['self', 'unsafe-inline'],  // VIOLATION: Missing quotes + unsafe-inline
      invalidDirective: ["'self'"]  // VIOLATION: Invalid directive name
    }
  },
  strictTransportSecurity: {
    maxAge: 3600,  // VIOLATION: Too short maxAge
    includeSubdomains: true  // VIOLATION: Misspelled option
  }
}));

export { app };
