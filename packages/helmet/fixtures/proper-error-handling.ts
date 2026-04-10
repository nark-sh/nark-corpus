/**
 * Proper Error Handling for helmet
 *
 * This fixture demonstrates CORRECT usage of helmet with proper error handling.
 * Should NOT trigger any violations.
 */

import helmet from 'helmet';
import express from 'express';
import * as crypto from 'crypto';

const app = express();

// ✅ CORRECT: Basic helmet usage with error handling
try {
  app.use(helmet());
} catch (error) {
  console.error('Helmet configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: Custom CSP with proper error handling and quoted keywords
try {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],  // Properly quoted
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],  // Properly quoted
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }));
} catch (error) {
  console.error('CSP configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: HSTS with proper spelling and error handling
try {
  app.use(helmet({
    strictTransportSecurity: {
      maxAge: 31536000,  // 1 year - recommended
      includeSubDomains: true,  // Correct spelling (capital D)
      preload: true
    }
  }));
} catch (error) {
  console.error('HSTS configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: Nonce-based CSP (most secure pattern)
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

try {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
      }
    }
  }));
} catch (error) {
  console.error('Nonce-based CSP configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: Environment-specific configuration with error handling
const isProduction = process.env.NODE_ENV === 'production';

try {
  app.use(helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"]
      }
    } : false,  // Disable CSP in development
    strictTransportSecurity: isProduction ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,  // Disable HSTS in development
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: isProduction ? [] : null  // Disable in dev
      }
    }
  }));
} catch (error) {
  console.error('Environment-specific helmet configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: Cross-origin policies with valid values and error handling
try {
  app.use(helmet({
    crossOriginEmbedderPolicy: { policy: 'require-corp' },  // Valid policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },  // Valid policy
    crossOriginResourcePolicy: { policy: 'same-origin' }  // Valid policy
  }));
} catch (error) {
  console.error('Cross-origin policy configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: Referrer policy with valid value and error handling
try {
  app.use(helmet({
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }  // Valid policy
  }));
} catch (error) {
  console.error('Referrer policy configuration error:', error);
  process.exit(1);
}

// ✅ CORRECT: X-Frame-Options with error handling
try {
  app.use(helmet({
    xFrameOptions: { action: 'DENY' }  // Valid action
  }));
} catch (error) {
  console.error('X-Frame-Options configuration error:', error);
  process.exit(1);
}

export { app };
