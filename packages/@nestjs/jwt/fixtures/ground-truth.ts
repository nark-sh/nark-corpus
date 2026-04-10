/**
 * @nestjs/jwt Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: verify-no-try-catch, verify-sync-no-try-catch, sign-async-no-try-catch
 *
 * Key rules:
 *   - await jwtService.verifyAsync() without try-catch → SHOULD_FIRE
 *   - await jwtService.verifyAsync() inside try-catch → SHOULD_NOT_FIRE
 *   - jwtService.verify() without try-catch → SHOULD_FIRE
 *   - await jwtService.signAsync() without try-catch → SHOULD_FIRE (warning)
 */

import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService({ secret: 'test-secret' });

// ─── 1. verifyAsync() — no try-catch ─────────────────────────────────────────

export async function verifyWithoutCatch(token: string) {
  // SHOULD_FIRE: verify-no-try-catch — verifyAsync() without try-catch
  const payload = await jwtService.verifyAsync(token);
  return payload;
}

// ─── 2. verifyAsync() — inside try-catch ─────────────────────────────────────

export async function verifyWithCatch(token: string) {
  try {
    // SHOULD_NOT_FIRE: verifyAsync() inside try-catch — handled
    const payload = await jwtService.verifyAsync(token, { secret: 'test-secret' });
    return payload;
  } catch (error) {
    return null;
  }
}

// ─── 3. verify() sync — no try-catch ─────────────────────────────────────────

export function verifySyncWithoutCatch(token: string) {
  // SHOULD_FIRE: verify-sync-no-try-catch — verify() without try-catch
  return jwtService.verify(token);
}

// ─── 4. verify() sync — inside try-catch ─────────────────────────────────────

export function verifySyncWithCatch(token: string) {
  try {
    // SHOULD_NOT_FIRE: verify() inside try-catch — handled
    return jwtService.verify(token);
  } catch (error) {
    return null;
  }
}
