/**
 * @upstash/ratelimit Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @upstash/ratelimit contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - ratelimit.limit() without try-catch     → SHOULD_FIRE: ratelimit-limit-no-try-catch
 *   - ratelimit.limit() inside try-catch      → SHOULD_NOT_FIRE
 *   - ratelimit.blockUntilReady() no catch    → SHOULD_FIRE: ratelimit-blockuntilready-no-try-catch
 *   - ratelimit.blockUntilReady() with catch  → SHOULD_NOT_FIRE
 *
 * Coverage:
 *   - Section 1: bare limit() → SHOULD_FIRE
 *   - Section 2: limit() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 3: bare blockUntilReady() → SHOULD_FIRE
 *   - Section 4: blockUntilReady() inside try-catch → SHOULD_NOT_FIRE
 *   - Section 5: new Ratelimit() constructor → SHOULD_NOT_FIRE (synchronous)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare limit() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function checkLimitNoCatch(identifier: string) {
  // SHOULD_FIRE: ratelimit-limit-no-try-catch — limit() without try-catch, Redis failure unhandled
  const result = await ratelimit.limit(identifier);
  return result.success;
}

export async function checkLimitInApiRoute(ip: string) {
  // SHOULD_FIRE: ratelimit-limit-no-try-catch — Redis down crashes entire API route
  const { success, remaining } = await ratelimit.limit(ip);
  return { allowed: success, remaining };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. limit() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function checkLimitWithCatch(identifier: string) {
  try {
    // SHOULD_NOT_FIRE: limit() inside try-catch satisfies the error handling requirement
    const result = await ratelimit.limit(identifier);
    return result.success;
  } catch (error) {
    console.error("Rate limiter error:", error);
    return true; // fail open
  }
}

export async function checkLimitWithCatchAndLog(identifier: string) {
  try {
    // SHOULD_NOT_FIRE: properly handled with catch
    const { success, limit, remaining } = await ratelimit.limit(identifier);
    return { allowed: success, limit, remaining };
  } catch (error) {
    // Redis unavailable — fail open
    return { allowed: true, limit: 0, remaining: -1 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bare blockUntilReady() — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function blockUntilReadyNoCatch(identifier: string) {
  // SHOULD_FIRE: ratelimit-blockuntilready-no-try-catch — throws if timeout <= 0 or Redis fails
  const result = await ratelimit.blockUntilReady(identifier, 60_000);
  return result.success;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. blockUntilReady() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function blockUntilReadyWithCatch(identifier: string) {
  try {
    // SHOULD_NOT_FIRE: blockUntilReady() wrapped in try-catch
    const result = await ratelimit.blockUntilReady(identifier, 60_000);
    return result.success;
  } catch (error) {
    console.error("blockUntilReady failed:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Constructor — synchronous, not contracted
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: new Ratelimit() is synchronous construction, not contracted
const anotherLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, "1 m"),
});
