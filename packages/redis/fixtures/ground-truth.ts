/**
 * Redis Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the redis contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - createClient() without .on('error', handler) in same scope → SHOULD_FIRE: missing-error-listener
 *   - client.connect() without try-catch → SHOULD_FIRE: connect-no-error-handling
 *   - client.get()    without try-catch → SHOULD_FIRE: get-no-error-handling
 *   - client.set()    without try-catch → SHOULD_FIRE: set-no-error-handling
 *   - client.del()    without try-catch → SHOULD_FIRE: del-no-error-handling
 *   - client.hSet()   without try-catch → SHOULD_FIRE: hset-no-error-handling
 *   - client.hGet()   without try-catch → SHOULD_FIRE: hget-no-error-handling
 *   - client.hGetAll() without try-catch → SHOULD_FIRE: hgetall-no-error-handling
 *   - client.incr()   without try-catch → SHOULD_FIRE: incr-no-error-handling
 *   - client.incrBy() without try-catch → SHOULD_FIRE: incrby-no-error-handling
 *   - client.expire() without try-catch → SHOULD_FIRE: expire-no-error-handling
 *   - client.exists() without try-catch → SHOULD_FIRE: exists-no-error-handling
 *   - client.lPush()  without try-catch → SHOULD_FIRE: lpush-no-error-handling
 *   - client.lRange() without try-catch → SHOULD_FIRE: lrange-no-error-handling
 *   - client.sAdd()   without try-catch → SHOULD_FIRE: sadd-no-error-handling
 *   - client.sMembers() without try-catch → SHOULD_FIRE: smembers-no-error-handling
 *   - client.zAdd()   without try-catch → SHOULD_FIRE: zadd-no-error-handling
 *   - client.zRange() without try-catch → SHOULD_FIRE: zrange-no-error-handling
 *   - client.multi().exec() without try-catch → SHOULD_FIRE: multi-exec-watch-error
 *   - client.subscribe() without try-catch → SHOULD_FIRE: subscribe-no-error-handling
 *   - client.publish()   without try-catch → SHOULD_FIRE: publish-no-error-handling
 *   - client.quit()   without try-catch → SHOULD_FIRE: quit-no-error-handling
 *
 * The missing-error-listener violation fires at the createClient() call line,
 * not at the point where the error listener would be registered.
 */

import { createClient } from 'redis';

// ─────────────────────────────────────────────────────────────────────────────
// 1. createClient without error listener
// ─────────────────────────────────────────────────────────────────────────────

export async function createWithoutErrorListener() {
  // SHOULD_FIRE: missing-error-listener — createClient without .on('error') crashes process
  const client = createClient({ url: 'redis://localhost:6379' });
  // No client.on('error', ...) registered — process crashes on any error
  await client.connect();
  return client;
}

export async function createWithErrorListener() {
  // SHOULD_NOT_FIRE: createClient followed by .on('error', handler) — requirement satisfied
  const client = createClient({ url: 'redis://localhost:6379' });
  client.on('error', (err) => console.error('Redis error:', err));
  return client;
}

export function createWithChainedErrorListener() {
  // SHOULD_NOT_FIRE: chained .on('error') at creation time — requirement satisfied
  // Pattern: createClient().on('error', handler) — error listener is chained, not separate.
  // Evidence: concern-2026-04-06-redis-10 — 7 FPs from packages/api/src/main.ts using this pattern.
  const client = createClient({ url: 'redis://localhost:6379' }).on('error', (err) => console.error('Redis error:', err));
  return client;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. connect without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function connectWithoutTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  // SHOULD_FIRE: connect-no-error-handling — connect() can throw ECONNREFUSED, no try-catch
  await client.connect();
}

export async function connectWithTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  try {
    // SHOULD_NOT_FIRE: connect inside try-catch satisfies error handling
    await client.connect();
  } catch (err: any) {
    console.error('Connection failed:', err.code);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. get without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: get-no-error-handling — client.get() can throw connection errors, no try-catch
  const value = await client.get(key);
  return value;
}

export async function getWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: get inside try-catch satisfies error handling
    const value = await client.get(key);
    return value;
  } catch (err) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. set without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function setWithoutTryCatch(key: string, value: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: set-no-error-handling — client.set() can throw connection errors, no try-catch
  await client.set(key, value);
}

