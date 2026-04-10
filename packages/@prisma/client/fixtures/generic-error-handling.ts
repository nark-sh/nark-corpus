/**
 * Test Fixture: Generic Prisma Error Handling
 * Expected: Warnings (not errors) - has try-catch but doesn't check P-codes
 * This demonstrates error handling that catches errors but doesn't distinguish types
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * WARNING 1: Generic catch without P-code checking
 * Has error handling but doesn't check error.code
 */
async function createUserGenericCatch(email: string, name: string) {
  try {
    const user = await prisma.user.create({
      data: { email, name }
    });
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
}

/**
 * WARNING 2: Catch-all error handler
 */
async function updateUserCatchAll(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data
    });
    return user;
  } catch (error) {
    // Generic error logging without specific handling
    console.error('Update failed:', error);
    throw new Error('UPDATE_FAILED');
  }
}

/**
 * WARNING 3: Promise catch without specificity
 */
async function deleteUserPromiseCatch(id: string) {
  return prisma.user.delete({
    where: { id }
  }).catch((error) => {
    console.error('Delete failed:', error);
    return null;
  });
}

/**
 * WARNING 4: Transaction with generic error handling
 */
async function transactionGenericHandler() {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { email: 'test@example.com', name: 'Test' }
      });
    });
  } catch (error) {
    // Doesn't check for P2034 (deadlock) or other specific codes
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * WARNING 5: Error logged but not properly handled
 */
async function findUserLogOnly(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user;
  } catch (error) {
    // Just logs, doesn't check what type of error
    console.log('Error occurred:', error);
    return null;
  }
}

/**
 * WARNING 6: Rethrow without inspection
 */
async function createUserRethrow(email: string) {
  try {
    return await prisma.user.create({
      data: { email, name: 'User' }
    });
  } catch (error) {
    // Logs but doesn't inspect error type before rethrowing
    console.error('Create failed');
    throw error;
  }
}

/**
 * GOOD: Partial P-code checking (should not warn)
 * Checks P2002 but could check more
 */
async function createUserPartialCheck(email: string) {
  try {
    return await prisma.user.create({
      data: { email, name: 'User' }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Duplicate email');
      return null;
    }
    throw error;
  }
}

/**
 * WARNING 7: Async/await without try-catch
 * Relies on caller to handle errors
 */
async function getUserNoLocalHandling(id: string) {
  // No try-catch - error propagates to caller
  // This is a design choice but may indicate missing handling
  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  });
  return user;
}

export {
  createUserGenericCatch,
  updateUserCatchAll,
  deleteUserPromiseCatch,
  transactionGenericHandler,
  findUserLogOnly,
  createUserRethrow,
  createUserPartialCheck,
  getUserNoLocalHandling,
};
