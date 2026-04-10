/**
 * Tests detection of jwt-decode usage via class instances and helpers.
 * Should trigger violations where try-catch is missing.
 */
import { jwtDecode } from 'jwt-decode';

class AuthService {
  /**
   * ❌ Missing try-catch — crashes on malformed token.
   */
  getCurrentUser(token: string): { sub: string; email: string } {
    const payload = jwtDecode(token) as { sub: string; email: string };
    return payload;
  }

  /**
   * ✅ Correct — wraps in try-catch.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode(token);
      if (!payload.exp) return true;
      return Date.now() / 1000 >= payload.exp;
    } catch {
      return true;
    }
  }

  /**
   * ❌ Missing try-catch — decodes token to check a custom claim.
   */
  hasPermission(token: string, permission: string): boolean {
    const payload = jwtDecode(token) as { permissions?: string[] };
    return payload.permissions?.includes(permission) ?? false;
  }
}

export { AuthService };
