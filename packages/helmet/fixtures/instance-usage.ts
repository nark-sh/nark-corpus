/**
 * Instance Usage for helmet
 *
 * This fixture demonstrates helmet usage in class instances and methods.
 * Should trigger violations where error handling is missing.
 */

import helmet from 'helmet';
import express from 'express';

// ❌ VIOLATION: Class method without error handling
class SecurityMiddleware {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  setupBasicSecurity() {
    // ❌ VIOLATION helmet-001: No error handling around helmet()
    this.app.use(helmet());
  }

  setupCustomCSP() {
    // ❌ VIOLATION helmet-001: No error handling
    // ❌ VIOLATION helmet-004: Using unsafe-inline
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"]  // Defeats XSS protection
        }
      }
    }));
  }

  setupWeakHSTS() {
    // ❌ VIOLATION helmet-007: Short HSTS maxAge
    this.app.use(helmet({
      strictTransportSecurity: {
        maxAge: 3600  // Only 1 hour - too short!
      }
    }));
  }

  disableSecurity() {
    // ❌ VIOLATION helmet-013: Disabling security in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use(helmet({
        contentSecurityPolicy: false,
        strictTransportSecurity: false
      }));
    }
  }

  getApp() {
    return this.app;
  }
}

// ❌ VIOLATION: Arrow function without error handling
const configureHelmet = (app: express.Application) => {
  // ❌ VIOLATION helmet-002: Missing quotes on CSP keywords
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self'],  // Should be ["'self'"]
        scriptSrc: ['self']
      }
    }
  }));
};

// ❌ VIOLATION: Factory function without error handling
function createSecureApp() {
  const app = express();

  // ❌ VIOLATION helmet-006: Misspelled HSTS option
  app.use(helmet({
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubdomains: true  // Should be includeSubDomains
    }
  }));

  return app;
}

// ❌ VIOLATION: Express router without error handling
const router = express.Router();

// ❌ VIOLATION helmet-001: No error handling on router
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"]
    }
  }
}));

// ❌ VIOLATION: Method chaining without error handling
const app = express();
app
  .use(helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "'unsafe-eval'"]  // VIOLATION helmet-005
      }
    }
  }))
  .get('/', (req, res) => {
    res.send('Hello World');
  });

export { SecurityMiddleware, configureHelmet, createSecureApp, router, app };
