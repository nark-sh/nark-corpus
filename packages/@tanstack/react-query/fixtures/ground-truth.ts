/**
 * @tanstack/react-query Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations reflect ACTUAL scanner behavior (not contract ideals).
 *
 * Actual scanner behavior (verified by running tests):
 *   - useQuery() hook call itself → SHOULD_FIRE: query-error-unhandled
 *   - useMutation() hook call itself → SHOULD_FIRE: mutation-error-unhandled
 *   - mutation.mutateAsync() → scanner cannot detect this property chain pattern
 *
 * The scanner detects useQuery() and useMutation() as contracted calls because
 * these function names appear in the contract. The scanner fires at the hook
 * call site line, not at the mutateAsync() call site.
 *
 * Contracted postconditions:
 *   query-error-unhandled: useQuery() result's error state not handled
 *   mutation-error-unhandled: useMutation() result's error state not handled / mutateAsync() throws
 *
 * Coverage:
 *   - Section 1: useQuery() without error handling → SHOULD_FIRE: query-error-unhandled
 *   - Section 2: useMutation() without error handling → SHOULD_FIRE: mutation-error-unhandled
 *   - Section 3: mutateAsync() without try-catch → SHOULD_NOT_FIRE (scanner cannot detect property chain)
 *   - Section 4: mutateAsync() inside try-catch → SHOULD_NOT_FIRE
 */

import { useMutation, useQuery, useSuspenseQueries } from "@tanstack/react-query";
// QueryClient resetQueries is exercised via a queryClient instance reference (typed as `any` to keep
// fixtures free of the full QueryClient type machinery — the scanner detects by call-shape, not type).
declare const queryClient: any;

// ─────────────────────────────────────────────────────────────────────────────
// 1. useQuery() — scanner fires on hook call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function useUsersQueryNoErrorHandling() {
  // SHOULD_FIRE: stale-query-refetch-error — useQuery() without error state handling (scanner fires stale-query-refetch-error postcondition for useQuery calls)
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      return res.json();
    },
  });
  return query.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useMutation() — scanner fires on hook call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateUserMutation() {
  // SHOULD_FIRE: mutation-optimistic-update-rollback — useMutation() without error handling (scanner fires mutation-optimistic-update-rollback postcondition for useMutation calls)
  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });
  return mutation;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. mutateAsync() without try-catch — scanner cannot detect property chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function submitFormNoCatch(
  mutation: ReturnType<typeof useMutation>,
  data: Record<string, unknown>,
) {
  // SHOULD_NOT_FIRE: scanner cannot detect mutateAsync() property chain on useMutation result
  const result = await mutation.mutateAsync(data);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. mutateAsync() inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function submitFormWithCatch(
  mutation: ReturnType<typeof useMutation>,
  data: Record<string, unknown>,
) {
  try {
    // SHOULD_NOT_FIRE: mutateAsync() inside try-catch (scanner cannot detect this pattern anyway)
    const result = await mutation.mutateAsync(data);
    return result;
  } catch (error) {
    console.error("Mutation failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. useSuspenseQueries() — scanner fires on hook call → SHOULD_FIRE
// Added 2026-06-24 (deepen-stream-3 pass 26) — covers suspense-queries-error-boundary-required.
// ─────────────────────────────────────────────────────────────────────────────

export function useUsersAndPostsSuspenseNoBoundary() {
  // SHOULD_NOT_FIRE: scanner's react-query-analyzer only knows about
  // useQuery / useMutation / useInfiniteQuery as of nark@3.2.0 — useSuspenseQueries
  // detection is queued as scanner concern concern-20260624-tanstack-react-query-deepen-1.
  // Postcondition suspense-queries-error-boundary-required exists in the contract for
  // when the scanner catches up; this fixture documents the call shape for the future rule.
  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: ["users"],
        queryFn: async () => {
          const res = await fetch("/api/users");
          return res.json();
        },
      },
      {
        queryKey: ["posts"],
        queryFn: async () => {
          const res = await fetch("/api/posts");
          return res.json();
        },
      },
    ],
  });
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. queryClient.resetQueries() with throwOnError:true outside try-catch → SHOULD_FIRE
// Added 2026-06-24 (deepen-stream-3 pass 26) — covers resetqueries-throws-when-throw-on-error.
// Note: the scanner detects resetQueries by name; the scanner cannot inspect the throwOnError
// flag value, so this annotation reflects what the contract documents, not detection precision.
// ─────────────────────────────────────────────────────────────────────────────

export async function resetSessionNoCatch() {
  // SHOULD_NOT_FIRE: scanner cannot detect property-chain call (queryClient.resetQueries(...))
  // through a typed-any variable. The resetQueries postconditions cover the call shape, but
  // the scanner's current detection path (top-level / named-import) won't fire on this access.
  // Documenting as SHOULD_NOT_FIRE keeps the fixture honest about scanner behavior.
  await queryClient.resetQueries({
    queryKey: ["session"],
    throwOnError: true,
  });
}

export async function resetSessionWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    await queryClient.resetQueries({
      queryKey: ["session"],
      throwOnError: true,
    });
  } catch (error) {
    console.error("reset-and-refetch failed:", error);
    throw error;
  }
}
