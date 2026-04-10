import bcrypt from 'bcryptjs';

/**
 * Missing error handling for bcryptjs.hash()
 * Should trigger ERROR violation.
 */
async function hashPasswordWithoutErrorHandling(password: string) {
  // ❌ No try-catch
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

/**
 * Missing error handling for bcryptjs.compare()
 * Should trigger ERROR violation.
 */
async function comparePasswordWithoutErrorHandling(password: string, hash: string) {
  // ❌ No try-catch
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}
