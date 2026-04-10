/**
 * Redis Fixtures: Missing Error Handling
 *
 * This file demonstrates INCORRECT error handling patterns for redis package.
 * Should trigger ERROR violations.
 */

import { createClient, RedisClientType } from 'redis';

/**
 * ❌ BAD: No error listener registered
 * Should trigger: missing-error-listener
 */
async function createClientWithoutErrorListener(): Promise<RedisClientType> {
  const client = createClient({
    url: 'redis://localhost:6379'
  });

  // Missing: client.on('error', handler)
  // Process will crash if any error occurs

  return client;
}

/**
 * ❌ BAD: connect() without try-catch
 * Should trigger: connect-no-error-handling
 */
async function connectWithoutErrorHandling(): Promise<void> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));

  // No try-catch - ECONNREFUSED will cause unhandled rejection
  await client.connect();
  console.log('Connected to Redis');
}

/**
 * ❌ BAD: get() without try-catch
 * Should trigger: get-no-error-handling
 */
async function getWithoutErrorHandling(key: string): Promise<string | null> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  // No try-catch - connection/timeout errors will crash
  const value = await client.get(key);

  await client.close();
  return value;
}

/**
 * ❌ BAD: set() without try-catch
 * Should trigger: set-no-error-handling
 */
async function setWithoutErrorHandling(key: string, value: string): Promise<void> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  // No try-catch - connection errors will cause data loss
  await client.set(key, value);

  await client.close();
}

/**
 * ❌ BAD: del() without try-catch
 * Should trigger: del-no-error-handling
 */
async function delWithoutErrorHandling(key: string): Promise<void> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();

  // No try-catch - connection errors will crash
  await client.del(key);

  await client.close();
}

/**
 * ❌ BAD: Multiple violations - no error listener and no try-catch
 * Should trigger: missing-error-listener, connect-no-error-handling, get-no-error-handling
 */
async function multipleViolations(key: string): Promise<string | null> {
  // Missing error listener
  const client = createClient();

  // No try-catch on connect
  await client.connect();

  // No try-catch on get
  const value = await client.get(key);

  await client.close();
  return value;
}

/**
 * ❌ BAD: Cache adapter without error handling
 */
class BadRedisCacheAdapter {
  private client: RedisClientType;

  constructor() {
    // Missing error listener
    this.client = createClient();
  }

  async connect(): Promise<void> {
    // No try-catch
    await this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    // No try-catch
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any): Promise<void> {
    // No try-catch
    const serialized = JSON.stringify(value);
    await this.client.set(key, serialized);
  }

  async del(key: string): Promise<void> {
    // No try-catch
    await this.client.del(key);
  }
}

/**
 * ❌ BAD: Promise chains without .catch()
 */
function getWithPromiseChainNoCatch(key: string): Promise<string | null> {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));

  return client.connect()
    .then(() => client.get(key))  // No .catch() - unhandled rejection
    .then(value => {
      client.close();
      return value;
    });
}

/**
 * ❌ BAD: Fire-and-forget pattern (no await, no error handling)
 */
function setFireAndForget(key: string, value: string): void {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));

  // No await, no error handling - silent failures
  client.connect();
  client.set(key, value);
  client.close();
}

export {
  createClientWithoutErrorListener,
  connectWithoutErrorHandling,
  getWithoutErrorHandling,
  setWithoutErrorHandling,
  delWithoutErrorHandling,
  multipleViolations,
  BadRedisCacheAdapter,
  getWithPromiseChainNoCatch,
  setFireAndForget
};
