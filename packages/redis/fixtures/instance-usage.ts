/**
 * Redis Fixtures: Instance Usage Patterns
 *
 * This file tests detection of redis usage via client instances.
 * Should trigger violations where error handling is missing.
 */

import { createClient, RedisClientType } from 'redis';

/**
 * ✅ GOOD: Instance stored with proper error handling
 */
class GoodRedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();

    // Error listener registered
    this.client.on('error', (err) => {
      console.error('Redis service error:', err);
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Failed to initialize Redis:', err);
      throw err;
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Get failed:', err);
      return null;
    }
  }

  async setValue(key: string, value: string): Promise<boolean> {
    try {
      await this.client.set(key, value);
      return true;
    } catch (err) {
      console.error('Set failed:', err);
      return false;
    }
  }

  async deleteKey(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (err) {
      console.error('Delete failed:', err);
      return 0;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.client.close();
    } catch (err) {
      console.error('Shutdown error:', err);
    }
  }
}

/**
 * ❌ BAD: Instance stored but missing error listener
 * Should trigger: missing-error-listener
 */
class BadRedisServiceNoListener {
  private client: RedisClientType;

  constructor() {
    // Missing error listener
    this.client = createClient();
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Failed to initialize:', err);
      throw err;
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Get failed:', err);
      return null;
    }
  }
}

/**
 * ❌ BAD: Instance with error listener but missing try-catch
 * Should trigger: get-no-error-handling, set-no-error-handling
 */
class BadRedisServiceNoTryCatch {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      throw err;
    }
  }

  async getValue(key: string): Promise<string | null> {
    // No try-catch
    return await this.client.get(key);
  }

  async setValue(key: string, value: string): Promise<void> {
    // No try-catch
    await this.client.set(key, value);
  }
}

/**
 * ❌ BAD: Instance stored in module-level variable
 */
let moduleClient: RedisClientType;

async function initializeModuleClient(): Promise<void> {
  // Missing error listener
  moduleClient = createClient();
  // No try-catch
  await moduleClient.connect();
}

async function getFromModule(key: string): Promise<string | null> {
  // No try-catch
  return await moduleClient.get(key);
}

async function setInModule(key: string, value: string): Promise<void> {
  // No try-catch
  await moduleClient.set(key, value);
}

/**
 * ✅ GOOD: Singleton pattern with proper error handling
 */
class RedisSingleton {
  private static instance: RedisSingleton;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.error('Redis singleton error:', err);
    });
  }

  static getInstance(): RedisSingleton {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new RedisSingleton();
    }
    return RedisSingleton.instance;
  }

  async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (err) {
      console.error('Singleton connect failed:', err);
      throw err;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Singleton get failed:', err);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value);
    } catch (err) {
      console.error('Singleton set failed:', err);
      throw err;
    }
  }
}

/**
 * ✅ GOOD: Factory pattern with proper error handling
 */
function createRedisClient(): RedisClientType {
  const client = createClient();

  // Error listener registered
  client.on('error', (err) => {
    console.error('Factory client error:', err);
  });

  return client;
}

async function useFactoryClient(): Promise<void> {
  const client = createRedisClient();

  try {
    await client.connect();
    const value = await client.get('key');
    console.log('Value:', value);
  } catch (err) {
    console.error('Factory client usage failed:', err);
  } finally {
    try {
      await client.close();
    } catch (err) {
      console.error('Factory client close failed:', err);
    }
  }
}

/**
 * ❌ BAD: Multiple clients without proper error handling
 */
async function multipleClientsNoErrorHandling(): Promise<void> {
  // Missing error listeners on both
  const client1 = createClient();
  const client2 = createClient();

  // No try-catch
  await client1.connect();
  await client2.connect();

  // No try-catch
  const value1 = await client1.get('key1');
  const value2 = await client2.get('key2');

  console.log(value1, value2);

  await client1.close();
  await client2.close();
}

export {
  GoodRedisService,
  BadRedisServiceNoListener,
  BadRedisServiceNoTryCatch,
  initializeModuleClient,
  getFromModule,
  setInModule,
  RedisSingleton,
  createRedisClient,
  useFactoryClient,
  multipleClientsNoErrorHandling
};
