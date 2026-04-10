/**
 * Proper UUID Validation
 * Should produce 0 violations
 */

import { v4 as uuidv4, validate } from 'uuid';

// ✅ Generate UUID
function generateId(): string {
  return uuidv4();
}

// ✅ Validate before using
function validateUserId(id: string): boolean {
  if (\!validate(id)) {
    throw new Error('Invalid UUID format');
  }
  return true;
}

// ✅ Validate user input
function processUserId(id: string) {
  if (\!validate(id)) {
    console.error('Invalid UUID:', id);
    return null;
  }
  return id;
}

export { generateId, validateUserId, processUserId };
