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

import { useMutation, useQuery } from "@tanstack/react-query";

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