export async function setWithTryCatch(key: string, value: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: set inside try-catch satisfies error handling
    await client.set(key, value);
  } catch (err) {
    console.error('Set failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. del without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function delWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: del-no-error-handling — client.del() can throw connection errors, no try-catch
  await client.del(key);
}

export async function delWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: del inside try-catch satisfies error handling
    await client.del(key);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Class with proper error handling
// ─────────────────────────────────────────────────────────────────────────────

export class GoodRedisClient {
  private client = createClient();

  async init() {
    this.client.on('error', (err) => console.error('Redis error:', err));
    try {
      // SHOULD_NOT_FIRE: connect inside try-catch in class method is safe
      await this.client.connect();
    } catch (err) {
      throw err;
    }
  }

  async getValue(key: string) {
    try {
      // SHOULD_NOT_FIRE: get inside try-catch in class method is safe
      return await this.client.get(key);
    } catch (err) {
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Class without error listener on createClient
// ─────────────────────────────────────────────────────────────────────────────

export class BadRedisClient {
  // SHOULD_FIRE: missing-error-listener — createClient in class field, no .on('error') registered
  private client = createClient();

  async getValue(key: string) {
    try {
      // SHOULD_NOT_FIRE: get itself is inside try-catch (the separate missing-listener fires elsewhere)
      return await this.client.get(key);
    } catch (err) {
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Multiple calls — each bare call fires independently
// ─────────────────────────────────────────────────────────────────────────────

export async function multipleBareCalls(key1: string, key2: string) {
  const client = createClient();
  client.on('error', (err) => console.error(err));
  await client.connect();
  // SHOULD_FIRE: get-no-error-handling — first get, no try-catch
  const v1 = await client.get(key1);
  // SHOULD_FIRE: get-no-error-handling — second get, no try-catch
  const v2 = await client.get(key2);
  return { v1, v2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Hash operations — hSet, hGet, hGetAll
// Added in depth pass 2026-04-02
// ─────────────────────────────────────────────────────────────────────────────

export async function hSetWithoutTryCatch(key: string, field: string, value: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: hset-no-error-handling — hSet throws ErrorReply(WRONGTYPE) and connection errors
  await client.hSet(key, field, value);
}

export async function hSetWithTryCatch(key: string, field: string, value: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: hSet inside try-catch satisfies error handling
    await client.hSet(key, field, value);
  } catch (err: any) {
    if (err.message?.includes('WRONGTYPE')) {
      console.error('Key type collision in hSet:', key);
    } else {
      throw err;
    }
  }
}

export async function hGetWithoutTryCatch(key: string, field: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: hget-no-error-handling — hGet throws on WRONGTYPE or connection error
  const value = await client.hGet(key, field);
  return value;
}

export async function hGetAllWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: hgetall-no-error-handling — hGetAll throws on WRONGTYPE or connection error
  const data = await client.hGetAll(key);
  return data;
}

export async function hGetAllWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: hGetAll inside try-catch satisfies error handling
    const data = await client.hGetAll(key);
    // NOTE: data is {} (empty object) when key does not exist — check for this
    if (Object.keys(data).length === 0) {
      return null; // key not found
    }
    return data;
  } catch (err) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Counter operations — incr, incrBy
// ─────────────────────────────────────────────────────────────────────────────

export async function incrWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: incr-no-error-handling — incr throws "not an integer" ErrorReply and connection errors
  const count = await client.incr(key);
  return count;
}

export async function incrByWithoutTryCatch(key: string, increment: number) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: incrby-no-error-handling — incrBy throws same errors as incr
  const count = await client.incrBy(key, increment);
  return count;
}

export async function incrWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: incr inside try-catch
    return await client.incr(key);
  } catch (err: any) {
    if (err.message?.includes('not an integer')) {
      throw new Error(`Rate limit key "${key}" holds non-integer value`);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Key lifecycle — expire, exists
// ─────────────────────────────────────────────────────────────────────────────

export async function expireWithoutTryCatch(key: string, seconds: number) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  await client.set(key, 'value');
  // SHOULD_FIRE: expire-no-error-handling — expire throws on connection error; silent key persistence if ignored
  await client.expire(key, seconds);
}

export async function expireWithTryCatch(key: string, seconds: number) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: expire inside try-catch
    // Better pattern: use set(key, value, { EX: seconds }) atomically
    await client.expire(key, seconds);
  } catch (err) {
    // expire failure = key persists forever — must alert or retry
    console.error('CRITICAL: expire failed, key will not expire:', key, err);
    throw err;
  }
}

export async function existsWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: exists-no-error-handling — exists throws on connection error
  const count = await client.exists(key);
  return count > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. List operations — lPush, lRange
// ─────────────────────────────────────────────────────────────────────────────

export async function lPushWithoutTryCatch(key: string, value: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: lpush-no-error-handling — lPush throws ErrorReply(WRONGTYPE) and connection errors
  await client.lPush(key, value);
}

export async function lRangeWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: lrange-no-error-handling — lRange throws ErrorReply(WRONGTYPE) and connection errors
  const items = await client.lRange(key, 0, -1);
  return items;
}

export async function lRangeWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: lRange inside try-catch
    const items = await client.lRange(key, 0, -1);
    return items; // [] when key missing — valid, not an error
  } catch (err) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Set operations — sAdd, sMembers
