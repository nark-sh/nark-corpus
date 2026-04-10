/**
 * Missing Error Handling Examples for @tanstack/react-query
 *
 * This file demonstrates INCORRECT error handling patterns.
 * Should produce ERROR violations when analyzed.
 */

import { useQuery, useMutation, useInfiniteQuery, QueryClient } from '@tanstack/react-query';

// ============================================================================
// VIOLATION: useQuery without error handling
// ============================================================================

/**
 * ❌ Missing error handling - not checking isError or error property
 * Should trigger: query-error-unhandled
 */
function UserProfileNoErrorHandling({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  // ❌ VIOLATION: No error state check - renders undefined on error
  return <div>{data.name}</div>;
}

// ============================================================================
// VIOLATION: useQuery with bad retry logic
// ============================================================================

/**
 * ❌ Retries on all errors including client errors (4xx)
 * Should trigger: query-retry-client-errors
 */
function UserDataBadRetry({ userId }: { userId: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    // ❌ VIOLATION: Retries ALL errors including 404, 401, etc.
    retry: 3,
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{data?.name}</div>;
}

/**
 * ❌ Infinite retries on all errors
 * Should trigger: query-retry-client-errors
 */
function UserDataInfiniteRetry({ userId }: { userId: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    // ❌ VIOLATION: Infinite retries including client errors
    retry: true,
  });

  if (isError) return <div>Error: {error.message}</div>;
  return <div>{data?.name}</div>;
}

// ============================================================================
// VIOLATION: useMutation without error handling
// ============================================================================

/**
 * ❌ Missing mutation error handling
 * Should trigger: mutation-error-unhandled
 */
function CreateUserFormNoErrorHandling() {
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
    // ❌ VIOLATION: No onError callback
    onSuccess: (data) => {
      console.log('User created:', data);
    },
  });

  const handleSubmit = (formData: { name: string; email: string }) => {
    // ❌ VIOLATION: No error handling when calling mutate
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ name: 'John', email: 'john@example.com' }); }}>
      <button type="submit" disabled={mutation.isPending}>
        Create User
      </button>
      {/* ❌ VIOLATION: No error state displayed */}
    </form>
  );
}

/**
 * ❌ Using mutateAsync without try-catch
 * Should trigger: mutation-error-unhandled
 */
function UpdateUserFormNoTryCatch({ userId }: { userId: string }) {
  const mutation = useMutation({
    mutationFn: async (userData: { name: string }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
  });

  const handleSubmit = async (formData: { name: string }) => {
    // ❌ VIOLATION: No try-catch around mutateAsync
    await mutation.mutateAsync(formData);
    console.log('User updated');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ name: 'John' }); }}>
      <button type="submit">Update User</button>
    </form>
  );
}

// ============================================================================
// VIOLATION: Optimistic update without rollback
// ============================================================================

/**
 * ❌ Optimistic update without error rollback
 * Should trigger: mutation-optimistic-update-rollback
 */
function TodoToggleNoRollback({ todoId, queryClient }: { todoId: string; queryClient: any }) {
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
    // ❌ VIOLATION: No onError to rollback the optimistic update
    onSuccess: () => {
      console.log('Todo updated');
    },
  });

  return null;
}

// ============================================================================
// VIOLATION: useInfiniteQuery without error handling
// ============================================================================

/**
 * ❌ Missing infinite query error handling
 * Should trigger: infinite-query-error-unhandled
 */
function InfiniteUserListNoErrorHandling() {
  const {
    data,
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

  // ❌ VIOLATION: No error state check

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
// VIOLATION: QueryClient without global error handlers
// ============================================================================

/**
 * ❌ QueryClient without global error handlers in production
 * Should trigger: missing-global-error-handlers (warning)
 */
const queryClientNoGlobalHandlers = new QueryClient({
  defaultOptions: {
    queries: {
      // ❌ VIOLATION: Default retry (3) includes client errors
      retry: 3,
      staleTime: 10 * 1000,
    },
  },
  // ❌ VIOLATION: No QueryCache with onError
  // ❌ VIOLATION: No MutationCache with onError
});

// ============================================================================
// VIOLATION: Not distinguishing network errors from HTTP errors
// ============================================================================

/**
 * ❌ Treating all errors the same (network vs HTTP)
 * Should trigger: network-error-handling
 */
function UserDataGenericErrorHandling({ userId }: { userId: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  if (isError) {
    // ❌ VIOLATION: Generic error message for all error types
    // Doesn't distinguish between network errors (no internet) and HTTP errors (404, 500)
    return <div>Something went wrong</div>;
  }

  return <div>{data?.name}</div>;
}

// ============================================================================
// VIOLATION: Multiple mutations without race condition handling
// ============================================================================

/**
 * ❌ Parallel mutations without coordination
 * Should trigger: mutation-parallel-execution (warning)
 */
function ParallelMutationsNoCoordination() {
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/user/name', {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/user/email', {
        method: 'PUT',
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
  });

  const handleUpdate = () => {
    // ❌ VIOLATION: Firing multiple mutations in parallel without coordination
    // Can cause race conditions and inconsistent state
    updateNameMutation.mutate('John');
    updateEmailMutation.mutate('john@example.com');
  };

  return <button onClick={handleUpdate}>Update Profile</button>;
}

// ============================================================================
// VIOLATION: Stale query refetch error not handled
// ============================================================================

/**
 * ❌ Not handling background refetch errors for stale queries
 * Should trigger: stale-query-refetch-error
 */
function StaleDataNoRefetchErrorHandling({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    staleTime: 5000, // Data becomes stale after 5 seconds
    refetchOnWindowFocus: true, // Will refetch when user returns to window
  });

  if (isLoading) return <div>Loading...</div>;

  // ❌ VIOLATION: When stale data refetches in background and fails,
  // user sees old data with no indication of error
  return <div>{data?.name}</div>;
}

// Mock React component type
type ReactNode = any;
function div(props: any): ReactNode {
  return null;
}
