/**
 * ioredis Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ioredis"):
 *   - new Redis()    postcondition: missing-error-listener
 *   - redis.get()    postcondition: unhandled-promise-rejection
 *
 * Detection path:
 *   - EventListenerAbsencePlugin checks new Redis() for .on('error', ...)
 *   - ThrowingFunctionDetector fires redis.get() without try-catch
 */

import Redis from 'ioredis';

// ─────────────────────────────────────────────────────────────────────────────
// 1. new Redis() — without error listener
// ─────────────────────────────────────────────────────────────────────────────

export function createClientNoCatch() {
  // SHOULD_FIRE: missing-error-listener — Redis client created without .on('error') listener
  const redis = new Redis({ host: 'localhost', port: 6379 });
  return redis;
}

export function createClientWithErrorHandler() {
  // SHOULD_NOT_FIRE: Redis client has .on('error') handler satisfying error handling
  const redis = new Redis({ host: 'localhost', port: 6379 });
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });
  return redis;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. redis.get() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: missing-error-listener — redis.get() rejects on connection errors. No try-catch.
  const value = await redis.get(key);
  return value;
}

export async function getWithCatch(redis: Redis, key: string) {
  try {
    // SHOULD_NOT_FIRE: redis.get() inside try-catch satisfies error handling
    const value = await redis.get(key);
    return value;
  } catch (err) {
    console.error('Redis get failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. redis.quit() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function quitNoCatch(redis: Redis) {
  // SHOULD_FIRE: missing-error-listener — quit() promise rejected without catch handler
  await redis.quit();
}

export async function quitWithCatch(redis: Redis) {
  try {
    // SHOULD_NOT_FIRE: quit() inside try-catch
    await redis.quit();
  } catch (err) {
    console.error('Redis quit failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. redis.del() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function delNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: missing-error-listener — del() promise rejected without catch handler
  await redis.del(key);
}

export async function delWithCatch(redis: Redis, key: string) {
  try {
    // SHOULD_NOT_FIRE: del() inside try-catch
    const count = await redis.del(key);
    return count;
  } catch (err) {
    console.error('Redis del failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. redis.expire() — without try-catch + set-then-expire race condition
// ─────────────────────────────────────────────────────────────────────────────

export async function expireNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: missing-error-listener — expire() promise rejected without catch handler
  await redis.expire(key, 300);
}

export async function expireWithCatch(redis: Redis, key: string, value: string) {
  try {
    // SHOULD_NOT_FIRE: atomic SET with EX option avoids race condition
    await redis.set(key, value, 'EX', 300);
  } catch (err) {
    console.error('Redis set with expiry failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. redis.incr() — without try-catch (rate limiting pattern)
// ─────────────────────────────────────────────────────────────────────────────

export async function incrNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: missing-error-listener — incr() rate limiter fails open when promise not caught
  const count = await redis.incr(key);
  return count;
}

// @expect-clean
export async function incrWithCatch(redis: Redis, key: string) {
  try {
    // SHOULD_NOT_FIRE: incr() inside try-catch
    const count = await redis.incr(key);
    return count;
  } catch (err) {
    console.error('Redis incr failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. redis.zadd() — without try-catch (sorted set / leaderboard pattern)
// ─────────────────────────────────────────────────────────────────────────────

export async function zaddNoCatch(redis: Redis, key: string, score: number, member: string) {
  // SHOULD_FIRE: missing-error-listener — zadd() promise rejected without catch handler
  await redis.zadd(key, score, member);
}

export async function zaddWithCatch(redis: Redis, key: string, score: number, member: string) {
  try {
    // SHOULD_NOT_FIRE: zadd() inside try-catch
    if (isNaN(score) || !isFinite(score)) {
      throw new Error('Invalid score: must be a finite number');
    }
    await redis.zadd(key, score, member);
  } catch (err) {
    console.error('Redis zadd failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. redis.blpop() — blocking without timeout (job queue pattern)
// ─────────────────────────────────────────────────────────────────────────────

export async function blpopNoCatch(redis: Redis, queue: string) {
  // SHOULD_FIRE: missing-error-listener — blpop() promise rejected without catch handler
  const item = await redis.blpop(queue, 5);
  return item;
}

// @expect-clean
export async function blpopWithCatch(redis: Redis, queue: string) {
  try {
    // SHOULD_NOT_FIRE: blpop() with timeout and try-catch
    const item = await redis.blpop(queue, 5);
    return item;
  } catch (err) {
    console.error('Redis blpop failed:', err);
    throw err;
  }
}
