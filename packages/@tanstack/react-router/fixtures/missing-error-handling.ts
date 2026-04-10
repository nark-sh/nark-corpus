import {
  useNavigate,
  useMatch,
  useLoaderData,
  useParams,
  useSearch,
  useRouteContext,
  createRouter,
  Navigate,
  Link,
  createRoute,
} from '@tanstack/react-router';

/**
 * VIOLATION Example 1: useNavigate - Missing Error Handling
 * Contract: invalid-route-path
 * Expected Violation: No error handling for invalid navigation
 */
function NavigateWithoutErrorHandling() {
  const navigate = useNavigate();

  const handleNavigate = async () => {
    // ❌ NO try-catch - invalid route will crash
    await navigate({ to: '/potentially-invalid-route' });
  };

  return <button onClick={handleNavigate}>Navigate</button>;
}

/**
 * VIOLATION Example 2: useMatch - Missing strict: false
 * Contract: route-mismatch-strict
 * Expected Violation: strict: true on shared component will crash
 */
function SharedComponentWithStrictMatching() {
  // ❌ Using default strict: true in shared component
  const match = useMatch({ from: '/specific-route' });

  return <div>Match ID: {match.id}</div>;
}

/**
 * VIOLATION Example 3: useLoaderData - Missing Error Component
 * Contract: loader-error-unhandled
 * Expected Violation: No error boundary for loader failures
 */
const routeWithoutErrorComponent = createRoute({
  path: '/users/$userId',
  loader: async ({ params }) => {
    // ❌ NO error handling, NO errorComponent on route
    const response = await fetch(`/api/users/${params.userId}`);
    return response.json();
  },
  // ❌ Missing errorComponent
});

function ComponentWithLoaderNoErrorBoundary() {
  // ❌ Using loader data without error boundary
  const data = useLoaderData({ from: '/users/$userId' });
  return <div>{data.name}</div>;
}

/**
 * VIOLATION Example 4: useParams - Missing Param Validation
 * Contract: required-param-missing
 * Expected Violation: Accessing params without validation
 */
function ComponentWithoutParamValidation() {
  const params = useParams({ strict: false });

  // ❌ NO validation that userId exists
  return <div>User ID: {params.userId}</div>;
}

/**
 * VIOLATION Example 5: useSearch - Missing Search Validation
 * Contract: search-schema-validation-error, search-param-parse-error
 * Expected Violation: No validateSearch, accessing unvalidated search params
 */
const routeWithoutSearchValidation = createRoute({
  path: '/search',
  // ❌ NO validateSearch
});

function ComponentWithUnvalidatedSearch() {
  const search = useSearch({ strict: false });

  // ❌ NO validation, directly using search params
  const page = search.page; // Could be string, undefined, etc.
  return <div>Page: {page}</div>;
}

/**
 * VIOLATION Example 6: createRouter - Missing Error Handling
 * Contract: duplicate-route-paths, invalid-route-hierarchy, missing-root-route
 * Expected Violation: No try-catch for router creation errors
 */
function createRouterUnsafely() {
  // ❌ NO try-catch - invalid config will crash at startup
  const router = createRouter({
    routeTree: {} as any,
    // Potentially invalid configuration
  });

  return router;
}

/**
 * VIOLATION Example 7: Navigate Component - Navigation Loop
 * Contract: navigate-infinite-loop
 * Expected Violation: Unconditional Navigate causes infinite loop
 */
function UnconditionalNavigate() {
  // ❌ NO condition - this will cause infinite navigation loop
  return <Navigate to="/dashboard" />;
}

/**
 * VIOLATION Example 8: Link Component - Invalid Route
 * Contract: invalid-route-link
 * Expected Violation: Link to non-existent route without error handling
 */
function UnsafeLink() {
  // ❌ NO error boundary, linking to potentially invalid route
  return <Link to="/this-route-might-not-exist">Go</Link>;
}

/**
 * VIOLATION Example 9: useRouteContext - Missing Context Check
 * Contract: context-not-available
 * Expected Violation: Accessing context without availability check
 */
function ComponentWithoutContextCheck() {
  // ❌ NO try-catch or fallback
  const context = useRouteContext({ from: '/dashboard' });

  // ❌ Directly accessing context that might not exist
  return <div>User: {context.user.name}</div>;
}

/**
 * VIOLATION Example 10: Lazy Route - Missing Error Handling
 * Contract: lazy-route-loading-error
 * Expected Violation: No error handling for lazy load failures
 */
const lazyRouteWithoutErrorHandling = createRoute({
  path: '/lazy',
  // ❌ NO error handling on lazy import
  component: () => import('./LazyComponent'),
  // ❌ NO errorComponent
});

/**
 * VIOLATION Example 11: useLoaderData - Data Not Yet Available
 * Contract: loader-data-unavailable
 * Expected Violation: Accessing loader data before it's loaded (no Suspense)
 */
function ComponentAccessingLoaderDataTooEarly() {
  // ❌ NO Suspense boundary
  const data = useLoaderData({ from: '/data' });

  // ❌ Accessing data.items when data might not be loaded yet
  return <div>{data.items.length}</div>;
}

/**
 * VIOLATION Example 12: createRoute - No Loader Defined
 * Contract: no-loader-defined
 * Expected Violation: Calling useLoaderData on route without loader
 */
const routeWithoutLoader = createRoute({
  path: '/no-loader',
  // ❌ NO loader defined
});

function ComponentCallingLoaderWithoutLoader() {
  // ❌ Calling useLoaderData on route that has no loader
  const data = useLoaderData({ from: '/no-loader' });
  return <div>{data}</div>;
}

/**
 * VIOLATION Example 13: useNavigate - Invalid Params for Target Route
 * Contract: invalid-params
 * Expected Violation: Navigation with wrong param types
 */
function NavigateWithInvalidParams() {
  const navigate = useNavigate();

  const handleClick = () => {
    // ❌ NO try-catch, params might not match target route
    navigate({
      to: '/users/$userId',
      params: { userId: 123 as any }, // Wrong type, should be string
    });
  };

  return <button onClick={handleClick}>Go to User</button>;
}

/**
 * VIOLATION Example 14: Link - Invalid Params
 * Contract: invalid-link-params
 * Expected Violation: Link with params that don't match route types
 */
function LinkWithInvalidParams() {
  // ❌ Params don't match route type expectations
  return (
    <Link
      to="/users/$userId"
      params={{ userId: { invalid: 'object' } as any }}
    >
      User
    </Link>
  );
}

// These examples SHOULD trigger contract violations
export {
  NavigateWithoutErrorHandling,
  SharedComponentWithStrictMatching,
  routeWithoutErrorComponent,
  ComponentWithLoaderNoErrorBoundary,
  ComponentWithoutParamValidation,
  routeWithoutSearchValidation,
  ComponentWithUnvalidatedSearch,
  createRouterUnsafely,
  UnconditionalNavigate,
  UnsafeLink,
  ComponentWithoutContextCheck,
  lazyRouteWithoutErrorHandling,
  ComponentAccessingLoaderDataTooEarly,
  routeWithoutLoader,
  ComponentCallingLoaderWithoutLoader,
  NavigateWithInvalidParams,
  LinkWithInvalidParams,
};
