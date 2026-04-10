# Sources for @tanstack/react-query Contract

**Package:** @tanstack/react-query
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-24

---

## Official Documentation

- [Query Functions Guide](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions) - Error throwing and handling patterns
- [useQuery API Reference](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery) - Hook API and error states
- [useMutation API Reference](https://tanstack.com/query/v4/docs/framework/react/reference/useMutation) - Mutation API and error callbacks
- [TypeScript Guide](https://tanstack.com/query/v5/docs/framework/react/typescript) - Error type generics
- [Query Retries Guide](https://tanstack.com/query/v4/docs/framework/react/guides/query-retries) - Retry configuration and patterns
- [Query Retries Guide (Latest)](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries) - Updated retry documentation
- [Mutations Guide](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - Mutation error handling
- [Infinite Queries Guide](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) - Pagination error scenarios
- [Caching Guide](https://tanstack.com/query/latest/docs/framework/react/guides/caching) - Stale data and gcTime/cacheTime
- [Important Defaults](https://tanstack.com/query/v4/docs/react/guides/important-defaults) - Default behavior understanding
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) - Rollback patterns

---

## CVE Analysis

### CVE-2024-24558
- **Title:** Cross-site Scripting vulnerability in @tanstack/react-query-next-experimental
- **NVD:** [CVE-2024-24558](https://nvd.nist.gov/vuln/detail/CVE-2024-24558)
- **GitHub Advisory:** [GHSA-997g-27x8-43rf](https://github.com/TanStack/query/security/advisories/GHSA-997g-27x8-43rf)
- **Description:** XSS vulnerability in experimental Next.js package due to improper handling of untrusted input during server-side rendering
- **Fixed In:** v5.18.0 or later
- **Relevance:** Demonstrates importance of proper error handling in SSR contexts

---

## Community Resources

### Error Handling Best Practices
- [React Query Error Handling - TkDodo Blog](https://tkdodo.eu/blog/react-query-error-handling) - Comprehensive error handling guide
- [Global Error Handling in React-Query v5](https://medium.com/@valerasheligan/how-to-handle-global-errors-in-react-query-v5-4f8b919ee47a) - Global error handlers with QueryCache
- [Error Handling with React Query - TanStack Community](https://www.answeroverflow.com/m/1302677670571802624) - Community discussions

### GitHub Issues & Discussions
- [Advanced Error Handling Discussion #6490](https://github.com/TanStack/query/discussions/6490) - Retrieving server error codes
- [onError callback behavior with retry #1990](https://github.com/TanStack/query/issues/1990) - onError not called if retry enabled
- [Global and local onError callbacks #3125](https://github.com/TanStack/query/discussions/3125) - Error callback patterns
- [Retry async behavior #2770](https://github.com/TanStack/query/discussions/2770) - Async retry challenges
- [Should it retry for 404 responses? #372](https://github.com/TanStack/query/discussions/372) - Client error retry discussion

### Additional Resources
- [React Query Retry Strategies - DhiWise](https://www.dhiwise.com/blog/design-converter/react-query-retry-strategies-for-better-error-handling) - Retry patterns and strategies
- [React Query Retry Explained - Dayvster](https://dayvster.com/blog/react-query-retry/) - Detailed retry explanation
- [Fixing Tanstack Query Null Error Handling](https://medium.com/@python-javascript-php-html-css/fixing-tanstack-query-null-error-handling-with-expo-and-react-native-8542bd20d43e) - React Native error handling
- [StaleTime vs CacheTime - Medium](https://medium.com/@bloodturtle/understanding-staletime-vs-gctime-in-tanstack-query-e9928d3e41d4) - Cache management understanding
- [StaleTime vs CacheTime Discussion #1685](https://github.com/TanStack/query/discussions/1685) - Official discussion
- [How to Use React Query in React Native](https://oneuptime.com/blog/post/2026-01-15-react-native-tanstack-query/view) - Mobile patterns

---

## Real-World Usage Analysis

### jake-tennis-ai-collections Repository

**Package Version:** ^5.74.3

**Configuration Pattern (src/main.tsx):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry in dev
        if (failureCount >= 0 && import.meta.env.DEV) return false
        // Max 3 retries in prod
        if (failureCount > 3 && import.meta.env.PROD) return false
        // Don't retry auth errors
        return !(error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0))
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: async (error) => {
        handleServerError(error)
        // Track to PostHog
        const { captureException } = await import('./lib/posthog')
        captureException(error, { error_source: 'mutation', /* ... */ })
        // Handle specific errors
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: async (error) => {
      // Global query error tracking
      const { captureException } = await import('./lib/posthog')
      if (error instanceof AxiosError) {
        captureException(error, { error_source: 'query_cache', /* ... */ })
        // Navigate on auth errors
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        // Navigate on server errors
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          router.navigate({ to: '/500' })
        }
      }
    }
  }),
})
```

**Key Patterns Observed:**
1. ✅ **Smart retry logic** - Doesn't retry client errors (401, 403)
2. ✅ **Global error handlers** - QueryCache.onError for consistent UX
3. ✅ **Error tracking** - Integration with PostHog for monitoring
4. ✅ **User feedback** - Toast notifications for errors
5. ✅ **Navigation on critical errors** - Redirects for 401/500
6. ✅ **Environment-aware** - Different behavior for dev/prod

**Notable Implementation:**
- Uses Axios error types for HTTP error handling
- Separates mutation errors from query errors with different handlers
- Implements automatic session management on 401 errors
- Configures staleTime to reduce unnecessary refetches

---

## Key Error Behaviors Documented

### 1. Query Errors (useQuery)
- **Error Type:** Returned via `error` property, not thrown
- **States:** `isError`, `error`, `failureReason`
- **Handling Required:** Check error state or use ErrorBoundary with throwOnError
- **Default Retry:** 3 attempts for all errors (should be customized)

### 2. Mutation Errors (useMutation)
- **Error Type:** Returned via `error` property, not thrown
- **Handling Required:** onError callback, error state check, or mutateAsync().catch()
- **Default Retry:** None (mutations don't retry by default)
- **Optimistic Updates:** MUST rollback on error using onMutate context

### 3. Infinite Query Errors (useInfiniteQuery)
- **Error Type:** Per-page errors or full query errors
- **Handling Required:** Check `fetchNextPageError` or global `error`
- **Refetch Behavior:** All pages refetch by default (can fail entirely)

### 4. Retry Logic Anti-Patterns
- ❌ **Bad:** `retry: 3` (retries client errors like 404)
- ❌ **Bad:** `retry: true` (infinite retries)
- ✅ **Good:** Conditional retry based on error type/status

### 5. Stale Data Handling
- **staleTime:** Determines data freshness (default 0 - instantly stale)
- **gcTime:** Memory cleanup time (default 5 minutes)
- **Refetch triggers:** Window focus, reconnect, mount (configurable)
- **Error scenario:** Background refetch failures must be surfaced to user

---

## Contract Design Decisions

### Severity Levels

**ERROR (Must Fix):**
- Not handling query/mutation errors at all
- Missing rollback logic for optimistic updates
- Not handling infinite query fetchNextPage errors
- Not handling network errors vs HTTP errors differently

**WARNING (Should Fix):**
- Retrying on client errors (4xx status codes)
- Missing global error handlers in production
- Using default retry strategy without customization
- Parallel mutations without race condition handling

**INFO (Good to Know):**
- Edge cases like queryFn returning errors instead of throwing
- Concurrent query error state sharing
- staleTime vs gcTime differences
- Mutation queue patterns

---

## Testing Strategy

### Fixtures Created
1. **proper-error-handling.ts** - Correct error handling patterns (0 violations expected)
2. **missing-error-handling.ts** - Missing error handlers (violations expected)
3. **instance-usage.ts** - Real-world usage patterns

### Validation Against jake-tennis
- Global error handler patterns ✓
- Retry logic patterns ✓
- Error state checking patterns ✓
- Optimistic update patterns (not used in sample)

---

## Future Considerations

### Potential Contract Additions (v2.0.0)
- **useQueries** hook error handling (batch queries)
- **QueryErrorResetBoundary** usage patterns
- **Suspense mode** error handling
- **SSR/SSG** error handling patterns
- **Prefetching** error scenarios
- **Cache persistence** error recovery

### Analyzer Enhancements Needed
- Detect missing global error handlers in QueryClient configuration
- Detect retry configuration patterns and validate logic
- Detect optimistic update patterns without rollback
- Track error state usage across components

---

## References

All source URLs have been verified as of 2026-02-24.
Contract covers @tanstack/react-query v5.x (latest stable).
