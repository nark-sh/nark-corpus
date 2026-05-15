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
import { PromiseCall, PromiseState, safeAsync } from './wrapper-stubs';

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
  // SHOULD_FIRE: trpc-subscribe-missing-on-error — no onError provided, all errors silently dropped; SHOULD_FIRE: trpc-subscribe-auth-error-silent — UNAUTHORIZED errors silently dropped
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

// ─────────────────────────────────────────────────────────────────────────────
// §8 callback-wrapper shells — wrapper class/function catches errors one frame up.
// Concern: concern-20260515-section8-promisecall-promisestate-wrapper-shells
// Concern: concern-20260515-section8-trpc-query-wrapper-shells
// Wrapper helpers (PromiseCall, PromiseState, safeAsync) are imported at file
// level above. The suppression heuristic walks the import declarations — not
// the bodies — to confirm the wrapper names are imported, not locally shadowed.
// ─────────────────────────────────────────────────────────────────────────────

// @expect-clean
export function blinkoPromiseCallWrap(noteId: string) {
  // SHOULD_NOT_FIRE: PromiseCall wraps the promise — PromiseCall's body holds the try-catch.
  return PromiseCall(trpc.note.detail.query({ id: noteId }));
}

// @expect-clean
export function blinkoPromiseStateWrap() {
  // Wrapper-class shape: callback is the `function:` property of an object literal
  // that is a `new PromiseState({...})` argument. The class's .call() method holds
  // the try-catch; flagging the inner await would FP.
  return new PromiseState({
    // SHOULD_NOT_FIRE: function: property of new PromiseState({...}) — wrapper.call() holds try-catch.
    function: async (params: { id: string }) => trpc.note.detail.query(params),
  });
}

// @expect-clean
export function safeAsyncWrap(title: string) {
  // SHOULD_NOT_FIRE: safeAsync wraps the lambda — safeAsync body holds the try-catch.
  return safeAsync(async () => trpc.post.create.mutate({ title }));
}

// Name-collision defense: a LOCALLY-declared function named `PromiseCall` that
// is NOT imported at file level must NOT trigger suppression. This guards
// against over-suppression when a project happens to define an identifier that
// collides with a built-in wrapper name but does not actually wrap try-catch.
function PromiseCall_localShadow<T>(p: T): T {
  // Note: NO try-catch here — local shadow does not actually handle errors.
  return p;
}

// @expect-violation: trpc-mutate-missing-try-catch
export async function nameCollisionLocalShadow(title: string) {
  // The await is the bare TRPC call — the surrounding helper does not catch.
  // Even though the outer identifier name matches `PromiseCall`, it is NOT in
  // the file's imported-identifier set, so the heuristic must NOT suppress.
  // SHOULD_FIRE: trpc-mutate-missing-try-catch — local shadow does not provide try-catch, wrapper-shell heuristic must not over-suppress
  const result = await PromiseCall_localShadow(trpc.post.create.mutate({ title }));
  return result;
}