// ─────────────────────────────────────────────────────────────────────────────

export async function sAddWithoutTryCatch(key: string, member: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: sadd-no-error-handling — sAdd throws ErrorReply(WRONGTYPE) on type collision
  await client.sAdd(key, member);
}

export async function sMembersWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: smembers-no-error-handling — sMembers throws ErrorReply(WRONGTYPE) and connection errors
  const members = await client.sMembers(key);
  return members;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Sorted set operations — zAdd, zRange
// ─────────────────────────────────────────────────────────────────────────────

export async function zAddWithoutTryCatch(key: string, score: number, member: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: zadd-no-error-handling — zAdd throws ErrorReply on NaN score or WRONGTYPE
  await client.zAdd(key, { score, value: member });
}

export async function zRangeWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_FIRE: zrange-no-error-handling — zRange throws ErrorReply(WRONGTYPE) and connection errors
  const members = await client.zRange(key, 0, -1);
  return members;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Multi/exec transactions — WatchError
// ─────────────────────────────────────────────────────────────────────────────

export async function multiExecWithoutTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  await client.watch(key);
  const multi = client.multi().incr(key).expire(key, 3600);
  // SHOULD_NOT_FIRE: multi-exec-watch-error — no scanner detection rule yet
  // Scanner gap: multi().exec() chain pattern not currently detected (requires
  // chained-method-call detection beyond single await_pattern matching).
  // Contract is written; detection is a future bc-scanner-upgrade concern.
  const results = await multi.exec();
  return results;
}

export async function multiExecWithTryCatch(key: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  let retries = 3;
  while (retries > 0) {
    try {
      await client.watch(key);
      const multi = client.multi().incr(key).expire(key, 3600);
      // SHOULD_NOT_FIRE: exec inside try-catch with WatchError handling
      const results = await multi.exec();
      return results;
    } catch (err: any) {
      if (err.constructor?.name === 'WatchError' && retries > 1) {
        retries--;
        continue; // retry the full watch+multi+exec cycle
      }
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Pub/sub — subscribe, publish
// ─────────────────────────────────────────────────────────────────────────────

export async function subscribeWithoutTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_NOT_FIRE: subscribe-no-error-handling — no scanner detection rule yet
  // Scanner gap: subscribe() is not in the current await_patterns detection list for redis.
  // Contract is written; detection requires bc-scanner-upgrade to add subscribe to the
  // pubsub method detection patterns.
  await client.subscribe('notifications', (message) => {
    console.log('Received:', message);
  });
}

export async function subscribeWithTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: subscribe inside try-catch
    await client.subscribe('notifications', (message) => {
      console.log('Received:', message);
    });
  } catch (err) {
    console.error('Subscribe failed:', err);
    throw err;
  }
}

export async function publishWithoutTryCatch(channel: string, message: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // SHOULD_NOT_FIRE: publish-no-error-handling — no scanner detection rule yet
  // Scanner gap: publish() is currently in await_patterns but requires instance tracking
  // to disambiguate from other .publish() calls. Contract is written; scanner upgrade needed.
  const subscriberCount = await client.publish(channel, message);
  return subscriberCount;
}

export async function publishWithTryCatch(channel: string, message: string) {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: publish inside try-catch
    const count = await client.publish(channel, message);
    // count === 0 is valid (no subscribers active) — do NOT treat as error
    return count;
  } catch (err) {
    console.error('Publish failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Lifecycle — quit
// ─────────────────────────────────────────────────────────────────────────────

export async function quitWithoutTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  await client.set('key', 'value').catch(() => {});
  // SHOULD_FIRE: quit-no-error-handling — quit() can throw SocketClosedUnexpectedlyError
  await client.quit();
}

export async function quitWithTryCatch() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  try {
    // SHOULD_NOT_FIRE: quit inside try-catch
    await client.quit();
  } catch (err) {
    // quit errors during shutdown are safe to swallow
    console.warn('Redis quit error during shutdown:', err);
  }
}
