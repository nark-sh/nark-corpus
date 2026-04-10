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
  ErrorComponent,
} from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * Example 1: useNavigate - Proper Error Handling for Invalid Routes
 * Contract: invalid-route-path
 * Handles: Navigation errors with error boundary
 */
function NavigateWithErrorBoundary() {
  const navigate = useNavigate();

  const handleNavigate = async () => {
    try {
      await navigate({ to: '/valid-route' });
    } catch (error) {
      console.error('Navigation failed:', error);
      // Handle navigation error
    }
  };

  return <button onClick={handleNavigate}>Navigate Safely</button>;
}

/**
 * Example 2: useMatch - Proper Error Handling with strict: false
 * Contract: route-mismatch-strict
 * Handles: Route mismatch by using strict: false for shared components
 */
function SharedComponentWithLooseMatching() {
  // ✅ Using strict: false for components shared across routes
  const match = useMatch({ strict: false });

  return <div>Match ID: {match.id}</div>;
}

/**
 * Example 3: useLoaderData - Proper Error Handling with ErrorComponent
 * Contract: loader-error-unhandled
 * Handles: Loader errors with route error component
 */
function RouteWithErrorBoundary() {
  // This component is wrapped in route with errorComponent
  const data = useLoaderData({ from: '/users/$userId' });

  return <div>{data.name}</div>;
}

// Route definition with error component
const userRoute = createRoute({
  path: '/users/$userId',
  loader: async ({ params }) => {
    try {
      const response = await fetch(`/api/users/${params.userId}`);
      if (!response.ok) throw new Error('User not found');
      return response.json();
    } catch (error) {
      throw error; // Will be caught by errorComponent
    }
  },
  errorComponent: ({ error }) => (
    <div>
      <h1>Error Loading User</h1>
      <p>{error.message}</p>
    </div>
  ),
});

/**
 * Example 4: useParams - Proper Validation of Required Params
 * Contract: required-param-missing
 * Handles: Missing params by validating route match
 */
function ComponentWithParamValidation() {
  const params = useParams({ strict: false });

  if (!params.userId) {
    return <div>Error: User ID required</div>;
  }

  return <div>User ID: {params.userId}</div>;
}

/**
 * Example 5: useSearch - Proper Search Param Validation
 * Contract: search-schema-validation-error
 * Handles: Search validation with validateSearch option
 */
const routeWithSearchValidation = createRoute({
  path: '/search',
  validateSearch: (search: Record<string, unknown>) => {
    // Validate and transform search params
    return {
      query: String(search.query || ''),
      page: Number(search.page) || 1,
    };
  },
  errorComponent: ({ error }) => <div>Invalid search params: {error.message}</div>,
});

/**
 * Example 6: createRouter - Proper Error Handling for Invalid Config
 * Contract: duplicate-route-paths, invalid-route-hierarchy
 * Handles: Router creation errors with try-catch
 */
function createRouterSafely() {
  try {
    const router = createRouter({
      routeTree: {} as any,
      // ... router config
    });
    return router;
  } catch (error) {
    console.error('Router creation failed:', error);
    throw new Error('Failed to initialize router');
  }
}

/**
 * Example 7: Navigate Component - Proper Conditional Navigation
 * Contract: navigate-infinite-loop
 * Handles: Prevents navigation loops with conditions
 */
function ConditionalNavigate({ shouldNavigate }: { shouldNavigate: boolean }) {
  // ✅ Only navigate when condition is met
  if (!shouldNavigate) {
    return <div>Loading...</div>;
  }

  return <Navigate to="/dashboard" replace />;
}

/**
 * Example 8: Link Component - Proper Error Handling for Invalid Routes
 * Contract: invalid-route-link
 * Handles: Link errors wrapped in error boundary
 */
function SafeLink() {
  return (
    <ErrorBoundary
      fallback={<span>Invalid link</span>}
      onError={(error) => console.error('Link error:', error)}
    >
      <Link to="/valid-route">Go to Valid Route</Link>
    </ErrorBoundary>
  );
}

/**
 * Example 9: useRouteContext - Proper Context Availability Check
 * Contract: context-not-available
 * Handles: Missing context with fallback
 */
function ComponentWithContextFallback() {
  try {
    const context = useRouteContext({ from: '/dashboard', strict: false });
    return <div>Context: {JSON.stringify(context)}</div>;
  } catch (error) {
    console.error('Context not available:', error);
    return <div>No context available</div>;
  }
}

/**
 * Example 10: Lazy Route Loading - Proper Error Handling
 * Contract: lazy-route-loading-error
 * Handles: Lazy load failures with error component
 */
const lazyRoute = createRoute({
  path: '/lazy',
  component: () => import('./LazyComponent').catch((error) => {
    console.error('Lazy load failed:', error);
    return { default: () => <div>Failed to load component</div> };
  }),
  errorComponent: () => <div>Route loading failed</div>,
});

export {
  NavigateWithErrorBoundary,
  SharedComponentWithLooseMatching,
  RouteWithErrorBoundary,
  ComponentWithParamValidation,
  routeWithSearchValidation,
  createRouterSafely,
  ConditionalNavigate,
  SafeLink,
  ComponentWithContextFallback,
  lazyRoute,
};
