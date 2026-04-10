/**
 * Instance-based usage patterns for @upstash/redis
 *
 * Tests detection of Redis method calls through class instance fields.
 */

import { Redis } from '@upstash/redis';

// ─── Pattern 1: Class with Redis as a field ───────────────────────────────────

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  // VIOLATION: this.redis.get without try-catch
  async get(key: string): Promise<string | null> {
    return this.redis.get<string>(key);
  }

  // CORRECT: this.redis.set in try-catch
  async set(key: string, value: string): Promise<void> {
    try {
      await this.redis.set(key, value);
    } catch (error) {
      console.error('Cache set failed:', error);
      throw error;
    }
  }

  // VIOLATION: this.redis.del without try-catch
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // CORRECT: this.redis.hget in try-catch
  async getField(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget<string>(key, field);
    } catch (error) {
      return null;
    }
  }
}

// ─── Pattern 2: Module-level singleton ───────────────────────────────────────

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// VIOLATION: module-level redis instance without try-catch
export async function getFromSingleton(key: string): Promise<string | null> {
  const value = await redisClient.get<string>(key);
  return value;
}

// CORRECT: module-level redis instance with try-catch
export async function getFromSingletonSafe(key: string): Promise<string | null> {
  try {
    const value = await redisClient.get<string>(key);
    return value;
  } catch (error) {
    return null;
  }
}

// ─── Pattern 3: Function-scoped Redis instance ────────────────────────────────

// VIOLATION: locally created instance, no try-catch
export async function localInstanceNoTryCatch(key: string): Promise<string | null> {
  const client = Redis.fromEnv();
  const value = await client.get<string>(key);
  return value;
}

// CORRECT: locally created instance with try-catch
export async function localInstanceWithTryCatch(key: string): Promise<string | null> {
  const client = Redis.fromEnv();
  try {
    const value = await client.get<string>(key);
    return value;
  } catch (error) {
    return null;
  }
}

// ─── Pattern 4: Re-exported service methods ──────────────────────────────────

export const cacheService = new CacheService();
