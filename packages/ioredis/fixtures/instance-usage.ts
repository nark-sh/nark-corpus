/**
 * Instance Usage Example
 *
 * Tests detection via class instances of Redis client.
 * ioredis supports creating instances for different Redis connections.
 */

import Redis from 'ioredis';

class CacheService {
  private redis: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    // Create Redis instance
    this.redis = new Redis({
      host: 'localhost',
      port: 6379
    });

    // Create pub/sub instances
    this.pubClient = new Redis();
    this.subClient = new Redis();
  }

  // ❌ No try-catch on instance method - should trigger violation
  async getValue(key: string): Promise<string | null> {
    const value = await this.redis.get(key);
    return value;
  }

  // ❌ No try-catch on SET operation - should trigger violation
  async setValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  // ❌ No try-catch on pipeline - should trigger violation
  async batchOperations(keys: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (const key of keys) {
      pipeline.get(key);
    }

    await pipeline.exec();
  }

  // ❌ No try-catch on pub/sub - should trigger violation
  async publishMessage(channel: string, message: string): Promise<void> {
    await this.pubClient.publish(channel, message);
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}

// Test instance detection
async function testCacheService() {
  const cache = new CacheService();

  // ❌ No try-catch - should trigger violations
  await cache.setValue('user:123', 'John Doe');
  const value = await cache.getValue('user:123');
  console.log('Value:', value);

  await cache.cleanup();
}

export { CacheService, testCacheService };
