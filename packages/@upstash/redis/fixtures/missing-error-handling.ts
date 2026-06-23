/**
 * Missing error handling for @upstash/redis
 *
 * This file demonstrates INCORRECT usage — missing try-catch.
 * The analyzer should produce ERROR violations for each uncovered await.
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

// VIOLATION: redis.get without try-catch
export async function getCachedMissingCatch(key: string): Promise<string | null> {
  const value = await redis.get<string>(key);
  return value;
}

// VIOLATION: redis.set without try-catch
export async function setCachedMissingCatch(key: string, value: string): Promise<void> {
  await redis.set(key, value);
}

// VIOLATION: redis.del without try-catch
export async function deleteCachedMissingCatch(key: string): Promise<void> {
  await redis.del(key);
}

// VIOLATION: redis.mget without try-catch
export async function getBatchMissingCatch(keys: string[]): Promise<(string | null)[]> {
  const values = await redis.mget<string[]>(keys);
  return values;
}

// VIOLATION: redis.hget without try-catch
export async function getHashFieldMissingCatch(key: string, field: string): Promise<string | null> {
  const value = await redis.hget<string>(key, field);
  return value;
}

// VIOLATION: redis.hset without try-catch
export async function setHashFieldsMissingCatch(key: string, data: Record<string, unknown>): Promise<void> {
  await redis.hset(key, data);
}

// VIOLATION: redis.hgetall without try-catch
export async function getAllHashFieldsMissingCatch(key: string): Promise<Record<string, unknown> | null> {
  const result = await redis.hgetall(key);
  return result;
}

// VIOLATION: redis.lpush without try-catch
export async function addToListMissingCatch(key: string, value: string): Promise<void> {
  await redis.lpush(key, value);
}

// VIOLATION: redis.sadd without try-catch
export async function addToSetMissingCatch(key: string, ...members: string[]): Promise<void> {
  await redis.sadd(key, ...members);
}

// VIOLATION: redis.expire without try-catch
export async function setExpiryMissingCatch(key: string, seconds: number): Promise<void> {
  await redis.expire(key, seconds);
}

// VIOLATION: redis.incr without try-catch
export async function incrementCounterMissingCatch(key: string): Promise<number> {
  const count = await redis.incr(key);
  return count;
}

// VIOLATION: try-finally without catch
export async function tryFinallyNoCatch(key: string): Promise<string | null> {
  try {
    const value = await redis.get<string>(key);
    return value;
  } finally {
    console.log('cleanup');
  }
}

// VIOLATION: redis.xadd without try-catch (added pass 13)
// @expect-violation: wrongtype-or-network-error
export async function appendStreamEntryMissingCatch(stream: string, payload: Record<string, string>): Promise<string> {
  const id = await redis.xadd(stream, '*', payload);
  return id ?? '';
}

// VIOLATION: redis.xgroup without try-catch (added pass 13) — BUSYGROUP is the
// canonical idempotent-startup case; without try-catch the entire consumer init crashes
// @expect-violation: busygroup-or-nogroup-error
export async function ensureConsumerGroupMissingCatch(stream: string, group: string): Promise<void> {
  await redis.xgroup(stream, { type: 'CREATE', group, id: '$', options: { MKSTREAM: true } });
}

// VIOLATION: redis.xreadgroup without try-catch (added pass 13) — NOGROUP on
// cold start silently halts every consumer if not handled
// @expect-violation: nogroup-error
export async function readGroupEntriesMissingCatch(stream: string, group: string, consumer: string): Promise<unknown[]> {
  const entries = await redis.xreadgroup(group, consumer, stream, '>');
  return entries ?? [];
}

// VIOLATION: redis.copy() called without checking return value (added pass 13) —
// silent NOT_COPIED if destination exists; subsequent reads from dst return wrong data
// @expect-violation: copy-result-not-checked
export async function copyKeyResultIgnored(src: string, dst: string): Promise<void> {
  await redis.copy(src, dst);
}

// VIOLATION: redis.flushdb() called without try-catch in non-test code path (added pass 13)
// Destructive op with no audit trail
// @expect-violation: destructive-no-try-catch
export async function resetDatabaseMissingCatch(): Promise<void> {
  await redis.flushdb();
}
