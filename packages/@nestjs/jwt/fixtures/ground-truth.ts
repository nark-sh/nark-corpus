/**
 * @nestjs/jwt Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: verify-no-try-catch, verify-sync-no-try-catch, sign-async-no-try-catch,
 *   sign-sync-wrong-secret-provider, sign-sync-string-payload-with-options
 *
 * Key rules:
 *   - await jwtService.verifyAsync() without try-catch → SHOULD_FIRE
 *   - await jwtService.verifyAsync() inside try-catch → SHOULD_NOT_FIRE
 *   - jwtService.verify() without try-catch → SHOULD_FIRE
 *   - await jwtService.signAsync() without try-catch → SHOULD_FIRE (warning)
 *   - jwtService.sign() without try-catch → SHOULD_FIRE (sign-sync-wrong-secret-provider)
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

// ─── 5. sign() sync — no try-catch ───────────────────────────────────────────

export function signWithoutCatch(payload: object) {
  // SHOULD_FIRE: sign-sync-wrong-secret-provider — sign() throws WrongSecretProviderError when configured with async secretOrKeyProvider
  return jwtService.sign(payload);
}

// ─── 6. sign() sync — inside try-catch ───────────────────────────────────────

export function signWithCatch(payload: object) {
  try {
    // SHOULD_NOT_FIRE: sign() inside try-catch — handled
    return jwtService.sign(payload);
  } catch (error) {
    return null;
  }
}

// ─── 7. sign() with string payload and options — no try-catch ────────────────

export function signStringPayloadWithOptions() {
  // @expect-violation: sign-sync-string-payload-with-options
  // SHOULD_FIRE: sign() with string payload + options throws synchronously
  return jwtService.sign('user-id-string', { expiresIn: '1h' } as any);
}
