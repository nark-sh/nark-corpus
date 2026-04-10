/**
 * Instance-based usage of @trpc/client — testing detection via class instance.
 * The trpcVanilla client is created once and used across methods.
 * Should produce violations for unprotected calls.
 */

import { createTRPCProxyClient, httpLink, isTRPCClientError } from '@trpc/client';

type AppRouter = any;

// Singleton client instance
const trpcVanilla = createTRPCProxyClient<AppRouter>({
  links: [httpLink({ url: 'http://localhost:3000/api/trpc' })],
});

class GenerationStore {
  private cache = new Map<string, Promise<any>>();

  /**
   * ❌ Missing try-catch — mirrors civitai's generation-graph.store.ts antipattern
   */
  async fetchGenerationData(resourceId: string) {
    const cached = this.cache.get(resourceId);
    if (cached) return cached;

    const promise = trpcVanilla.generation.getGenerationData
      .query({ id: resourceId })
      .then((data: any) => data)
      .catch((err: unknown) => {
        this.cache.delete(resourceId); // Allow retry on failure
        throw err; // Still rethrows — unhandled by callers
      });

    this.cache.set(resourceId, promise);
    return promise;
  }

  /**
   * ✅ Proper handling with typed error check
   */
  async fetchWithProperHandling(resourceId: string) {
    try {
      const data = await trpcVanilla.resource.getById.query({ id: resourceId });
      return data;
    } catch (cause) {
      if (isTRPCClientError(cause)) {
        if (cause.data?.code === 'NOT_FOUND') {
          return null;
        }
        console.error('Resource fetch failed:', cause.message);
      }
      throw cause;
    }
  }
}

/**
 * Module-level function using the singleton — mirrors fetchSignaledWorkflow antipattern
 */
async function fetchWorkflowStatus(workflowId: string) {
  // ❌ No try-catch
  return await trpcVanilla.orchestrator.statusUpdate.query({ workflowId });
}

export { GenerationStore, fetchWorkflowStatus };
