/**
 * PROPER error handling for @nestjs/jwt
 * All JwtService calls handled → ZERO violations expected.
 */

import { JwtService } from '@nestjs/jwt';

// CORRECT: verifyAsync() inside try-catch
export class AuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'my-secret',
      });
      return !!payload;
    } catch (error) {
      // Handles TokenExpiredError, JsonWebTokenError, NotBeforeError
      return false;
    }
  }
}

// CORRECT: verify() inside try-catch (sync)
export class SyncAuthGuard {
  constructor(private jwtService: JwtService) {}

  validateToken(token: string): boolean {
    try {
      const payload = this.jwtService.verify(token, { secret: 'my-secret' });
      return !!payload;
    } catch (error) {
      return false;
    }
  }
}

// CORRECT: signAsync() inside try-catch
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateToken(userId: string): Promise<string> {
    try {
      return await this.jwtService.signAsync({ sub: userId });
    } catch (error) {
      throw new Error('Failed to generate token');
    }
  }
}

// CORRECT: verifyAsync() with .catch()
export class TokenValidator {
  constructor(private jwtService: JwtService) {}

  validateAsync(token: string): Promise<boolean> {
    return this.jwtService
      .verifyAsync(token)
      .then(() => true)
      .catch(() => false);
  }
}
