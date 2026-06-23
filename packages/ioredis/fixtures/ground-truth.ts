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
  // SHOULD_FIRE: unhandled-promise-rejection — redis.get() rejects on connection errors. No try-catch.
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
  // SHOULD_FIRE: quit-promise-unhandled — quit() promise rejected without catch handler
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
  // SHOULD_FIRE: del-unhandled-promise-rejection — del() promise rejected without catch handler
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
  // SHOULD_FIRE: expire-unhandled-promise-rejection — expire() promise rejected without catch handler
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
  // SHOULD_FIRE: incr-wrong-type-error — incr() rate limiter fails open when promise not caught
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
  // SHOULD_FIRE: zadd-wrong-type-error — zadd() promise rejected without catch handler
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
  // SHOULD_FIRE: blpop-unhandled-promise-rejection — blpop() promise rejected without catch handler
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. tx.exec() — transaction / pipeline finalizer (pass 15)
// ─────────────────────────────────────────────────────────────────────────────

export async function execNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: exec-unhandled-promise-rejection — exec() promise rejected without catch handler
  const results = await redis.multi().set(key, '1').incr(key).exec();
  return results;
}

// @expect-clean
export async function execWithCatch(redis: Redis, key: string) {
  try {
    // SHOULD_NOT_FIRE: exec() inside try-catch
    const results = await redis.multi().set(key, '1').incr(key).exec();
    if (results === null) {
      // WATCH'd key changed — caller handled the discard signal
      return null;
    }
    for (const [err] of results) {
      if (err) throw err;
    }
    return results;
  } catch (err) {
    console.error('Redis transaction failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. redis.exists() — presence probe (idempotency, rate-limit, cache-aside)
// ─────────────────────────────────────────────────────────────────────────────

export async function existsNoCatch(redis: Redis, key: string) {
  // SHOULD_FIRE: exists-unhandled-promise-rejection — exists() promise rejected without catch handler
  const n = await redis.exists(key);
  return n === 1;
}

// @expect-clean
export async function existsWithCatch(redis: Redis, key: string) {
  try {
    // SHOULD_NOT_FIRE: exists() inside try-catch + numeric comparison
    const n = await redis.exists(key);
    return n === 1;
  } catch (err) {
    console.error('Redis exists probe failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. redis.getex() — atomic GET + TTL refresh (sliding session windows)
// ─────────────────────────────────────────────────────────────────────────────

export async function getexNoCatch(redis: Redis, sessionId: string) {
  // SHOULD_FIRE: getex-unhandled-promise-rejection — getex() promise rejected without catch handler
  const value = await redis.getex(`sess:${sessionId}`, 'EX', 3600);
  return value;
}

// @expect-clean
export async function getexWithCatch(redis: Redis, sessionId: string, ttlSeconds: number) {
  try {
    // SHOULD_NOT_FIRE: getex() inside try-catch + validated TTL
    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('Invalid TTL');
    }
    const value = await redis.getex(`sess:${sessionId}`, 'EX', ttlSeconds);
    return value;
  } catch (err) {
    console.error('Redis getex failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. redis.getdel() — atomic get-and-delete (one-time token consumption)
// ─────────────────────────────────────────────────────────────────────────────

export async function getdelNoCatch(redis: Redis, token: string) {
  // SHOULD_FIRE: getdel-unhandled-promise-rejection — getdel() promise rejected without catch handler
  const userId = await redis.getdel(`magic-link:${token}`);
  return userId;
}

// @expect-clean
export async function getdelWithCatch(redis: Redis, token: string) {
  try {
    // SHOULD_NOT_FIRE: getdel() inside try-catch + null is distinguished from error
    const userId = await redis.getdel(`magic-link:${token}`);
    if (userId === null) {
      // Token was never set or already consumed — legitimate "invalid" case
      return { ok: false as const, reason: 'invalid-or-consumed' as const };
    }
    return { ok: true as const, userId };
  } catch (err) {
    // Distinct from null-return: this is a connection-level failure
    console.error('Redis getdel failed (connection error):', err);
    throw err;
  }
}
