/**
 * Express Fixtures - PROPER Error Handling
 *
 * This file demonstrates CORRECT error handling patterns in Express.
 * Should NOT trigger any violations.
 */

import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Mock database operations
async function fetchUserFromDB(id: string): Promise<any> {
  return { id, name: 'Test User' };
}

async function saveUserToDB(data: any): Promise<any> {
  return { id: '123', ...data };
}

// ✅ CORRECT: Async route handler with proper try-catch
app.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await fetchUserFromDB(req.params.id);
    res.json(user);
  } catch (err) {
    next(err); // Forward error to error-handling middleware
  }
});

// ✅ CORRECT: POST handler with proper try-catch
app.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await saveUserToDB(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    next(err); // Forward error to error-handling middleware
  }
});

// ✅ CORRECT: Multiple async operations with proper try-catch
app.get('/users/:id/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await fetchUserFromDB(req.params.id);
    const posts = await fetchPostsForUser(user.id);
    res.json({ user, posts });
  } catch (err) {
    next(err);
  }
});

async function fetchPostsForUser(userId: string): Promise<any[]> {
  return [{ id: '1', title: 'Test Post' }];
}

// ✅ CORRECT: Async middleware with proper try-catch
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simulate authentication check
    await validateAuthToken(req.headers.authorization);
    next(); // Continue to next middleware
  } catch (err) {
    next(err); // Forward error
  }
});

async function validateAuthToken(token: string | undefined): Promise<void> {
  if (!token) {
    throw new Error('No auth token provided');
  }
}

// ✅ CORRECT: Router with proper error handling
const router = express.Router();

router.get('/api/data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchDataFromAPI();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

async function fetchDataFromAPI(): Promise<any> {
  return { data: 'test' };
}

app.use('/v1', router);

// ✅ CORRECT: Error-handling middleware with 4 parameters
// Must be defined AFTER all routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// ✅ CORRECT: Sync route handler (no async, no await - no try-catch needed)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// ✅ CORRECT: Using wrapper function pattern
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/wrapped', asyncHandler(async (req: Request, res: Response) => {
  const data = await fetchUserFromDB('123');
  res.json(data);
}));

// ✅ CORRECT: Promise chain with explicit error handling
app.get('/promise-chain', (req: Request, res: Response, next: NextFunction) => {
  fetchUserFromDB(req.params.id)
    .then(user => res.json(user))
    .catch(next); // Forward errors to error handler
});

export default app;
