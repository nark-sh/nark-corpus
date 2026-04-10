import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Instance usage test — Ratelimit instance stored in class property.
 * Should trigger violations where try-catch is missing.
 */
class ApiRateLimiter {
  private limiter: Ratelimit;

  constructor() {
    this.limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(5, "60 s"),
      analytics: true,
    });
  }

  /**
   * ❌ Missing try-catch — should trigger ERROR violation
   */
  async check(ip: string) {
    const result = await this.limiter.limit(ip);
    return { allowed: result.success, remaining: result.remaining };
  }

  /**
   * ✅ Proper error handling — should NOT trigger violation
   */
  async checkSafe(ip: string) {
    try {
      const result = await this.limiter.limit(ip);
      return { allowed: result.success, remaining: result.remaining };
    } catch (error) {
      console.error("Rate limiter check failed:", error);
      return { allowed: true, remaining: -1 };
    }
  }
}
