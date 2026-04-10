/**
 * ioredis - Missing Error Handling Examples
 *
 * All examples demonstrate INCORRECT error handling patterns.
 * Should produce multiple violations.
 */

import Redis from 'ioredis';

// ❌ VIOLATION: No error listener attached
function createRedisWithoutErrorHandler() {
  const redis = new Redis({
    host: 'localhost',
    port: 6379
  });

  // Missing: redis.on('error', handler)
  return redis;
}

// ❌ VIOLATION: Command without try-catch
async function getValueUnsafe(redis: Redis, key: string): Promise<string | null> {
  // No try-catch - promise rejection unhandled
  const value = await redis.get(key);
  return value;
}

// ❌ VIOLATION: Command without error handling
async function setValueUnsafe(redis: Redis, key: string, value: string): Promise<void> {
  // No .catch() - unhandled promise rejection
  await redis.set(key, value);
}

// ❌ VIOLATION: Multiple commands without error handling
async function multipleCommandsUnsafe(redis: Redis): Promise<void> {
  await redis.set('key1', 'value1'); // No error handling
  await redis.set('key2', 'value2'); // No error handling
  await redis.get('key1');          // No error handling
}

// ❌ VIOLATION: Pipeline without result checking
async function pipelineWithoutChecking(redis: Redis): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set('key1', 'value1');
  pipeline.set('key2', 'value2');
  pipeline.get('key1');

  await pipeline.exec();
  // Missing: result error checking
}

// ❌ VIOLATION: Transaction without null checking
async function transactionWithoutNullCheck(redis: Redis): Promise<void> {
  await redis.watch('balance');

  const currentBalance = parseInt(await redis.get('balance') || '0');

  await redis
    .multi()
    .set('balance', (currentBalance + 100).toString())
    .exec();

  // Missing: null check for WATCH violation
}

// ❌ VIOLATION: Subscriber mode violation (no duplicate)
async function subscribeWithoutDuplicate(redis: Redis): Promise<void> {
  await redis.subscribe('notifications');

  // ❌ VIOLATION: Normal command in subscriber mode
  await redis.set('last-subscribed', Date.now().toString());
}

// ❌ VIOLATION: Blocking command without timeout
async function blockingPopWithoutTimeout(redis: Redis): Promise<string | null> {
  // Missing timeout parameter - may block forever
  const result = await redis.brpop('queue');
  return result ? result[1] : null;
}

// ❌ VIOLATION: Connect without error handling
async function connectWithoutErrorHandling(): Promise<Redis> {
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    lazyConnect: true
  });

  // Missing error listener
  await redis.connect(); // No try-catch

  return redis;
}

// ❌ VIOLATION: Pipeline exec without try-catch
async function pipelineExecNoTryCatch(redis: Redis): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.get('key1');
  pipeline.get('key2');

  // No try-catch on exec()
  await pipeline.exec();
}

// ❌ VIOLATION: Transaction with error commands not checked
async function transactionErrorsNotChecked(redis: Redis): Promise<void> {
  const result = await redis
    .multi()
    .set('key1', 'value1')
    .incr('key1') // Will fail - WRONGTYPE
    .exec();

  // Missing: error checking in results
  console.log('Transaction completed');
}

// Export for testing
export {
  createRedisWithoutErrorHandler,
  getValueUnsafe,
  setValueUnsafe,
  multipleCommandsUnsafe,
  pipelineWithoutChecking,
  transactionWithoutNullCheck,
  subscribeWithoutDuplicate,
  blockingPopWithoutTimeout,
  connectWithoutErrorHandling,
  pipelineExecNoTryCatch,
  transactionErrorsNotChecked
};
