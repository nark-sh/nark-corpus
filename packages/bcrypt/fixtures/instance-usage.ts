/**
 * Instance Usage for bcrypt
 * Tests function call detection
 */

import * as bcrypt from 'bcrypt';
import { hash, compare, genSalt } from 'bcrypt';

class PasswordManager {
  private saltRounds = 10;
  
  // ❌ No try-catch
  async hashPassword(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }
  
  // ❌ No try-catch
  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
  
  // ❌ No try-catch
  async generateSalt() {
    return bcrypt.genSalt(this.saltRounds);
  }
}

class UserService {
  // ❌ No error handling
  async createUser(username: string, password: string) {
    const hashedPassword = await hash(password, 10);
    return { username, password: hashedPassword };
  }
  
  // ❌ No error handling
  async validateCredentials(password: string, storedHash: string) {
    return await compare(password, storedHash);
  }
}

// ❌ Module-level operations without error handling
hash('mypassword', 10);
compare('input', '$2b$10$...');
genSalt(12);

export { PasswordManager, UserService };
