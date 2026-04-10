/**
 * Instance Usage for UUID
 */

import { v4, validate } from 'uuid';

class IdService {
  generate(): string {
    return v4();
  }
  
  // ⚠️ No validation
  process(id: string) {
    return id;
  }
}

// ⚠️ Using without validation
const userId = 'user-provided-id';
// validate(userId); // Should validate

export { IdService };
