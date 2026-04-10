/**
 * Instance Usage for jsonwebtoken
 * Tests function call detection
 */

import * as jwt from 'jsonwebtoken';
import { verify, sign, decode } from 'jsonwebtoken';

class TokenManager {
  private secret: string;
  
  constructor(secret: string) {
    this.secret = secret;
  }
  
  // ❌ No try-catch
  verifyToken(token: string) {
    return jwt.verify(token, this.secret); // ❌ No algorithms
  }
  
  // ❌ No try-catch
  createToken(payload: object) {
    return jwt.sign(payload, this.secret);
  }
  
  // Using decode incorrectly
  decodeToken(token: string) {
    return jwt.decode(token); // ❌ No verification
  }
}

class AuthService {
  // ❌ No error handling
  authenticate(token: string, secret: string) {
    const decoded = verify(token, secret); // ❌ No algorithms
    return decoded;
  }
  
  // ❌ No error handling
  issueToken(data: object, secret: string) {
    return sign(data, secret);
  }
}

// ❌ Module-level verification without error handling
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
verify(token, 'secret'); // ❌ No try-catch, no algorithms

export { TokenManager, AuthService };
