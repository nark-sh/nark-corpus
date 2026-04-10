/**
 * CORS Fixtures - Proper Error Handling
 *
 * This file demonstrates CORRECT CORS configuration patterns.
 * These should NOT trigger any violations.
 */

import express from 'express';
import cors from 'cors';

const app = express();

// ✅ CORRECT: Whitelist specific origins
const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
  'https://admin.example.com'
];

app.use(cors({
  origin: allowedOrigins
}));

// ✅ CORRECT: Dynamic origin validation with proper error handling
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// ✅ CORRECT: Specific origin with credentials
app.use(cors({
  origin: 'https://app.example.com',
  credentials: true
}));

// ✅ CORRECT: Regex pattern with ESCAPED dots
app.use(cors({
  origin: /\.example\.com$/  // Properly escaped - only matches *.example.com
}));

// ✅ CORRECT: Multiple patterns in array
app.use(cors({
  origin: [
    'https://example.com',
    /\.example\.com$/,
    /\.staging\.example\.com$/
  ]
}));

// ✅ CORRECT: Environment-based configuration
const productionOrigins = ['https://example.com', 'https://app.example.com'];
const developmentOrigins = ['http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins,
  credentials: true
}));

// ✅ CORRECT: Database-backed origin validation
app.use(cors({
  origin: async (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    try {
      // Example: Load allowed origins from database
      // const allowedOrigins = await db.loadAllowedOrigins();
      const allowedOrigins = ['https://example.com'];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      callback(error);
    }
  }
}));

// ✅ CORRECT: Preflight handler for complex requests
app.options('/api/resource/:id', cors());
app.delete('/api/resource/:id', cors(), (req, res) => {
  res.json({ message: 'Deleted' });
});

// ✅ CORRECT: Global preflight handler
app.options('*', cors());

// ✅ CORRECT: Handle CORS validation errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Your origin is not allowed to access this resource'
    });
  }
  next(err);
});

// ✅ CORRECT: Route-specific CORS configuration
app.get('/api/public', cors({ origin: '*' }), (req, res) => {
  // Wildcard OK for truly public endpoint with no sensitive data
  res.json({ message: 'Public data' });
});

app.get('/api/private', cors({ origin: allowedOrigins, credentials: true }), (req, res) => {
  // Restricted origin for sensitive endpoint
  res.json({ message: 'Private data' });
});

// ✅ CORRECT: Custom CORS configuration per request
const dynamicCorsOptions = (req: express.Request, callback: (err: Error | null, options?: any) => void) => {
  let corsOptions;

  if (req.path.startsWith('/auth/connect/')) {
    corsOptions = {
      origin: 'https://app.example.com',
      credentials: true
    };
  } else if (req.path.startsWith('/api/public/')) {
    corsOptions = {
      origin: allowedOrigins
    };
  } else {
    corsOptions = {
      origin: false  // Disable CORS for non-public routes
    };
  }

  callback(null, corsOptions);
};

app.use(cors(dynamicCorsOptions));

export default app;
