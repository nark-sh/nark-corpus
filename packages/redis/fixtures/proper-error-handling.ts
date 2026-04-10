/**
 * Redis Fixtures: Proper Error Handling
 *
 * This file demonstrates CORRECT error handling patterns for redis package.
 * Should NOT trigger any violations.
 */

import { createClient, RedisClientType } from 'redis';

/**
 * ✅ GOOD: Error listener registered immediately after createClient
 */
async function createClientWithErrorListener(): Promise<RedisClientType> {
  const client = createClient({
    url: 'redis://localhost:6379'
  });

  // Error listener registered - prevents process crash
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  return client;
}

/**
 * ✅ GOOD: connect() wrapped in try-catch
 */
async function connectWithErrorHandling(): Promise<void> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));

  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err;
  }
}

/**
 * ✅ GOOD: get() wrapped in try-catch
 */
async function getWithErrorHandling(key: string): Promise<string | null> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  try {
    const value = await client.get(key);
    return value;
  } catch (err) {
    console.error('Failed to get key:', err);
    return null;
  } finally {
    await client.close();
  }
}

/**
 * ✅ GOOD: set() wrapped in try-catch
 */
async function setWithErrorHandling(key: string, value: string): Promise<boolean> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  try {
    await client.set(key, value);
    return true;
  } catch (err) {
    console.error('Failed to set key:', err);
    return false;
  } finally {
    await client.close();
  }
}

/**
 * ✅ GOOD: del() wrapped in try-catch
 */
async function delWithErrorHandling(key: string): Promise<number> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  try {
    const count = await client.del(key);
    console.log(`Deleted ${count} keys`);
    return count;
  } catch (err) {
    console.error('Failed to delete key:', err);
    return 0;
  } finally {
    await client.close();
  }
}

/**
 * ✅ GOOD: Graceful degradation pattern
 */
async function getWithFallback(key: string): Promise<string | null> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));

  try {
    await client.connect();
    const value = await client.get(key);
    await client.close();

    if (value != null) {
      return value;
    }
  } catch (err) {
    const errorCode = (err as any).code;
    if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(errorCode)) {
      console.warn('Cache unavailable; falling back to database');
      // Fallback to database (simulated)
      return null;
    }
    throw err;
  }

  // Fallback to database
  return null;
}

/**
 * ✅ GOOD: Retry with exponential backoff
 */
async function getWithRetry(
  key: string,
  options = { attempts: 3, baseDelayMs: 100 }
): Promise<string | null> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  let delay = options.baseDelayMs;

  for (let i = 0; i < options.attempts; i++) {
    try {
      const value = await client.get(key);
      await client.close();
      return value;
    } catch (err) {
      const errorCode = (err as any).code;
      const errorName = (err as any).name;
      const errorMessage = (err as any).message;

      if (
        i < options.attempts - 1 &&
        (['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'].includes(errorCode) ||
         (errorName === 'ReplyError' && /(BUSY|TRYAGAIN|LOADING)/.test(errorMessage)))
      ) {
        console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      await client.close();
      throw err;
    }
  }

  await client.close();
  return null;
}

/**
 * ✅ GOOD: Cache adapter pattern with proper error handling
 */
class RedisCacheAdapter {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();

    // Error listener prevents process crash
    this.client.on('error', (err) => {
      console.error('RedisCacheAdapter client error:', err);
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (err) {
      console.error('Failed to connect cache:', err);
      throw err;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await this.client.set(key, serialized, { PX: ttl });
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      console.error('Cache set error:', err);
      // Non-critical - log and continue
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Cache del error:', err);
      // Non-critical - log and continue
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
    } catch (err) {
      console.error('Failed to close cache:', err);
    }
  }
}

export {
  createClientWithErrorListener,
  connectWithErrorHandling,
  getWithErrorHandling,
  setWithErrorHandling,
  delWithErrorHandling,
  getWithFallback,
  getWithRetry,
  RedisCacheAdapter
};
