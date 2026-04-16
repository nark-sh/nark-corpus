/**
 * @trpc/client Ground-Truth Fixture
 *
 * Each call site is annotated with SHOULD_FIRE or SHOULD_NOT_FIRE
 * immediately before the relevant call (not before the function).
 *
 * Contracted functions (3 total):
 *   - query     — postcondition: trpc-query-missing-try-catch (severity: error)
 *   - mutate    — postcondition: trpc-mutate-missing-try-catch (severity: error)
 *   - subscribe — postconditions: trpc-subscribe-missing-on-error,
 *                                 trpc-subscribe-auth-error-silent (severity: error)
 *
 * Key contract rules:
 *   - .query() and .mutate() on tRPC vanilla client throw TRPCClientError
 *   - Without try-catch, errors propagate unhandled
 *   - A surrounding try-catch SATISFIES the requirement for query/mutate
 *   - .catch() handler also satisfies the requirement for query/mutate
 *   - .subscribe() errors are NOT thrown — dispatched via optional onError callback
 *   - Missing onError in subscribe() = silent error drop (opts.onError?.(err))
 *
 * Detection strategy: createTRPCClient / createTRPCProxyClient tracked as factory
 * methods by InstanceTracker, then .query()/.mutate()/.subscribe() detected by
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

// ─────────────────────────────────────────────────────────────────────────────
// .subscribe() — missing onError callback (violations)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: trpc-subscribe-missing-on-error
// @expect-violation: trpc-subscribe-auth-error-silent
export function subscribeNoOnError(userId: string) {
  // SHOULD_FIRE: trpc-subscribe-missing-on-error — no onError provided, all errors silently dropped
  // SHOULD_FIRE: trpc-subscribe-auth-error-silent — UNAUTHORIZED errors silently dropped
  const sub = trpc.notifications.subscribe({ userId }, {
    onData(data) {
      console.log('notification:', data);
    },
    onComplete() {
      console.log('subscription ended');
    },
    // Missing: onError — errors from server (UNAUTHORIZED, INTERNAL_SERVER_ERROR,
    // WebSocket close) will be silently dropped via opts.onError?.(err)
  });
  return sub;
}

// @expect-violation: trpc-subscribe-missing-on-error
export function subscribeDataOnly(roomId: string) {
  // SHOULD_FIRE: only onData provided, no onError, errors silently swallowed
  return trpc.chat.messages.subscribe({ roomId }, {
    onData(msg) {
      console.log('message:', msg);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// .subscribe() — with proper onError handling (clean)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-clean
export function subscribeWithOnError(userId: string) {
  // SHOULD_NOT_FIRE: onError provided, TRPCClientError will be handled
  const sub = trpc.notifications.subscribe({ userId }, {
    onData(data) {
      console.log('notification:', data);
    },
    onError(cause) {
      if (isTRPCClientError(cause)) {
        if (cause.data?.code === 'UNAUTHORIZED') {
          console.error('Auth expired, redirecting to login');
        } else {
          console.error('Subscription error:', cause.message);
        }
      }
    },
    onComplete() {
      console.log('subscription ended');
    },
  });
  return sub;
}

// @expect-clean
export function subscribeWithMinimalOnError(roomId: string) {
  // SHOULD_NOT_FIRE: onError provided even if minimal
  return trpc.chat.messages.subscribe({ roomId }, {
    onData(msg) {
      console.log('message:', msg);
    },
    onError(err) {
      console.error('chat subscription error:', err.message);
    },
  });
}
