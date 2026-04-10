/**
 * ioredis - Proper Error Handling Examples
 *
 * All examples demonstrate CORRECT error handling patterns.
 * Should produce 0 violations.
 */

import Redis from 'ioredis';

// ✅ CORRECT: Error listener attached immediately
function createRedisWithErrorHandler() {
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000)
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return redis;
}

// ✅ CORRECT: Command with try-catch
async function getValueSafely(redis: Redis, key: string): Promise<string | null> {
  try {
    const value = await redis.get(key);
    return value;
  } catch (error) {
    console.error('Error getting value:', error);
    throw error;
  }
}

// ✅ CORRECT: Command with .catch()
async function setValueSafely(redis: Redis, key: string, value: string): Promise<void> {
  await redis.set(key, value).catch((err) => {
    console.error('Error setting value:', err);
    throw err;
  });
}

// ✅ CORRECT: Pipeline with result checking
async function pipelineWithChecking(redis: Redis): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    pipeline.set('key1', 'value1');
    pipeline.set('key2', 'value2');
    pipeline.get('key1');

    const results = await pipeline.exec();

    // Check each result for errors
    if (results) {
      for (let i = 0; i < results.length; i++) {
        const [error, result] = results[i];
        if (error) {
          console.error(`Command ${i} failed:`, error);
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    throw error;
  }
}

// ✅ CORRECT: Transaction with null checking
async function transactionWithWatchChecking(redis: Redis): Promise<void> {
  try {
    await redis.watch('balance');

    const currentBalance = parseInt(await redis.get('balance') || '0');

    const result = await redis
      .multi()
      .set('balance', (currentBalance + 100).toString())
      .exec();

    // Check for WATCH violation
    if (result === null) {
      console.log('Transaction aborted due to WATCH violation, retrying...');
      // Retry logic here
      return;
    }

    // Check for command errors
    if (result) {
      for (const [error] of result) {
        if (error) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// ✅ CORRECT: Subscriber with duplicate connection
async function subscribeWithDuplicate(redis: Redis): Promise<void> {
  const subscriber = redis.duplicate();

  subscriber.on('error', (err) => {
    console.error('Subscriber connection error:', err);
  });

  subscriber.on('message', (channel, message) => {
    console.log(`Received message from ${channel}:`, message);
  });

  try {
    await subscriber.subscribe('notifications');

    // Use original redis for normal commands (not subscriber)
    await redis.set('last-subscribed', Date.now().toString());
  } catch (error) {
    console.error('Subscribe error:', error);
    throw error;
  }
}

// ✅ CORRECT: Blocking command with timeout
async function blockingPopWithTimeout(redis: Redis): Promise<string | null> {
  try {
    // 5 second timeout
    const result = await redis.brpop('queue', 5);
    return result ? result[1] : null;
  } catch (error) {
    console.error('BRPOP error:', error);
    throw error;
  }
}

// ✅ CORRECT: Connect with error handling
async function connectWithErrorHandling(): Promise<Redis> {
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    lazyConnect: true
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  try {
    await redis.connect();
    return redis;
  } catch (error) {
    console.error('Failed to connect:', error);
    throw error;
  }
}

// Export for testing
export {
  createRedisWithErrorHandler,
  getValueSafely,
  setValueSafely,
  pipelineWithChecking,
  transactionWithWatchChecking,
  subscribeWithDuplicate,
  blockingPopWithTimeout,
  connectWithErrorHandling
};
