/**
 * MISSING error handling for @nestjs/jwt
 * JwtService calls without error handling → violations expected.
 */

import { JwtService } from '@nestjs/jwt';

// VIOLATION: verifyAsync() without try-catch
export class UnsafeAuthGuard {
  constructor(private jwtService: JwtService) {}

  // No try-catch — TokenExpiredError crashes the request handler
  async canActivate(token: string): Promise<boolean> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: 'my-secret',
    });
    return !!payload;
  }
}

// VIOLATION: verify() without try-catch (synchronous)
export class UnsafeSyncGuard {
  constructor(private jwtService: JwtService) {}

  validateToken(token: string): boolean {
    const payload = this.jwtService.verify(token, { secret: 'my-secret' });
    return !!payload;
  }
}

// VIOLATION: signAsync() without try-catch (lower severity but still flagged)
export class UnsafeTokenService {
  constructor(private jwtService: JwtService) {}

  async generateToken(userId: string): Promise<string> {
    // No try-catch — fails silently if secretOrKeyProvider rejects
    return await this.jwtService.signAsync({ sub: userId });
  }
}
