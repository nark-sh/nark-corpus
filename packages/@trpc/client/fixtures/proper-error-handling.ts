/**
 * Proper error handling for @trpc/client vanilla client.
 * All .query() and .mutate() calls are wrapped in try-catch.
 * Should produce 0 violations.
 */

import { TRPCClientError, createTRPCClient, httpLink, isTRPCClientError } from '@trpc/client';

// Simulated router types (in real usage these come from server)
type AppRouter = any;

const trpc = createTRPCClient<AppRouter>({
  links: [httpLink({ url: 'http://localhost:3000/api/trpc' })],
});

/**
 * Proper error handling: try-catch wrapping a .query() call
 */
async function fetchPostWithErrorHandling(id: string) {
  try {
    const post = await trpc.post.byId.query(id);
    return post;
  } catch (cause) {
    if (isTRPCClientError(cause)) {
      console.error('tRPC error:', cause.data?.code, cause.message);
    }
    throw cause;
  }
}

/**
 * Proper error handling for mutation
 */
async function createPostWithErrorHandling(title: string, content: string) {
  try {
    const post = await trpc.post.create.mutate({ title, content });
    return post;
  } catch (cause) {
    if (cause instanceof TRPCClientError) {
      if (cause.data?.code === 'UNAUTHORIZED') {
        throw new Error('Not authenticated');
      }
      console.error('Failed to create post:', cause.message);
    }
    throw cause;
  }
}

/**
 * Proper error handling using .catch() on promise chain
 */
async function fetchUserData(userId: string) {
  const userData = await trpc.user.getById.query(userId).catch((cause: unknown) => {
    if (isTRPCClientError(cause)) {
      if (cause.data?.code === 'NOT_FOUND') {
        return null;
      }
    }
    throw cause;
  });
  return userData;
}

export { fetchPostWithErrorHandling, createPostWithErrorHandling, fetchUserData };
