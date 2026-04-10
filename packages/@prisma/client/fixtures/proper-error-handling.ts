/**
 * Test Fixture: Proper Prisma Error Handling
 * Expected: 0 violations (ERROR severity)
 * This demonstrates correct error handling for Prisma operations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Example 1: Create with P2002 (unique constraint) handling
 */
async function createUserWithUniqueCheck(email: string, name: string) {
  try {
    const user = await prisma.user.create({
      data: { email, name }
    });
    return { success: true, user };
  } catch (error: any) {
    // Check for P2002 unique constraint violation
    if (error.code === 'P2002') {
      console.error('User with this email already exists');
      return { success: false, error: 'DUPLICATE_EMAIL' };
    }
    throw error;
  }
}

/**
 * Example 2: Update with P2025 (not found) handling
 */
async function updateUserWithNotFoundCheck(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data
    });
    return { success: true, user };
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('User not found');
      return { success: false, error: 'NOT_FOUND' };
    }
    throw error;
  }
}

/**
 * Example 3: Delete with P2003 (foreign key) handling
 */
async function deleteUserWithForeignKeyCheck(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
      console.error('Cannot delete: foreign key constraint violation');
      return { success: false, error: 'FOREIGN_KEY_VIOLATION' };
    }
    throw error;
  }
}

/**
 * Example 4: findUnique with connection error handling
 */
async function findUserWithConnectionCheck(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user;
  } catch (error: any) {
    // Check if it's a connection error
    if (error.code === 'P1001' || error.code === 'P1002') {
      console.error('Database connection error');
      throw new Error('DATABASE_UNAVAILABLE');
    }
    throw error;
  }
}

/**
 * Example 5: Transaction with comprehensive error handling
 */
async function transferUserDataWithTransaction(fromId: string, toId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const fromUser = await tx.user.findUnique({ where: { id: fromId } });
      const toUser = await tx.user.findUnique({ where: { id: toId } });

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Transfer logic here
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2034') {
      console.error('Transaction conflict detected (deadlock)');
      return { success: false, error: 'DEADLOCK' };
    }
    if (error.code === 'P2025') {
      console.error('Record not found in transaction');
      return { success: false, error: 'NOT_FOUND' };
    }
    throw error;
  }
}

/**
 * Example 6: findUniqueOrThrow with proper handling
 */
async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email }
    });
    return user;
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('User not found');
      return null;
    }
    throw error;
  }
}

/**
 * Example 7: Connection management with error handling
 */
async function connectWithRetry() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (error: any) {
    if (error.code === 'P1001') {
      console.error('Connection refused - retrying...');
      // Retry logic here
    }
    throw error;
  }
}

/**
 * Example 8: Disconnect with error handling
 */
async function disconnectSafely() {
  try {
    await prisma.$disconnect();
  } catch (error: any) {
    console.error('Error disconnecting from database:', error);
    // Non-critical error, can be logged
  }
}

export {
  createUserWithUniqueCheck,
  updateUserWithNotFoundCheck,
  deleteUserWithForeignKeyCheck,
  findUserWithConnectionCheck,
  transferUserDataWithTransaction,
  getUserByEmail,
  connectWithRetry,
  disconnectSafely,
};
