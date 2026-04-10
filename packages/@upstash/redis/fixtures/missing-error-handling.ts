/**
 * Missing error handling for @upstash/redis
 *
 * This file demonstrates INCORRECT usage — missing try-catch.
 * The analyzer should produce ERROR violations for each uncovered await.
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// VIOLATION: redis.get without try-catch
export async function getCachedMissingCatch(key: string): Promise<string | null> {
  const value = await redis.get<string>(key);
  return value;
}

// VIOLATION: redis.set without try-catch
export async function setCachedMissingCatch(key: string, value: string): Promise<void> {
  await redis.set(key, value);
}

// VIOLATION: redis.del without try-catch
export async function deleteCachedMissingCatch(key: string): Promise<void> {
  await redis.del(key);
}

// VIOLATION: redis.mget without try-catch
export async function getBatchMissingCatch(keys: string[]): Promise<(string | null)[]> {
  const values = await redis.mget<string[]>(keys);
  return values;
}

// VIOLATION: redis.hget without try-catch
export async function getHashFieldMissingCatch(key: string, field: string): Promise<string | null> {
  const value = await redis.hget<string>(key, field);
  return value;
}

// VIOLATION: redis.hset without try-catch
export async function setHashFieldsMissingCatch(key: string, data: Record<string, unknown>): Promise<void> {
  await redis.hset(key, data);
}

// VIOLATION: redis.hgetall without try-catch
export async function getAllHashFieldsMissingCatch(key: string): Promise<Record<string, unknown> | null> {
  const result = await redis.hgetall(key);
  return result;
}

// VIOLATION: redis.lpush without try-catch
export async function addToListMissingCatch(key: string, value: string): Promise<void> {
  await redis.lpush(key, value);
}

// VIOLATION: redis.sadd without try-catch
export async function addToSetMissingCatch(key: string, ...members: string[]): Promise<void> {
  await redis.sadd(key, ...members);
}

// VIOLATION: redis.expire without try-catch
export async function setExpiryMissingCatch(key: string, seconds: number): Promise<void> {
  await redis.expire(key, seconds);
}

// VIOLATION: redis.incr without try-catch
export async function incrementCounterMissingCatch(key: string): Promise<number> {
  const count = await redis.incr(key);
  return count;
}

// VIOLATION: try-finally without catch
export async function tryFinallyNoCatch(key: string): Promise<string | null> {
  try {
    const value = await redis.get<string>(key);
    return value;
  } finally {
    console.log('cleanup');
  }
}
