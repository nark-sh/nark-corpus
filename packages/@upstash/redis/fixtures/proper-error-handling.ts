/**
 * Proper error handling for @upstash/redis
 *
 * This file demonstrates correct usage. The analyzer should produce ZERO violations.
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// CORRECT: redis.get wrapped in try-catch
export async function getCached(key: string): Promise<string | null> {
  try {
    const value = await redis.get<string>(key);
    return value;
  } catch (error) {
    console.error('Redis get failed:', error);
    return null;
  }
}

// CORRECT: redis.set wrapped in try-catch
export async function setCached(key: string, value: string, ttl?: number): Promise<void> {
  try {
    if (ttl) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    console.error('Redis set failed:', error);
    throw error;
  }
}

// CORRECT: redis.del wrapped in try-catch
export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis del failed:', error);
  }
}

// CORRECT: redis.mget wrapped in try-catch
export async function getBatch(keys: string[]): Promise<(string | null)[]> {
  try {
    const values = await redis.mget<string[]>(keys);
    return values;
  } catch (error) {
    console.error('Redis mget failed:', error);
    return keys.map(() => null);
  }
}

// CORRECT: redis.hget wrapped in try-catch
export async function getHashField(key: string, field: string): Promise<string | null> {
  try {
    const value = await redis.hget<string>(key, field);
    return value;
  } catch (error) {
    console.error('Redis hget failed:', error);
    return null;
  }
}

// CORRECT: redis.hset wrapped in try-catch
export async function setHashFields(key: string, data: Record<string, unknown>): Promise<void> {
  try {
    await redis.hset(key, data);
  } catch (error) {
    console.error('Redis hset failed:', error);
    throw error;
  }
}

// CORRECT: redis.hgetall wrapped in try-catch
export async function getAllHashFields(key: string): Promise<Record<string, unknown> | null> {
  try {
    const result = await redis.hgetall(key);
    return result;
  } catch (error) {
    console.error('Redis hgetall failed:', error);
    return null;
  }
}

// CORRECT: redis.lpush wrapped in try-catch
export async function addToList(key: string, value: string): Promise<void> {
  try {
    await redis.lpush(key, value);
  } catch (error) {
    console.error('Redis lpush failed:', error);
  }
}

// CORRECT: redis.lrange wrapped in try-catch
export async function getListRange(key: string, start: number, end: number): Promise<string[]> {
  try {
    const items = await redis.lrange<string>(key, start, end);
    return items;
  } catch (error) {
    console.error('Redis lrange failed:', error);
    return [];
  }
}

// CORRECT: redis.sadd wrapped in try-catch
export async function addToSet(key: string, ...members: string[]): Promise<void> {
  try {
    await redis.sadd(key, ...members);
  } catch (error) {
    console.error('Redis sadd failed:', error);
  }
}

// CORRECT: redis.expire wrapped in try-catch
export async function setExpiry(key: string, seconds: number): Promise<void> {
  try {
    await redis.expire(key, seconds);
  } catch (error) {
    console.error('Redis expire failed:', error);
  }
}

// CORRECT: redis.incr wrapped in try-catch
export async function incrementCounter(key: string): Promise<number | null> {
  try {
    const count = await redis.incr(key);
    return count;
  } catch (error) {
    console.error('Redis incr failed:', error);
    return null;
  }
}

// CORRECT: pipeline.exec wrapped in try-catch
export async function runPipeline(key: string, value: string): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    pipeline.set(key, value);
    pipeline.expire(key, 3600);
    await pipeline.exec();
  } catch (error) {
    console.error('Redis pipeline failed:', error);
    throw error;
  }
}

// CORRECT: instance usage from Redis.fromEnv() — wrapped in try-catch
export async function getWithFromEnv(key: string): Promise<string | null> {
  const client = Redis.fromEnv();
  try {
    const value = await client.get<string>(key);
    return value;
  } catch (error) {
    console.error('Redis get failed:', error);
    return null;
  }
}
