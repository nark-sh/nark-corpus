/**
 * @trpc/client Ground-Truth Fixture
 *
 * Each call site is annotated with SHOULD_FIRE or SHOULD_NOT_FIRE
 * immediately before the await call (not before the function).
 *
 * Contracted functions (2 total):
 *   - query  — postcondition: trpc-query-missing-try-catch (severity: error)
 *   - mutate — postcondition: trpc-mutate-missing-try-catch (severity: error)
 *
 * Key contract rules:
 *   - .query() and .mutate() on tRPC vanilla client throw TRPCClientError
 *   - Without try-catch, errors propagate unhandled
 *   - A surrounding try-catch SATISFIES the requirement
 *   - .catch() handler also satisfies the requirement
 *
 * Detection strategy: createTRPCClient / createTRPCProxyClient tracked as factory
 * methods by InstanceTracker, then .query()/.mutate() detected by
 * PropertyChainDetector.
 */

import { TRPCClientError, createTRPCClient, createTRPCProxyClient, httpLink, isTRPCClientError } from '@trpc/client';

type AppRouter = any;

const trpc = createTRPCClient<AppRouter>({
  links: [httpLink({ url: 'http://localhost:3000/api/trpc' })],
});

const trpcProxy = createTRPCProxyClient<AppRouter>({
  links: [httpLink({ url: 'http://localhost:3000/api/trpc' })],
});

// ─────────────────────────────────────────────────────────────────────────────
// .query() — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function queryNoTryCatch(id: string) {
  // SHOULD_FIRE: trpc-query-missing-try-catch — query() throws TRPCClientError, no try-catch
  const result = await trpc.post.byId.query(id);
  return result;
}

export async function proxyQueryNoTryCatch(workflowId: string) {
  // SHOULD_FIRE: trpc-query-missing-try-catch — proxy query() throws TRPCClientError, no try-catch
  return await trpcProxy.orchestrator.statusUpdate.query({ workflowId });
}

// ─────────────────────────────────────────────────────────────────────────────
// .mutate() — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mutateNoTryCatch(title: string) {
  // SHOULD_FIRE: trpc-mutate-missing-try-catch — mutate() throws TRPCClientError, no try-catch
  const result = await trpc.post.create.mutate({ title });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// .query() — with proper try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function queryWithTryCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, TRPCClientError will be caught
    const result = await trpc.post.byId.query(id);
    return result;
  } catch (cause) {
    if (isTRPCClientError(cause)) {
      console.error('Error:', cause.message);
    }
    throw cause;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// .mutate() — with proper try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mutateWithTryCatch(title: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, TRPCClientError will be caught
    const result = await trpc.post.create.mutate({ title });
    return result;
  } catch (cause) {
    if (cause instanceof TRPCClientError) {
      console.error('Mutation failed:', cause.data?.code);
    }
    throw cause;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// .query() — with .catch() handler
// ─────────────────────────────────────────────────────────────────────────────

export async function queryWithCatchHandler(id: string) {
  // SHOULD_NOT_FIRE: .catch() with error handling satisfies the contract
  return trpc.post.byId.query(id).catch((cause: unknown) => {
    if (isTRPCClientError(cause) && cause.data?.code === 'NOT_FOUND') {
      return null;
    }
    throw cause;
  });
}
