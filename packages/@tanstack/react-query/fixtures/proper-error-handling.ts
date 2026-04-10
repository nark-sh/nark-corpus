/**
 * Proper Error Handling Examples for @tanstack/react-query
 *
 * This file demonstrates CORRECT error handling patterns.
 * Should produce 0 violations when analyzed.
 */

import { useQuery, useMutation, useInfiniteQuery, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// ============================================================================
// PROPER: useQuery with error state handling
// ============================================================================

/**
 * ✅ Correctly handles query errors by checking isError state
 */
function UserProfileWithErrorHandling({ userId }: { userId: string }) {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  // ✅ CORRECT: Checking error state before rendering data
  if (isError) {
    return <div>Error loading user: {error.message}</div>;
  }

  return <div>{data.name}</div>;
}

// ============================================================================
// PROPER: useQuery with onError callback
// ============================================================================

/**
 * ✅ Correctly handles query errors with onError callback
 */
function UserDataWithCallback({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    onError: (error) => {
      // ✅ CORRECT: Error handled via callback
      console.error('Failed to load user:', error);
      showToast('Failed to load user data');
    },
  });

  return <div>{data?.name}</div>;
}

// ============================================================================
// PROPER: useQuery with smart retry logic
// ============================================================================

/**
 * ✅ Correctly configures retry to avoid retrying client errors
 */
function UserDataWithSmartRetry({ userId }: { userId: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    // ✅ CORRECT: Don't retry client errors (4xx), only server/network errors
    retry: (failureCount, error) => {
      // Check if it's an HTTP error with status
      const statusMatch = error.message.match(/HTTP (\d+):/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        // Don't retry client errors
        if (status >= 400 && status < 500) return false;
      }
      // Retry server errors up to 3 times
      return failureCount < 3;
    },
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{data?.name}</div>;
}

// ============================================================================
// PROPER: useMutation with error handling
// ============================================================================

/**
 * ✅ Correctly handles mutation errors with onError callback
 */
function CreateUserForm() {
  const mutation = useMutation({
    mutationFn: async (userData: { name: string; email: string }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onError: (error) => {
      // ✅ CORRECT: Mutation error handled
      console.error('Mutation failed:', error);
      showToast('Failed to create user');
    },
    onSuccess: (data) => {
      showToast('User created successfully');
    },
  });

  const handleSubmit = (formData: { name: string; email: string }) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ name: 'John', email: 'john@example.com' }); }}>
      <button type="submit" disabled={mutation.isPending}>
        Create User
      </button>
      {/* ✅ CORRECT: Showing error state in UI */}
      {mutation.isError && (
        <div className="error">Error: {mutation.error.message}</div>
      )}
    </form>
  );
}

// ============================================================================
// PROPER: useMutation with mutateAsync and try-catch
// ============================================================================

/**
 * ✅ Correctly handles mutation errors with try-catch on mutateAsync
 */
function UpdateUserForm({ userId }: { userId: string }) {
  const mutation = useMutation({
    mutationFn: async (userData: { name: string }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
  });

  const handleSubmit = async (formData: { name: string }) => {
    try {
      // ✅ CORRECT: Using try-catch with mutateAsync
      await mutation.mutateAsync(formData);
      showToast('User updated successfully');
    } catch (error) {
      // ✅ CORRECT: Error caught and handled
      console.error('Update failed:', error);
      showToast('Failed to update user');
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ name: 'John' }); }}>
      <button type="submit">Update User</button>
    </form>
  );
}

// ============================================================================
// PROPER: useMutation with optimistic updates and rollback
// ============================================================================

/**
 * ✅ Correctly handles optimistic update rollback on error
 */
function TodoToggle({ todoId, queryClient }: { todoId: string; queryClient: any }) {
  const mutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error('Failed to toggle todo');
      return response.json();
    },
    // Optimistic update
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old: any) => {
        return old.map((todo: any) =>
          todo.id === newTodo.id ? { ...todo, completed: newTodo.completed } : todo
        );
      });
      return { previousTodos };
    },
    // ✅ CORRECT: Rollback on error
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      showToast('Failed to update todo');
    },
  });

  return null;
}

// ============================================================================
// PROPER: useInfiniteQuery with error handling
// ============================================================================

/**
 * ✅ Correctly handles infinite query errors
 */
function InfiniteUserList() {
  const {
    data,
    error,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/users?page=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // ✅ CORRECT: Checking error state
  if (isError) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div>
      {data?.pages.map((page) =>
        page.users.map((user: any) => <div key={user.id}>{user.name}</div>)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </div>
  );
}

// ============================================================================
// PROPER: QueryClient with global error handlers
// ============================================================================

/**
 * ✅ Correctly configures global error handlers for consistent UX
 */
const queryClientWithGlobalHandlers = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ CORRECT: Smart retry logic that doesn't retry client errors
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          // Don't retry client errors
          if (status && status >= 400 && status < 500) return false;
        }
        // Retry server/network errors up to 3 times
        return failureCount < 3;
      },
      staleTime: 10 * 1000, // 10 seconds
    },
  },
  // ✅ CORRECT: Global query error handler
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Query error:', error);

      // Handle specific error types
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/login';
        } else if (error.response?.status === 500) {
          showToast('Server error. Please try again later.');
        }
      } else {
        // Network error or other error
        showToast('An error occurred. Please check your connection.');
      }
    },
  }),
  // ✅ CORRECT: Global mutation error handler
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
      showToast('Failed to save changes');
    },
  }),
});

// ============================================================================
// PROPER: Network error vs HTTP error handling
// ============================================================================

/**
 * ✅ Correctly distinguishes between network errors and HTTP errors
 */
function UserDataWithNetworkErrorHandling({ userId }: { userId: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (err) {
        // Network errors from fetch are TypeErrors
        if (err instanceof TypeError) {
          throw new Error('Network error: Please check your internet connection');
        }
        throw err;
      }
    },
  });

  if (isError) {
    // ✅ CORRECT: Distinguishing network errors from HTTP errors
    if (error.message.includes('Network error')) {
      return <div>No internet connection. Please try again.</div>;
    }
    if (error.message.includes('HTTP 404')) {
      return <div>User not found</div>;
    }
    if (error.message.includes('HTTP 500')) {
      return <div>Server error. Please try again later.</div>;
    }
    return <div>Error: {error.message}</div>;
  }

  return <div>{data?.name}</div>;
}

// ============================================================================
// Helper function (mock)
// ============================================================================

function showToast(message: string) {
  console.log('Toast:', message);
}

// Mock React component type
type ReactNode = any;
function div(props: any): ReactNode {
  return null;
}
