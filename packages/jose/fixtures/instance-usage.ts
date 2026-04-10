/**
 * Tests instance-based usage of jose.
 * jwtVerify stored in a helper, called without try-catch.
 */
import { jwtVerify, SignJWT } from 'jose';

class AuthService {
  private key: Uint8Array;

  constructor(secret: string) {
    this.key = new TextEncoder().encode(secret);
  }

  // ❌ jwtVerify on stored instance key — should trigger ERROR violation
  async verifySession(token: string) {
    const { payload } = await jwtVerify(token, this.key, {
      algorithms: ['HS256'],
    });
    return payload;
  }

  // ❌ SignJWT.sign on stored instance key — should trigger WARNING violation
  async createSession(userId: string) {
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(this.key);
    return token;
  }
}
