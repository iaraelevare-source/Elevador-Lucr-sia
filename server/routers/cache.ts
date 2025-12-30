/**
 * 💾 Cache Router - Elevare
 * Admin endpoints for cache monitoring and management
 */

import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { cache, userCache, aiCache, analyticsCache, contentCache } from "../_core/cache";
import { logger } from "../adapters/loggingAdapter";

export const cacheRouter = router({
  /**
   * Get cache statistics
   */
  getStats: adminProcedure.query(() => {
    return cache.getStats();
  }),

  /**
   * Clear all cache
   */
  clearAll: adminProcedure.mutation(() => {
    cache.clear();
    logger.info("Admin cleared all cache");
    return { success: true, message: "All cache cleared" };
  }),

  /**
   * Clear specific namespace
   */
  clearNamespace: adminProcedure
    .input(z.object({
      namespace: z.enum(["user", "ai", "analytics", "content", "general"]),
    }))
    .mutation(({ input }) => {
      const deleted = cache.deleteByNamespace(input.namespace);
      logger.info("Admin cleared cache namespace", { namespace: input.namespace, deleted });
      return { success: true, deleted, namespace: input.namespace };
    }),

  /**
   * Delete specific key
   */
  deleteKey: adminProcedure
    .input(z.object({
      key: z.string().min(1),
      namespace: z.enum(["user", "ai", "analytics", "content", "general"]).optional(),
    }))
    .mutation(({ input }) => {
      const deleted = cache.delete(input.key, { namespace: input.namespace });
      logger.info("Admin deleted cache key", { key: input.key, namespace: input.namespace, deleted });
      return { success: true, deleted };
    }),

  /**
   * Get namespace-specific stats
   */
  getNamespaceStats: adminProcedure.query(() => {
    const stats = cache.getStats();
    
    // Count entries per namespace
    // This is a simplified version - full implementation would track per-namespace
    return {
      overall: stats,
      namespaces: {
        user: { description: "User profiles and preferences" },
        ai: { description: "AI responses and embeddings" },
        analytics: { description: "Dashboard metrics and reports" },
        content: { description: "Static content and templates" },
        general: { description: "Miscellaneous cached data" },
      },
    };
  }),

  /**
   * Warm up cache with common data
   */
  warmup: adminProcedure.mutation(async () => {
    logger.info("Cache warmup started");
    
    // Here you would pre-populate cache with frequently accessed data
    // Example: await contentCache.set('plans', await fetchPlans(), 60 * 60 * 1000);
    
    logger.info("Cache warmup completed");
    return { success: true, message: "Cache warmup completed" };
  }),
});
