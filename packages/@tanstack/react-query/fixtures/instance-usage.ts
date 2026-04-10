/**
 * Instance Usage Examples for @tanstack/react-query
 *
 * This file demonstrates real-world usage patterns with QueryClient instances,
 * custom hooks, and composition patterns.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

// ============================================================================
// Custom QueryClient Configuration (Real-world pattern from jake-tennis)
// ============================================================================

/**
 * ✅ Production-grade QueryClient configuration
 * Pattern from jake-tennis-ai-collections/src/main.tsx
 */
const productionQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry in development
        if (failureCount >= 0 && process.env.NODE_ENV === 'development') return false;
        // Max 3 retries in production
        if (failureCount > 3 && process.env.NODE_ENV === 'production') return false;

        // ✅ Don't retry auth errors
        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        );
      },
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: async (error) => {
        // ✅ Global mutation error tracking
        console.error('Mutation error:', error);

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            console.log('Content not modified');
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: async (error) => {
      // ✅ Global query error handling
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          console.log('Session expired');
          // Redirect to login
        }
        if (error.response?.status === 500) {
          console.log('Internal Server Error');
          // Navigate to error page
        }
      }
    },
  }),
});

// ============================================================================
// Custom Hook Pattern with Error Handling
// ============================================================================

/**
 * ✅ Custom hook that wraps useQuery with proper error handling
 */
function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      return response.json();
    },
    onError: (error) => {
      // ✅ Error handled within custom hook
      console.error('useUser error:', error);
    },
  });
}

/**
 * ✅ Component using custom hook - error handling encapsulated
 */
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isError, isLoading } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return <div>{data.name}</div>;
}

// ============================================================================
// QueryClient Instance Methods
// ============================================================================

/**
 * ✅ Using QueryClient instance methods with error handling
 */
function UserManager() {
  const queryClient = useQueryClient();

  const handleInvalidate = async () => {
    try {
      // ✅ Proper error handling for invalidateQueries
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Failed to invalidate queries:', error);
    }
  };

  const handlePrefetch = async (userId: string) => {
    try {
      // ✅ Proper error handling for prefetch
      await queryClient.prefetchQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error('Prefetch failed');
          return response.json();
        },
      });
    } catch (error) {
      // ✅ Error handled - prefetch failure is non-critical
      console.warn('Prefetch failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleInvalidate}>Refresh Users</button>
      <button onClick={() => handlePrefetch('123')}>Prefetch User</button>
    </div>
  );
}

// ============================================================================
// React Query Provider Pattern
// ============================================================================

/**
 * ✅ Proper QueryClientProvider setup
 */
function AppWithQueryClient({ children }: { children: any }) {
  return (
    <QueryClientProvider client={productionQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================================================
// Dependent Queries Pattern
// ============================================================================

/**
 * ✅ Dependent queries with proper error handling
 */
function UserWithPosts({ userId }: { userId: string }) {
  // First query - get user
  const { data: user, error: userError, isError: isUserError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // Second query - get user's posts (depends on first query)
  const { data: posts, error: postsError, isError: isPostsError } = useQuery({
    queryKey: ['posts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!user, // Only run if user exists
  });

  // ✅ Handle errors from both queries
  if (isUserError) return <div>Error loading user: {userError.message}</div>;
  if (!user) return <div>Loading user...</div>;

  if (isPostsError) return <div>Error loading posts: {postsError.message}</div>;
  if (!posts) return <div>Loading posts...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// ❌ VIOLATION: Instance pattern without error handling
// ============================================================================

/**
 * ❌ Custom hook without error handling
 * Should trigger: query-error-unhandled
 */
function useUserNoErrorHandling(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    // ❌ No onError callback
  });
}

/**
 * ❌ Component using hook without checking error state
 */
function UserProfileNoErrorCheck({ userId }: { userId: string }) {
  const { data, isLoading } = useUserNoErrorHandling(userId);

  if (isLoading) return <div>Loading...</div>;
  // ❌ VIOLATION: No error state check
  return <div>{data.name}</div>;
}

// ============================================================================
// ❌ VIOLATION: QueryClient without proper error handlers
// ============================================================================

/**
 * ❌ QueryClient with default configuration
 * Should trigger: missing-global-error-handlers, default-retry-strategy-production
 */
const basicQueryClient = new QueryClient({
  // ❌ VIOLATION: No custom retry logic
  // ❌ VIOLATION: No QueryCache with onError
  // ❌ VIOLATION: No MutationCache with onError
});

// ============================================================================
// ❌ VIOLATION: Prefetch without error handling
// ============================================================================

/**
 * ❌ Prefetching without error handling
 * Should trigger: query-error-unhandled
 */
function UserPrefetchNoErrorHandling() {
  const queryClient = useQueryClient();

  const handlePrefetch = async (userId: string) => {
    // ❌ VIOLATION: No try-catch around prefetch
    await queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: async () => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Prefetch failed');
        return response.json();
      },
      // ❌ No error handling in queryFn or catch
    });
  };

  return <button onClick={() => handlePrefetch('123')}>Prefetch</button>;
}

// ============================================================================
// ❌ VIOLATION: Dependent queries without error handling
// ============================================================================

/**
 * ❌ Dependent queries without checking error states
 * Should trigger: query-error-unhandled
 */
function UserWithPostsNoErrorHandling({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/posts`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    enabled: !!user,
  });

  // ❌ VIOLATION: No error checks for either query
  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>
        {posts?.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// Mock React component type
type ReactNode = any;
function div(props: any): ReactNode {
  return null;
}
