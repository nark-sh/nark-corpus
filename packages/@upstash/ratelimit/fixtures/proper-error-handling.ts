import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

/**
 * Proper error handling — should produce 0 violations.
 * Wraps ratelimit.limit() in try-catch.
 */
async function checkRateLimitProper(identifier: string): Promise<boolean> {
  try {
    const result = await ratelimit.limit(identifier);
    return result.success;
  } catch (error) {
    // Redis unreachable — fail open (allow request) and log
    console.error("Rate limiter error:", error);
    return true;
  }
}

/**
 * Proper error handling on blockUntilReady — should produce 0 violations.
 */
async function blockUntilReadyProper(identifier: string): Promise<boolean> {
  try {
    const result = await ratelimit.blockUntilReady(identifier, 5000);
    return result.success;
  } catch (error) {
    console.error("Rate limiter blockUntilReady error:", error);
    return false;
  }
}
