/**
 * Test Fixture: Missing Prisma Error Handling
 * Expected: Multiple violations (ERROR severity)
 * This demonstrates INCORRECT usage without proper error handling
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * VIOLATION 1: Create without error handling
 * Should flag: P2002 (unique), P2003 (foreign key), connection errors
 */
async function createUserNoErrorHandling(email: string, name: string) {
  const user = await prisma.user.create({
    data: { email, name }
  });
  return user;
}

/**
 * VIOLATION 2: Update without error handling
 * Should flag: P2025 (not found), P2002 (unique), connection errors
 */
async function updateUserNoErrorHandling(id: string, email: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { email }
  });
  return user;
}

/**
 * VIOLATION 3: Delete without error handling
 * Should flag: P2003 (foreign key), P2025 (not found), connection errors
 */
async function deleteUserNoErrorHandling(id: string) {
  await prisma.user.delete({
    where: { id }
  });
}

/**
 * VIOLATION 4: findUnique without error handling
 * Should flag: Connection errors
 */
async function findUserNoErrorHandling(id: string) {
  const user = await prisma.user.findUnique({
    where: { id }
  });
  return user;
}

/**
 * VIOLATION 5: findUniqueOrThrow without error handling
 * Should flag: P2025 (not found), connection errors
 */
async function getUserOrThrowNoErrorHandling(email: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email }
  });
  return user;
}

/**
 * VIOLATION 6: Transaction without error handling
 * Should flag: P2034 (deadlock), connection errors
 */
async function transactionNoErrorHandling() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany();
    await tx.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    });
    return users;
  });
}

/**
 * VIOLATION 7: $connect without error handling
 * Should flag: Connection errors (P1001, P1002)
 */
async function connectNoErrorHandling() {
  await prisma.$connect();
}

/**
 * VIOLATION 8: $disconnect without error handling
 * Should flag: Connection errors
 */
async function disconnectNoErrorHandling() {
  await prisma.$disconnect();
}

/**
 * VIOLATION 9: Multiple chained operations without error handling
 */
async function multipleOperationsNoErrorHandling() {
  const user = await prisma.user.create({
    data: { email: 'user@example.com', name: 'User' }
  });

  const post = await prisma.post.create({
    data: {
      title: 'Post',
      content: 'Content',
      authorId: user.id
    }
  });

  await prisma.comment.create({
    data: {
      text: 'Comment',
      postId: post.id,
      authorId: user.id
    }
  });
}

export {
  createUserNoErrorHandling,
  updateUserNoErrorHandling,
  deleteUserNoErrorHandling,
  findUserNoErrorHandling,
  getUserOrThrowNoErrorHandling,
  transactionNoErrorHandling,
  connectNoErrorHandling,
  disconnectNoErrorHandling,
  multipleOperationsNoErrorHandling,
};
