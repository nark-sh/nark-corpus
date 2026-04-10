/**
 * CORS Fixtures - Instance Usage Patterns
 *
 * This file demonstrates instance-based CORS usage patterns,
 * including both correct and incorrect configurations.
 */

import express from 'express';
import cors from 'cors';

// Pattern 1: Class-based middleware setup (INCORRECT)
class ApiServerIncorrect {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupCors();
  }

  private setupCors() {
    // ❌ VIOLATION: Wildcard origin in instance method
    // Should trigger: CORS_WILDCARD_ORIGIN_PRODUCTION
    this.app.use(cors({ origin: '*' }));
  }

  public start(port: number) {
    this.app.listen(port);
  }
}

// Pattern 2: Class-based middleware setup (CORRECT)
class ApiServerCorrect {
  private app: express.Application;
  private allowedOrigins: string[];

  constructor(allowedOrigins: string[]) {
    this.app = express();
    this.allowedOrigins = allowedOrigins;
    this.setupCors();
  }

  private setupCors() {
    // ✅ CORRECT: Whitelist origins
    this.app.use(cors({
      origin: this.allowedOrigins,
      credentials: true
    }));
  }

  public start(port: number) {
    this.app.listen(port);
  }
}

// Pattern 3: Middleware factory (INCORRECT)
class CorsMiddlewareFactory {
  static createDefault() {
    // ❌ VIOLATION: Default CORS (wildcard)
    // Should trigger: CORS_WILDCARD_ORIGIN_PRODUCTION
    return cors();
  }

  static createWithCredentials() {
    // ❌ VIOLATION: Wildcard with credentials
    // Should trigger: CORS_CREDENTIALS_WITH_WILDCARD
    return cors({
      origin: '*',
      credentials: true
    });
  }

  static createReflective() {
    // ❌ VIOLATION: Origin reflection
    // Should trigger: CORS_ORIGIN_REFLECTION_NO_VALIDATION
    return cors({ origin: true });
  }
}

// Pattern 4: Middleware factory (CORRECT)
class CorsMiddlewareFactoryCorrect {
  static createForProduction(allowedOrigins: string[]) {
    // ✅ CORRECT: Whitelist origins
    return cors({
      origin: allowedOrigins,
      credentials: true
    });
  }

  static createForDevelopment() {
    // ✅ CORRECT: Development-specific origins
    return cors({
      origin: ['http://localhost:3000', 'http://localhost:8080']
    });
  }

  static createDynamic(validateOrigin: (origin: string) => Promise<boolean>) {
    // ✅ CORRECT: Dynamic validation
    return cors({
      origin: async (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        try {
          const allowed = await validateOrigin(origin);
          callback(null, allowed);
        } catch (error) {
          callback(error instanceof Error ? error : new Error('Validation failed'));
        }
      }
    });
  }
}

// Pattern 5: Configuration object builder (INCORRECT)
class CorsConfigBuilder {
  private config: any = {};

  setOrigin(origin: string | string[] | boolean) {
    this.config.origin = origin;
    return this;
  }

  setCredentials(enabled: boolean) {
    this.config.credentials = enabled;
    return this;
  }

  build() {
    return this.config;
  }
}

// Usage that creates violation:
const badConfig1 = new CorsConfigBuilder()
  .setOrigin('*')  // ❌ VIOLATION
  .setCredentials(true)  // ❌ VIOLATION: with wildcard
  .build();

const badConfig2 = new CorsConfigBuilder()
  .setOrigin(true)  // ❌ VIOLATION: reflection
  .build();

// Pattern 6: Express app wrapper (INCORRECT)
class ExpressAppWrapper {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
  }

  private initializeMiddleware() {
    // ❌ VIOLATION: Wrong order - CORS after body parser
    // Should trigger: CORS_WRONG_MIDDLEWARE_ORDER
    this.app.use(express.json());
    this.app.use(cors({ origin: '*' }));  // Also wildcard violation
  }

  public getApp() {
    return this.app;
  }
}

// Pattern 7: Express app wrapper (CORRECT)
class ExpressAppWrapperCorrect {
  private app: express.Application;

  constructor(corsOrigins: string[]) {
    this.app = express();
    this.initializeMiddleware(corsOrigins);
  }

  private initializeMiddleware(corsOrigins: string[]) {
    // ✅ CORRECT: CORS before body parser
    this.app.use(cors({ origin: corsOrigins }));
    this.app.use(express.json());
  }

  public getApp() {
    return this.app;
  }
}

// Pattern 8: Route-specific CORS via class method (INCORRECT)
class ApiRoutes {
  setupRoutes(app: express.Application) {
    // ❌ VIOLATION: Missing preflight for DELETE
    // Should trigger: CORS_MISSING_PREFLIGHT_HANDLER
    app.delete('/api/resource/:id', cors({ origin: '*' }), (req, res) => {
      res.json({ deleted: true });
    });

    // ❌ VIOLATION: Wildcard for authenticated endpoint
    app.get('/api/user', cors({ origin: '*' }), (req, res) => {
      res.json({ user: 'data' });
    });
  }
}

// Pattern 9: Route-specific CORS via class method (CORRECT)
class ApiRoutesCorrect {
  private allowedOrigins: string[];

  constructor(allowedOrigins: string[]) {
    this.allowedOrigins = allowedOrigins;
  }

  setupRoutes(app: express.Application) {
    // ✅ CORRECT: Preflight + DELETE with whitelist
    const corsOptions = cors({ origin: this.allowedOrigins, credentials: true });

    app.options('/api/resource/:id', corsOptions);
    app.delete('/api/resource/:id', corsOptions, (req, res) => {
      res.json({ deleted: true });
    });

    // ✅ CORRECT: Specific origins for authenticated endpoint
    app.get('/api/user', corsOptions, (req, res) => {
      res.json({ user: 'data' });
    });
  }
}

// Export instances for testing
const incorrectServer = new ApiServerIncorrect();
const correctServer = new ApiServerCorrect(['https://example.com']);

const incorrectMiddleware = CorsMiddlewareFactory.createDefault();
const correctMiddleware = CorsMiddlewareFactoryCorrect.createForProduction(['https://example.com']);

export {
  ApiServerIncorrect,
  ApiServerCorrect,
  CorsMiddlewareFactory,
  CorsMiddlewareFactoryCorrect,
  CorsConfigBuilder,
  ExpressAppWrapper,
  ExpressAppWrapperCorrect,
  ApiRoutes,
  ApiRoutesCorrect,
  incorrectServer,
  correctServer,
  incorrectMiddleware,
  correctMiddleware
};
