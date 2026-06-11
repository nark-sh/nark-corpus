/**
 * @tanstack/react-query Ground-Truth Fixture — error-state-handled cases
 *
 * Separate from `ground-truth.ts` so the file-level destructured `{ error }`
 * / `isError` markers in THIS fixture do not suppress the SHOULD_FIRE cases
 * in the main ground-truth.ts fixture.
 *
 * Goal: when the caller checks the error state returned by useQuery /
 * useMutation, the scanner MUST NOT fire `stale-query-refetch-error` or
 * `mutation-optimistic-update-rollback`. These are the wave-1 FP
 * suppressions from 9de01a2.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

declare const fetchUser: (id: string) => Promise<{ id: string; name: string }>;
declare const updateUser: (data: { id: string; name: string }) => Promise<void>;

// ─────────────────────────────────────────────────────────────────────────────
// 1. useQuery with destructured { error } — error state acknowledged
// ─────────────────────────────────────────────────────────────────────────────

export function useUserWithErrorDestructured(userId: string) {
  // SHOULD_NOT_FIRE: stale-query-refetch-error — { error } destructured satisfies the postcondition
  const { data, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (error) {
    return { state: 'error' as const, message: String(error) };
  }
  return { state: 'ok' as const, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useQuery with isError checked — error state acknowledged
// ─────────────────────────────────────────────────────────────────────────────

export function useUserWithIsErrorCheck(userId: string) {
  // SHOULD_NOT_FIRE: stale-query-refetch-error — isError check satisfies the postcondition
  const result = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (result.isError) {
    return { state: 'error' as const, error: result.error };
  }
  return { state: 'ok' as const, data: result.data };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. useQuery with destructured { isError } — error state acknowledged
// ─────────────────────────────────────────────────────────────────────────────

export function useUserWithIsErrorDestructured(userId: string) {
  // SHOULD_NOT_FIRE: stale-query-refetch-error — destructured isError satisfies the postcondition
  const { data, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isError) {
    return { state: 'error' as const };
  }
  return { state: 'ok' as const, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. useMutation with destructured { error } — error state acknowledged
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateUserWithErrorDestructured() {
  // SHOULD_NOT_FIRE: mutation-optimistic-update-rollback — { error } destructured satisfies the postcondition
  const { mutate, error } = useMutation({
    mutationFn: updateUser,
  });

  if (error) {
    console.error('Update failed:', error);
  }
  return { mutate, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. useMutation with destructured { isError } — error state acknowledged
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateUserWithIsErrorDestructured() {
  // SHOULD_NOT_FIRE: mutation-optimistic-update-rollback — destructured isError satisfies the postcondition
  const { mutate, isError, error } = useMutation({
    mutationFn: updateUser,
  });

  if (isError) {
    return { mutate, failed: true, error };
  }
  return { mutate, failed: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. useMutation with onError callback — global handler satisfies the contract
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateUserWithOnErrorCallback() {
  const queryClient = useQueryClient();

  // SHOULD_NOT_FIRE: mutation-optimistic-update-rollback — onError rollback satisfies the contract
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user', newData.id] });
      const previousData = queryClient.getQueryData(['user', newData.id]);
      queryClient.setQueryData(['user', newData.id], newData);
      return { previousData };
    },
    onError: (_err, newData, context) => {
      queryClient.setQueryData(['user', newData.id], context?.previousData);
    },
  });
}
