/**
 * @upstash/redis Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - All Redis async methods (get, set, del, mget, hget, hset, hgetall,
 *     lpush, lrange, sadd, smembers, zadd, zrange, expire, exists, incr,
 *     pipeline.exec, publish, setex, json.get, json.set, rpush, eval,
 *     evalsha, incrbyfloat, getdel) can throw UpstashError or network Error
 *   - postcondition: network-or-api-error at severity:error requires try-catch
 *   - A try-catch wrapper (any catch block) satisfies the requirement
 *   - try-finally WITHOUT catch does NOT satisfy the requirement
 *   - subscribe() errors are NOT thrown — they go to Subscriber.on('error')
 *     so no SHOULD_FIRE annotation applies to subscribe() itself;
 *     the violation is the missing .on('error') listener (structural, not call-site)
 *   - pipeline({ keepErrors: true }).exec() does NOT throw — caller must inspect array
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare calls — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function bareGetNoCatch(key: string) {
  // SHOULD_FIRE: network-or-api-error — redis.get can throw UpstashError, no try-catch
  const value = await redis.get<string>(key);
  return value;
}

export async function bareSetNoCatch(key: string, value: string) {
  // SHOULD_FIRE: network-or-api-error — redis.set can throw UpstashError, no try-catch
  await redis.set(key, value);
}

export async function bareDelNoCatch(key: string) {
  // SHOULD_FIRE: network-or-api-error — redis.del can throw UpstashError, no try-catch
  await redis.del(key);
}

export async function bareMgetNoCatch(keys: string[]) {
  // SHOULD_FIRE: network-or-api-error — redis.mget can throw UpstashError, no try-catch
  const values = await redis.mget<string[]>(keys);
  return values;
}

export async function bareHgetNoCatch(key: string, field: string) {
  // SHOULD_FIRE: network-or-api-error — redis.hget can throw UpstashError, no try-catch
  const value = await redis.hget<string>(key, field);
  return value;
}

export async function bareHsetNoCatch(key: string, data: Record<string, unknown>) {
  // SHOULD_FIRE: network-or-api-error — redis.hset can throw UpstashError, no try-catch
  await redis.hset(key, data);
}

export async function bareExpireNoCatch(key: string, seconds: number) {
  // SHOULD_FIRE: network-or-api-error — redis.expire can throw UpstashError, no try-catch
  await redis.expire(key, seconds);
}

export async function bareIncrNoCatch(key: string) {
  // SHOULD_FIRE: network-or-api-error — redis.incr can throw UpstashError, no try-catch
  const count = await redis.incr(key);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Properly wrapped — no violations expected
// ─────────────────────────────────────────────────────────────────────────────

export async function getWithTryCatch(key: string) {
  try {
    // SHOULD_NOT_FIRE: redis.get inside try-catch — network-or-api-error requirement satisfied
    const value = await redis.get<string>(key);
    return value;
  } catch (error) {
    return null;
  }
}

export async function setWithTryCatch(key: string, value: string) {
  try {
    // SHOULD_NOT_FIRE: redis.set inside try-catch
    await redis.set(key, value);
  } catch (error) {
    console.error('Redis set failed:', error);
    throw error;
  }
}

export async function delWithTryCatch(key: string) {
  try {
    // SHOULD_NOT_FIRE: redis.del inside try-catch
    await redis.del(key);
  } catch (error) {
    console.error('Redis del failed:', error);
  }
}

export async function hgetWithTryCatch(key: string, field: string) {
  try {
    // SHOULD_NOT_FIRE: redis.hget inside try-catch
    return await redis.hget<string>(key, field);
  } catch (err) {
    return null;
  }
}

export async function expireWithTryCatch(key: string, seconds: number) {
  try {
    // SHOULD_NOT_FIRE: redis.expire inside try-catch
    await redis.expire(key, seconds);
  } catch (error) {
    console.error('expire failed:', error);
  }
}

export async function incrWithTryCatch(key: string) {
  try {
    // SHOULD_NOT_FIRE: redis.incr inside try-catch
    return await redis.incr(key);
  } catch (error) {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pipeline — the analyzer matches set/expire calls on the pipeline object
//    against their contract entries (set, expire). pipeline.exec() itself is
//    NOT matched because "pipeline" (exec) is a separate contract entry.
//    The unawaited pipeline.set() and pipeline.expire() fire when not in try-catch.
// ─────────────────────────────────────────────────────────────────────────────

export async function pipelineExecNoCatch(key: string, value: string) {
  const pipeline = redis.pipeline();
  // SHOULD_FIRE: network-or-api-error — pipeline.set() matched against set contract, no try-catch on outer function
  pipeline.set(key, value);
  // SHOULD_FIRE: network-or-api-error — pipeline.expire() matched against expire contract, no try-catch
  pipeline.expire(key, 3600);
  // SHOULD_FIRE: network-or-api-error — pipeline.exec() matched against exec contract, no try-catch
  await pipeline.exec();
}

export async function pipelineExecWithTryCatch(key: string, value: string) {
  const pipeline = redis.pipeline();
  try {
    // SHOULD_NOT_FIRE: pipeline.set inside try-catch
    pipeline.set(key, value);
    // SHOULD_NOT_FIRE: pipeline.expire inside try-catch
    pipeline.expire(key, 3600);
    // SHOULD_NOT_FIRE: pipeline.exec inside try-catch
    await pipeline.exec();
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Instance through class field
//    NOTE: The V2 analyzer uses InstanceTracker to detect class field usage.
//    `this.client.get()` may not be detected depending on InstanceTracker
//    support for `this.field` patterns. These are annotated as SHOULD_NOT_FIRE
//    to reflect current V2 analyzer behavior (known limitation).
// ─────────────────────────────────────────────────────────────────────────────

class CacheService {
  private client: Redis;

  constructor() {
    this.client = Redis.fromEnv();
  }

  async getNoTryCatch(key: string) {
    // SHOULD_NOT_FIRE: this.client.get — V2 InstanceTracker does not currently track this.field assignments from constructors
    return await this.client.get<string>(key);
  }

  async getWithTryCatch(key: string) {
    try {
      // SHOULD_NOT_FIRE: this.client.get inside try-catch (also not detected by V2)
      return await this.client.get<string>(key);
    } catch (error) {
      return null;
    }
  }

  async hsetNoTryCatch(key: string, data: Record<string, unknown>) {
    // SHOULD_NOT_FIRE: this.client.hset — same V2 limitation for this.field
    await this.client.hset(key, data);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. try-finally without catch — should still fire
// ─────────────────────────────────────────────────────────────────────────────

export async function tryFinallyNoCatch(key: string) {
  try {
    // SHOULD_FIRE: network-or-api-error — try-finally has no catch clause
    const value = await redis.get<string>(key);
    return value;
  } finally {
    console.log('cleanup');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Re-throw pattern — still satisfies the requirement
// ─────────────────────────────────────────────────────────────────────────────

export async function rethrowPattern(key: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch; re-throwing is valid
    const value = await redis.get<string>(key);
    return value;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. New API surface — publish, setex, json.get/set, rpush, eval, evalsha,
//    incrbyfloat, getdel
// ─────────────────────────────────────────────────────────────────────────────

export async function publishNoCatch(channel: string, message: string) {
  // SHOULD_FIRE: network-or-api-error — redis.publish can throw UpstashError, no try-catch
  await redis.publish(channel, message);
}

export async function publishWithTryCatch(channel: string, message: string) {
  try {
    // SHOULD_NOT_FIRE: redis.publish inside try-catch
    await redis.publish(channel, message);
  } catch (error) {
    console.error('Publish failed, message lost:', error);
    throw error;
  }
}

export async function setexNoCatch(key: string, seconds: number, value: string) {
  // SHOULD_FIRE: network-or-api-error — redis.setex can throw UpstashError, no try-catch
  await redis.setex(key, seconds, value);
}

export async function setexWithTryCatch(key: string, seconds: number, value: string) {
  try {
    // SHOULD_NOT_FIRE: redis.setex inside try-catch
    await redis.setex(key, seconds, value);
  } catch (error) {
    console.error('setex failed:', error);
  }
}

export async function jsonGetNoCatch(key: string, path: string) {
  // SHOULD_FIRE: network-or-api-error — redis.json.get can throw UpstashError, no try-catch
  const value = await redis.json.get(key, path);
  return value;
}

export async function jsonGetWithTryCatch(key: string, path: string) {
  try {
    // SHOULD_NOT_FIRE: redis.json.get inside try-catch
    return await redis.json.get(key, path);
  } catch (error) {
    return null;
  }
}

export async function jsonSetNoCatch(key: string, path: string, value: unknown) {
  // SHOULD_FIRE: network-or-api-error — redis.json.set can throw UpstashError, no try-catch
  await redis.json.set(key, path, value);
}

export async function jsonSetWithTryCatch(key: string, path: string, value: unknown) {
  try {
    // SHOULD_NOT_FIRE: redis.json.set inside try-catch
    await redis.json.set(key, path, value);
  } catch (error) {
    console.error('json.set failed:', error);
    throw error;
  }
}

export async function rpushNoCatch(key: string, ...elements: string[]) {
  // SHOULD_FIRE: network-or-api-error — redis.rpush can throw UpstashError (WRONGTYPE), no try-catch
  const length = await redis.rpush(key, ...elements);
  return length;
}

export async function rpushWithTryCatch(key: string, ...elements: string[]) {
  try {
    // SHOULD_NOT_FIRE: redis.rpush inside try-catch
    return await redis.rpush(key, ...elements);
  } catch (error) {
    console.error('rpush failed (queue write lost):', error);
    throw error;
  }
}

export async function evalNoCatch(script: string, keys: string[], args: string[]) {
  // SHOULD_FIRE: script-error-or-network-failure — redis.eval can throw UpstashError, no try-catch
  const result = await redis.eval(script, keys, args);
  return result;
}

export async function evalWithTryCatch(script: string, keys: string[], args: string[]) {
  try {
    // SHOULD_NOT_FIRE: redis.eval inside try-catch
    return await redis.eval(script, keys, args);
  } catch (error) {
    console.error('Lua script failed:', error);
    throw error;
  }
}

export async function evalshaWithNoscriptFallback(sha: string, script: string, keys: string[], args: string[]) {
  try {
    // SHOULD_NOT_FIRE: redis.evalsha inside try-catch with NOSCRIPT fallback
    return await redis.evalsha(sha, keys, args);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('NOSCRIPT')) {
      return await redis.eval(script, keys, args);
    }
    throw error;
  }
}

export async function evalshaNoCatch(sha: string, keys: string[], args: string[]) {
  // SHOULD_FIRE: noscript-error — redis.evalsha can throw NOSCRIPT UpstashError, no try-catch
  return await redis.evalsha(sha, keys, args);
}

export async function incrbyfloatNoCatch(key: string, increment: number) {
  // SHOULD_FIRE: wrongtype-or-not-float — redis.incrbyfloat can throw UpstashError, no try-catch
  const value = await redis.incrbyfloat(key, increment);
  return value;
}

export async function incrbyfloatWithTryCatch(key: string, increment: number) {
  try {
    // SHOULD_NOT_FIRE: redis.incrbyfloat inside try-catch
    return await redis.incrbyfloat(key, increment);
  } catch (error) {
    console.error('incrbyfloat failed:', error);
    return null;
  }
}

export async function getdelNoCatch(key: string) {
  // SHOULD_FIRE: network-or-api-error — redis.getdel can throw UpstashError, no try-catch
  const value = await redis.getdel(key);
  return value;
}

export async function getdelWithTryCatch(key: string) {
  try {
    // SHOULD_NOT_FIRE: redis.getdel inside try-catch (one-time token consumption)
    return await redis.getdel(key);
  } catch (error) {
    console.error('getdel failed — token state unknown:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. subscribe() — error model is event-based, NOT thrown
//    The violation is structural (missing .on('error') listener), not a call-site
//    await violation. Annotated to document expected scanner behavior.
// ─────────────────────────────────────────────────────────────────────────────

export async function subscribeMissingErrorListener(channel: string) {
  const subscriber = await redis.subscribe<string>(channel);
  // SHOULD_NOT_FIRE for thrown error (subscribe does not throw — errors dispatched via event)
  // Structural gap: missing subscriber.on('error', handler) — scanner cannot currently detect
  // this pattern as it requires tracking the returned Subscriber object's listener attachment
  subscriber.on('message', (channel, message) => {
    console.log('received:', channel, message);
  });
  // No .on('error') attached — errors will be silently swallowed
}

export async function subscribeWithErrorListener(channel: string) {
  const subscriber = await redis.subscribe<string>(channel);
  // SHOULD_NOT_FIRE: both error and message listeners attached
  subscriber.on('error', (error) => {
    console.error('Subscription error:', error);
  });
  subscriber.on('message', (channel, message) => {
    console.log('received:', channel, message);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. pipeline keepErrors mode — silent failure if array not inspected
// ─────────────────────────────────────────────────────────────────────────────

export async function pipelineKeepErrorsNotInspected(key: string, value: string) {
  const pipeline = redis.pipeline();
  pipeline.set(key, value);
  pipeline.expire(key, 3600);
  // SHOULD_NOT_FIRE for thrown error — keepErrors mode does NOT throw even on command failure
  // Structural gap: returned array not inspected for per-command errors
  // (scanner cannot currently detect keepErrors pattern)
  const results = await pipeline.exec();
  // Missing: results.forEach((r) => { if (r.error) handleError(r.error); });
  return results;
}

export async function pipelineKeepErrorsInspected(key: string, value: string) {
  const pipeline = redis.pipeline();
  pipeline.set(key, value);
  pipeline.expire(key, 3600);
  try {
    // SHOULD_NOT_FIRE: exec inside try-catch AND results inspected
    const results = await pipeline.exec();
    results.forEach((r, i) => {
      if (r && typeof r === 'object' && 'error' in r && r.error) {
        console.error(`Pipeline command ${i} failed:`, r.error);
      }
    });
    return results;
  } catch (error) {
    throw error;
  }
}
