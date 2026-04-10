/**
 * Missing error handling for @trpc/client vanilla client.
 * .query() and .mutate() calls are NOT wrapped in try-catch.
 * Should produce ERROR violations.
 */

import { createTRPCClient, httpLink } from '@trpc/client';

type AppRouter = any;

const trpc = createTRPCClient<AppRouter>({
  links: [httpLink({ url: 'http://localhost:3000/api/trpc' })],
});

/**
 * ❌ Missing try-catch around .query() — TRPCClientError unhandled
 */
async function fetchPostWithoutErrorHandling(id: string) {
  const post = await trpc.post.byId.query(id);
  return post;
}

/**
 * ❌ Missing try-catch around .mutate() — TRPCClientError unhandled
 */
async function createPostWithoutErrorHandling(title: string, content: string) {
  const post = await trpc.post.create.mutate({ title, content });
  return post;
}

/**
 * ❌ Missing error handling in a utility function
 */
async function updateUserProfile(userId: string, data: { name: string; email: string }) {
  const result = await trpc.user.update.mutate({ userId, ...data });
  return result;
}

/**
 * ❌ No error handling on a query used to load initial data
 */
async function loadDashboardData(orgId: string) {
  const stats = await trpc.dashboard.getStats.query({ orgId });
  const users = await trpc.org.listMembers.query({ orgId });
  return { stats, users };
}

export {
  fetchPostWithoutErrorHandling,
  createPostWithoutErrorHandling,
  updateUserProfile,
  loadDashboardData,
};
