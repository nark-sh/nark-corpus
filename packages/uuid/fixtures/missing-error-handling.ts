/**
 * Missing UUID Validation
 * Should produce WARNING violations
 */

import { v4 as uuidv4 } from 'uuid';

// ⚠️ Using user input without validation
function processUserIdNoValidation(id: string) {
  // ⚠️ No validate() check
  return id;
}

// ⚠️ Using in database query without validation
function getUserById(id: string) {
  // ⚠️ Could be SQL injection vector
  const query = `SELECT * FROM users WHERE id = '${id}'`;
  return query;
}

export { processUserIdNoValidation, getUserById };
