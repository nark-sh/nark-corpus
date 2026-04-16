/**
 * express-rate-limit Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the express-rate-limit contract spec.
 *
 * Key contract rules:
 *   - middleware.getKey() throws Error if store doesn't implement get()
 *   - middleware.resetKey() silently no-ops if called with wrong key format
 *   - Both methods must be called with the same key the keyGenerator produces
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// 1. getKey — missing try-catch when store may not support get()
// ─────────────────────────────────────────────────────────────────────────────

// Middleware created with default MemoryStore (supports get)
const limiter = rateLimit({ windowMs: 60_000, limit: 10 });

export async function getKeyNoCatchWithPotentiallyUnsupportedStore(
  limiterInstance: RateLimitRequestHandler,
  key: string
) {
  // SHOULD_FIRE: get-key-store-unsupported — getKey() throws Error if store
  // does not implement get(); no try-catch means unhandled rejection in production
  const info = await limiterInstance.getKey(key);
  return info;
}

export async function getKeyWithCatch(
  limiterInstance: RateLimitRequestHandler,
  key: string
) {
  try {
    // SHOULD_NOT_FIRE: getKey inside try-catch satisfies error handling
    const info = await limiterInstance.getKey(key);
    return info;
  } catch (err) {
    // Store doesn't support get() — gracefully degrade
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. resetKey — unprotected endpoint (reset URL itself is rate limited)
// ─────────────────────────────────────────────────────────────────────────────

// Anti-pattern: applying the same limiter to the reset endpoint
// (The reset call never executes if the endpoint is already blocked)
export function rateLimitedResetEndpoint(req: Request, res: Response, next: NextFunction) {
  // SHOULD_FIRE: reset-key-unprotected-endpoint — resetKey called inside a
  // handler that is itself subject to rate limiting; reset endpoint must use skip
  limiter.resetKey(req.ip ?? '');
  res.json({ success: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CLEAN: resetKey on exempt endpoint
// ─────────────────────────────────────────────────────────────────────────────

// Correct pattern: skip the reset endpoint from rate limiting
const limiterWithSkip = rateLimit({
  windowMs: 60_000,
  limit: 10,
  skip: (req) => req.path === '/reset-limit',
});

export function cleanResetEndpoint(req: Request, res: Response) {
  // SHOULD_NOT_FIRE: endpoint is exempt via skip option, so resetKey is reachable
  limiterWithSkip.resetKey(req.ip ?? '');
  res.json({ success: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLEAN: getKey with proper error handling
// ─────────────────────────────────────────────────────────────────────────────

export async function checkQuotaBeforeAction(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: getKey wrapped in try-catch
    const info = await limiter.getKey(req.ip ?? '');
    if (info && info.remaining === 0) {
      res.status(429).json({ error: 'Rate limit exhausted' });
      return;
    }
    res.json({ remaining: info?.remaining });
  } catch (err) {
    // Store doesn't support get() — allow request through
    res.json({ remaining: null });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. created-in-request-handler — rateLimit() called inside a route handler
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
const app = express();

// SHOULD_FIRE: created-in-request-handler — new MemoryStore created per-request;
// hit counts are never accumulated, the rate limiter never actually limits
app.get('/bad-pattern', (req: Request, res: Response, next: NextFunction) => {
  const dynamicLimiter = rateLimit({ windowMs: 60_000, limit: 10 });
  dynamicLimiter(req, res, next);
});

// SHOULD_NOT_FIRE: limiter created at module level, reused across requests
const correctLimiter = rateLimit({ windowMs: 60_000, limit: 10 });
app.use(correctLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// 6. reset-key-wrong-key-format — resetKey called with raw IP, keyGenerator uses user ID
// ─────────────────────────────────────────────────────────────────────────────

const userIdLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  // keyGenerator uses user ID, not IP
  keyGenerator: (req: Request) => (req as any).user?.id ?? req.ip ?? '',
});

export function resetByIpInsteadOfUserId(req: Request, res: Response) {
  // SHOULD_FIRE: reset-key-wrong-key-format — resetKey called with req.ip but
  // keyGenerator uses req.user.id; the IP key won't match any stored entry,
  // reset silently no-ops and user remains locked out
  userIdLimiter.resetKey(req.ip ?? '');
  res.json({ success: true });
}

export function resetByUserId(req: Request, res: Response) {
  // SHOULD_NOT_FIRE: resetKey called with the same key keyGenerator produces
  const userId = (req as any).user?.id ?? req.ip ?? '';
  userIdLimiter.resetKey(userId);
  res.json({ success: true });
}

