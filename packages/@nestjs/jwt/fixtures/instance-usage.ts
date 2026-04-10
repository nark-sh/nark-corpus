/**
 * Instance usage for @nestjs/jwt — tests class-level detection.
 * JwtService is injected via NestJS DI, used as class property.
 */

import { JwtService } from '@nestjs/jwt';

// Class using JwtService via constructor injection
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  // VIOLATION: verifyAsync without try-catch
  async verifyToken(token: string): Promise<Record<string, unknown>> {
    const payload = await this.jwtService.verifyAsync(token);
    return payload as Record<string, unknown>;
  }

  // CORRECT: verifyAsync with try-catch
  async verifyTokenSafe(token: string): Promise<Record<string, unknown> | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload as Record<string, unknown>;
    } catch (error) {
      return null;
    }
  }

  // VIOLATION: verify (sync) without try-catch
  decodeToken(token: string): Record<string, unknown> {
    return this.jwtService.verify(token) as Record<string, unknown>;
  }
}
