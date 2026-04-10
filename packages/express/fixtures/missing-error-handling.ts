/**
 * Express Fixtures - MISSING Error Handling
 *
 * This file demonstrates INCORRECT error handling patterns in Express.
 * Should trigger ERROR violations for unhandled async operations.
 */

import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Mock database operations
async function fetchUserFromDB(id: string): Promise<any> {
  throw new Error('Database connection failed'); // Simulated error
}

async function saveUserToDB(data: any): Promise<any> {
  throw new Error('Database write failed'); // Simulated error
}

// ❌ INCORRECT: Async route handler WITHOUT try-catch
// Should trigger: async-route-handler-unhandled-rejection
app.get('/users/:id', async (req: Request, res: Response) => {
  // No try-catch - if fetchUserFromDB throws, it will be an unhandled promise rejection
  const user = await fetchUserFromDB(req.params.id);
  res.json(user);
});

// ❌ INCORRECT: POST handler WITHOUT try-catch
// Should trigger: async-route-handler-unhandled-rejection
app.post('/users', async (req: Request, res: Response) => {
  // No try-catch - unhandled rejection if saveUserToDB fails
  const newUser = await saveUserToDB(req.body);
  res.status(201).json(newUser);
});

// ❌ INCORRECT: Multiple async operations WITHOUT try-catch
// Should trigger: async-route-handler-unhandled-rejection
app.get('/users/:id/posts', async (req: Request, res: Response) => {
  // No error handling for either await
  const user = await fetchUserFromDB(req.params.id);
  const posts = await fetchPostsForUser(user.id);
  res.json({ user, posts });
});

async function fetchPostsForUser(userId: string): Promise<any[]> {
  throw new Error('Failed to fetch posts');
}

// ❌ INCORRECT: Async middleware WITHOUT try-catch
// Should trigger: async-middleware-unhandled-rejection
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // No try-catch - unhandled rejection if validateAuthToken fails
  await validateAuthToken(req.headers.authorization);
  next();
});

async function validateAuthToken(token: string | undefined): Promise<void> {
  throw new Error('Invalid token');
}

// ❌ INCORRECT: Router handler WITHOUT try-catch
// Should trigger: async-router-handler-unhandled-rejection
const router = express.Router();

router.get('/api/data', async (req: Request, res: Response) => {
  // No try-catch - unhandled rejection
  const data = await fetchDataFromAPI();
  res.json(data);
});

async function fetchDataFromAPI(): Promise<any> {
  throw new Error('API request failed');
}

app.use('/v1', router);

// ❌ INCORRECT: Router middleware WITHOUT try-catch
// Should trigger: async-router-middleware-unhandled-rejection
router.use(async (req: Request, res: Response, next: NextFunction) => {
  // No try-catch
  await performSecurityCheck(req);
  next();
});

async function performSecurityCheck(req: Request): Promise<void> {
  throw new Error('Security check failed');
}

// ❌ INCORRECT: PUT handler WITHOUT try-catch
app.put('/users/:id', async (req: Request, res: Response) => {
  const user = await fetchUserFromDB(req.params.id);
  const updated = await updateUser(user.id, req.body);
  res.json(updated);
});

async function updateUser(id: string, data: any): Promise<any> {
  throw new Error('Update failed');
}

// ❌ INCORRECT: DELETE handler WITHOUT try-catch
app.delete('/users/:id', async (req: Request, res: Response) => {
  await deleteUser(req.params.id);
  res.status(204).send();
});

async function deleteUser(id: string): Promise<void> {
  throw new Error('Delete failed');
}

// ❌ INCORRECT: PATCH handler WITHOUT try-catch
app.patch('/users/:id', async (req: Request, res: Response) => {
  const result = await patchUser(req.params.id, req.body);
  res.json(result);
});

async function patchUser(id: string, data: any): Promise<any> {
  throw new Error('Patch failed');
}

// ❌ INCORRECT: Promise chain WITHOUT error handling
app.get('/promise-no-catch', (req: Request, res: Response) => {
  // No .catch() - unhandled rejection
  fetchUserFromDB(req.params.id)
    .then(user => res.json(user));
  // Missing .catch(next) or .catch(err => ...)
});

// ❌ INCORRECT: Nested async operations WITHOUT try-catch
app.get('/nested', async (req: Request, res: Response) => {
  const user = await fetchUserFromDB(req.params.id);

  // Nested async operation without try-catch
  const enrichedUser = await enrichUserData(user);

  res.json(enrichedUser);
});

async function enrichUserData(user: any): Promise<any> {
  // Nested async call - no error handling
  const profile = await fetchUserProfile(user.id);
  const settings = await fetchUserSettings(user.id);
  return { ...user, profile, settings };
}

async function fetchUserProfile(userId: string): Promise<any> {
  throw new Error('Profile fetch failed');
}

async function fetchUserSettings(userId: string): Promise<any> {
  throw new Error('Settings fetch failed');
}

// Note: These patterns are ANTI-PATTERNS that can crash the Node.js process
// or leave the server in an inconsistent state. In production, these would
// result in:
// - UnhandledPromiseRejectionWarning
// - Potential process crashes
// - Hung HTTP requests with no response
// - Memory leaks from unresolved promises

export default app;
