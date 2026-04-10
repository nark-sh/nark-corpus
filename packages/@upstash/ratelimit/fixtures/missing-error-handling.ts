import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

/**
 * Missing error handling — should trigger ERROR violation.
 * ratelimit.limit() can throw if Redis is unreachable.
 */
async function checkRateLimitMissing(identifier: string) {
  // ❌ No try-catch — Redis failure crashes this function
  const result = await ratelimit.limit(identifier);
  return result.success;
}

/**
 * Missing error handling on blockUntilReady — should trigger ERROR violation.
 */
async function blockUntilReadyMissing(identifier: string) {
  // ❌ No try-catch — throws if timeout <= 0 or Redis is unreachable
  const result = await ratelimit.blockUntilReady(identifier, 5000);
  return result.success;
}
