/**
 * Express Fixtures - Instance Usage Patterns
 *
 * This file demonstrates various Express instance patterns including routers,
 * sub-apps, and different middleware configurations. Tests detection of
 * async error handling in different contexts.
 */

import express, { Request, Response, NextFunction, Router } from 'express';

const app = express();

// ============================================================================
// Router Instances
// ============================================================================

// ✅ CORRECT: Router with proper error handling
const userRouter = Router();

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

userRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// ❌ INCORRECT: Router without error handling
const postsRouter = Router();

postsRouter.get('/:id', async (req: Request, res: Response) => {
  // Missing try-catch - should trigger violation
  const post = await getPostById(req.params.id);
  res.json(post);
});

postsRouter.post('/', async (req: Request, res: Response) => {
  // Missing try-catch - should trigger violation
  const newPost = await createPost(req.body);
  res.status(201).json(newPost);
});

// ============================================================================
// Nested Routers
// ============================================================================

// ❌ INCORRECT: Nested router without error handling
const apiRouter = Router();
const v1Router = Router();

v1Router.get('/health', async (req: Request, res: Response) => {
  // Missing try-catch
  const status = await checkSystemHealth();
  res.json(status);
});

apiRouter.use('/v1', v1Router);
app.use('/api', apiRouter);

// ============================================================================
// Middleware Chains
// ============================================================================

// ✅ CORRECT: Middleware chain with proper error handling
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyToken(req.headers.authorization);
    next();
  } catch (err) {
    next(err);
  }
};

const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkRateLimit(req.ip);
    next();
  } catch (err) {
    next(err);
  }
};

app.use(authMiddleware);
app.use(rateLimitMiddleware);

// ❌ INCORRECT: Middleware chain without error handling
const loggingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Missing try-catch
  await logRequest(req);
  next();
};

const metricsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Missing try-catch
  await recordMetrics(req);
  next();
};

app.use(loggingMiddleware);
app.use(metricsMiddleware);

// ============================================================================
// Sub-Applications
// ============================================================================

const adminApp = express();

// ❌ INCORRECT: Sub-app route without error handling
adminApp.get('/users', async (req: Request, res: Response) => {
  // Missing try-catch
  const users = await getAllUsers();
  res.json(users);
});

// ✅ CORRECT: Sub-app route with error handling
adminApp.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getSystemStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

app.use('/admin', adminApp);

// ============================================================================
// Route Parameters and Middleware
// ============================================================================

// ❌ INCORRECT: Param middleware without error handling
app.param('userId', async (req: Request, res: Response, next: NextFunction, userId: string) => {
  // Missing try-catch
  const user = await getUserById(userId);
  (req as any).user = user;
  next();
});

// ✅ CORRECT: Param middleware with error handling
app.param('postId', async (req: Request, res: Response, next: NextFunction, postId: string) => {
  try {
    const post = await getPostById(postId);
    (req as any).post = post;
    next();
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

// ✅ CORRECT: Global error handler with 4 parameters
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: {
      message: err.message,
      timestamp: new Date().toISOString()
    }
  });
});

// ❌ WARNING: Error handler with wrong parameter count
// This will NOT be recognized as an error handler by Express
app.use((err: Error, req: Request, res: Response) => {
  // Missing 4th parameter 'next' - this won't work as error middleware
  res.status(500).json({ error: err.message });
});

// ============================================================================
// All HTTP Methods
// ============================================================================

const methodRouter = Router();

// ❌ INCORRECT: All methods without error handling
methodRouter.get('/resource', async (req: Request, res: Response) => {
  const data = await fetchResource();
  res.json(data);
});

methodRouter.post('/resource', async (req: Request, res: Response) => {
  const created = await createResource(req.body);
  res.status(201).json(created);
});

methodRouter.put('/resource/:id', async (req: Request, res: Response) => {
  const updated = await updateResource(req.params.id, req.body);
  res.json(updated);
});

methodRouter.patch('/resource/:id', async (req: Request, res: Response) => {
  const patched = await patchResource(req.params.id, req.body);
  res.json(patched);
});

methodRouter.delete('/resource/:id', async (req: Request, res: Response) => {
  await deleteResource(req.params.id);
  res.status(204).send();
});

app.use('/methods', methodRouter);

// ============================================================================
// Mock Async Functions
// ============================================================================

async function getUserById(id: string): Promise<any> {
  return { id, name: 'User' };
}

async function createUser(data: any): Promise<any> {
  return { id: '123', ...data };
}

async function getPostById(id: string): Promise<any> {
  return { id, title: 'Post' };
}

async function createPost(data: any): Promise<any> {
  return { id: '456', ...data };
}

async function checkSystemHealth(): Promise<any> {
  return { status: 'ok' };
}

async function verifyToken(token: string | undefined): Promise<void> {
  if (!token) throw new Error('No token');
}

async function checkRateLimit(ip: string | undefined): Promise<void> {
  // Mock rate limiting
}

async function logRequest(req: Request): Promise<void> {
  // Mock logging
}

async function recordMetrics(req: Request): Promise<void> {
  // Mock metrics
}

async function getAllUsers(): Promise<any[]> {
  return [{ id: '1', name: 'User 1' }];
}

async function getSystemStats(): Promise<any> {
  return { uptime: 1000, requests: 500 };
}

async function fetchResource(): Promise<any> {
  return { id: '1', data: 'resource' };
}

async function createResource(data: any): Promise<any> {
  return { id: '2', ...data };
}

async function updateResource(id: string, data: any): Promise<any> {
  return { id, ...data };
}

async function patchResource(id: string, data: any): Promise<any> {
  return { id, ...data };
}

async function deleteResource(id: string): Promise<void> {
  // Mock deletion
}

export default app;
