import bcrypt from 'bcryptjs';

/**
 * Proper error handling for bcryptjs.hash()
 * Should NOT trigger violations.
 */
async function hashPasswordWithErrorHandling(password: string) {
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    console.error('Hash failed:', error);
    throw error;
  }
}

/**
 * Proper error handling for bcryptjs.compare()
 * Should NOT trigger violations.
 */
async function comparePasswordWithErrorHandling(password: string, hash: string) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Compare failed:', error);
    throw error;
  }
}
