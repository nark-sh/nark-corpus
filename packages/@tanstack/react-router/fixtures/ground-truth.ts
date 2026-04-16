/**
 * @tanstack/react-router Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the @tanstack/react-router contract spec.
 *
 * New postconditions added in depth pass (2026-04-13):
 *   - useBlocker()        blocker-shouldblock-fn-uncaught-rejection
 *   - useBlocker()        blocker-external-navigation-bypass
 *   - useAwaited()        awaited-deferred-rejection-no-error-boundary
 *   - useAwaited()        awaited-missing-suspense-boundary
 *   - lazyRouteComponent() lazy-route-component-import-failure
 *   - lazyRouteComponent() lazy-route-component-chunk-hash-mismatch-loop
 *   - useLoaderDeps()     loader-deps-route-mismatch-strict
 *   - RouterProvider      router-provider-loader-initialization-error
 *   - RouterProvider      router-provider-missing-context
 */

import {
  useBlocker,
  useAwaited,
  useLoaderDeps,
  lazyRouteComponent,
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  Await,
} from '@tanstack/react-router';
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. useBlocker — shouldBlockFn that can reject (async function without try-catch)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: blocker-shouldblock-fn-uncaught-rejection
function NavigationBlockerWithRejectingFn() {
  // NOTE(scanner-gap): no detector yet for async shouldBlockFn rejection — tracked concern-20260413-tanstack-react-router-deepen-1
  useBlocker({
    shouldBlockFn: async ({ current, next }) => {
      const result = await fetch(`/api/check-unsaved-changes?from=${current.pathname}&to=${next.pathname}`);
      const data = await result.json(); // can throw on network error — no catch
      return data.hasUnsavedChanges;
    },
  });
  return React.createElement('div', null, 'Page with blocker');
}

// @expect-clean
function NavigationBlockerWithSafeFn() {
  // SHOULD_NOT_FIRE: shouldBlockFn wraps async logic in try-catch
  useBlocker({
    shouldBlockFn: async ({ current, next }) => {
      try {
        const result = await fetch(`/api/check-unsaved-changes?from=${current.pathname}&to=${next.pathname}`);
        const data = await result.json();
        return data.hasUnsavedChanges;
      } catch {
        // On error, default to not blocking navigation
        return false;
      }
    },
  });
  return React.createElement('div', null, 'Page with safe blocker');
}

// @expect-clean
function NavigationBlockerSynchronous() {
  // SHOULD_NOT_FIRE: synchronous shouldBlockFn cannot reject
  const [isDirty, setIsDirty] = React.useState(false);
  useBlocker({
    shouldBlockFn: () => isDirty,
  });
  return React.createElement('button', { onClick: () => setIsDirty(true) }, 'Edit');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useAwaited — deferred promise used without error boundary
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: awaited-deferred-rejection-no-error-boundary
// @expect-violation: awaited-missing-suspense-boundary
function ComponentUsingAwaitedNoBoundary({ dataPromise }: { dataPromise: Promise<string> }) {
  // SHOULD_FIRE: useAwaited throws on promise rejection with no error boundary
  // SHOULD_FIRE: useAwaited throws pending promise with no Suspense boundary
  const data = useAwaited({ promise: dataPromise });
  return React.createElement('div', null, data);
}

// @expect-clean
function ComponentUsingAwaitWithBoundary({ dataPromise }: { dataPromise: Promise<string> }) {
  // SHOULD_NOT_FIRE: Await component with fallback wraps in Suspense automatically
  // The route's errorComponent handles rejection errors
  return React.createElement(Await, {
    promise: dataPromise,
    fallback: React.createElement('div', null, 'Loading...'),
    children: (data: string) => React.createElement('div', null, data),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. lazyRouteComponent — dynamic import without error boundary on route
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: lazy-route-component-import-failure
const LazyDashboardNoErrorBoundary = lazyRouteComponent(
  // SHOULD_FIRE: dynamic import can fail (network error, hash mismatch after deploy)
  // No errorComponent defined on the route that uses this component
  () => import('./DashboardPage' as any),
);

// @expect-clean
// The fix is at the route definition level (not detectable here from the component alone),
// but a route using lazyRouteComponent with errorComponent defined satisfies the contract.
const LazyDashboardWithErrorBoundary = lazyRouteComponent(
  () => import('./DashboardPage' as any),
);
// Route definition that uses it should have: errorComponent: ({ error }) => <ErrorPage error={error} />

// ─────────────────────────────────────────────────────────────────────────────
// 4. useLoaderDeps — strict mode with wrong 'from' parameter
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: loader-deps-route-mismatch-strict
function SharedComponentUsingLoaderDeps() {
  // SHOULD_FIRE: Using strict: true (default) in a shared component rendered across routes
  // If current route doesn't match 'from', throws at runtime
  const deps = useLoaderDeps({ from: '/dashboard/users' });
  return React.createElement('div', null, JSON.stringify(deps));
}

// @expect-clean
function SharedComponentUsingLoaderDepsSafe() {
  // SHOULD_NOT_FIRE: strict: false allows use in shared/cross-route components
  const deps = useLoaderDeps({ from: '/dashboard/users', strict: false });
  return React.createElement('div', null, JSON.stringify(deps));
}

// @expect-clean
function DashboardUsersLoaderDeps() {
  // SHOULD_NOT_FIRE: Used within the exact route it's 'from', strict: true is safe
  const deps = useLoaderDeps({ from: '/dashboard/users' });
  return React.createElement('div', null, JSON.stringify(deps));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RouterProvider — missing root-level error boundary
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: router-provider-loader-initialization-error
function AppWithNoErrorBoundary() {
  const rootRoute = createRootRoute({
    // SHOULD_FIRE: loader that can throw, no errorComponent on root route
    loader: async () => {
      const res = await fetch('/api/init');
      if (!res.ok) throw new Error('Init failed');
      return res.json();
    },
  });
  const router = createRouter({ routeTree: rootRoute });
  // No top-level React ErrorBoundary wrapping RouterProvider
  return React.createElement(RouterProvider, { router });
}

// @expect-clean
function AppWithErrorBoundary() {
  const rootRoute = createRootRoute({
    loader: async () => {
      const res = await fetch('/api/init');
      if (!res.ok) throw new Error('Init failed');
      return res.json();
    },
    // errorComponent defined on root route catches loader errors
    errorComponent: ({ error }: { error: Error }) =>
      React.createElement('div', null, `Error: ${error.message}`),
  });
  const router = createRouter({ routeTree: rootRoute });
  return React.createElement(RouterProvider, { router });
}
