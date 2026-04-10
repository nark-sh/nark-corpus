/**
 * Test Fixture: PrismaClient Instance Usage Patterns
 * Tests that analyzer correctly identifies Prisma instances
 * Expected: Violations flagged on instance methods, just like direct prisma.* calls
 */

import { PrismaClient } from '@prisma/client';

/**
 * Pattern 1: Variable declaration with new
 */
const client = new PrismaClient();

async function testVariableInstance() {
  // Should be detected as Prisma call - VIOLATION (no error handling)
  const user = await client.user.create({
    data: { email: 'test@example.com', name: 'Test' }
  });
  return user;
}

/**
 * Pattern 2: Class property
 */
class UserService {
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  // Should be detected - VIOLATION (no error handling)
  async createUser(email: string, name: string) {
    const user = await this.db.user.create({
      data: { email, name }
    });
    return user;
  }

  // Should be detected - NO VIOLATION (has error handling)
  async updateUserSafe(id: string, data: any) {
    try {
      const user = await this.db.user.update({
        where: { id },
        data
      });
      return { success: true, user };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return { success: false, error: 'NOT_FOUND' };
      }
      throw error;
    }
  }

  // Should be detected - VIOLATION (no error handling)
  async deleteUser(id: string) {
    await this.db.user.delete({
      where: { id }
    });
  }
}

/**
 * Pattern 3: Renamed import
 */
import { PrismaClient as Database } from '@prisma/client';

const database = new Database();

async function testRenamedImport() {
  // Should be detected - VIOLATION (no error handling)
  const post = await database.post.create({
    data: { title: 'Post', content: 'Content' }
  });
  return post;
}

/**
 * Pattern 4: Function parameter
 */
async function performOperation(prismaClient: PrismaClient, userId: string) {
  // Should be detected - VIOLATION (no error handling)
  const user = await prismaClient.user.findUnique({
    where: { id: userId }
  });
  return user;
}

/**
 * Pattern 5: Returned from function
 */
function getDatabaseClient(): PrismaClient {
  return new PrismaClient();
}

async function testReturnedClient() {
  const db = getDatabaseClient();

  // Should be detected - VIOLATION (no error handling)
  const users = await db.user.findMany();
  return users;
}

/**
 * Pattern 6: Global instance (singleton pattern)
 */
declare global {
  var prisma: PrismaClient | undefined;
}

export const globalPrisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = globalPrisma;
}

async function testGlobalInstance() {
  // Should be detected - VIOLATION (no error handling)
  const user = await globalPrisma.user.create({
    data: { email: 'global@example.com', name: 'Global' }
  });
  return user;
}

/**
 * Pattern 7: Instance with proper error handling (should NOT flag)
 */
const safeClient = new PrismaClient();

async function testInstanceWithErrorHandling() {
  try {
    const user = await safeClient.user.create({
      data: { email: 'safe@example.com', name: 'Safe' }
    });
    return { success: true, user };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'DUPLICATE' };
    }
    throw error;
  }
}

/**
 * Pattern 8: Multiple models on same instance
 */
const multiClient = new PrismaClient();

async function testMultipleModels() {
  // VIOLATION 1 - user.create
  const user = await multiClient.user.create({
    data: { email: 'multi@example.com', name: 'Multi' }
  });

  // VIOLATION 2 - post.create
  const post = await multiClient.post.create({
    data: { title: 'Title', content: 'Content', authorId: user.id }
  });

  // VIOLATION 3 - comment.create
  const comment = await multiClient.comment.create({
    data: { text: 'Comment', postId: post.id, authorId: user.id }
  });

  return { user, post, comment };
}

export {
  testVariableInstance,
  UserService,
  testRenamedImport,
  performOperation,
  testReturnedClient,
  testGlobalInstance,
  testInstanceWithErrorHandling,
  testMultipleModels,
};
