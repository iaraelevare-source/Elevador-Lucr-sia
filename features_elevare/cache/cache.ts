/**
 * Cache Router - tRPC
 * 
 * Endpoints para monitorar e gerenciar cache
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { cache } from "../_core/cache";
import { logger } from "../_core/logger";

export const cacheRouter = router({
  /**
   * Obter estatísticas do cache
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Apenas admins podem ver stats
    if (!ctx.user.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const stats = cache.getStats();
    
    logger.info("Cache stats requested", { userId: ctx.user.id });
    
    return stats;
  }),

  /**
   * Limpar cache completo (apenas admin)
   */
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    cache.clear();
    
    logger.warn("Cache cleared by admin", { userId: ctx.user.id });
    
    return { success: true, message: "Cache cleared successfully" };
  }),

  /**
   * Deletar chave específica (apenas admin)
   */
  deleteKey: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      const deleted = cache.delete(input.key);
      
      logger.info("Cache key deleted by admin", {
        userId: ctx.user.id,
        key: input.key,
        deleted,
      });
      
      return { success: deleted, key: input.key };
    }),

  /**
   * Deletar chaves por pattern (apenas admin)
   */
  deletePattern: protectedProcedure
    .input(
      z.object({
        pattern: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      const deleted = cache.deletePattern(input.pattern);
      
      logger.info("Cache pattern deleted by admin", {
        userId: ctx.user.id,
        pattern: input.pattern,
        deleted,
      });
      
      return { success: true, pattern: input.pattern, deleted };
    }),

  /**
   * Resetar estatísticas (apenas admin)
   */
  resetStats: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    cache.resetStats();
    
    logger.info("Cache stats reset by admin", { userId: ctx.user.id });
    
    return { success: true, message: "Cache stats reset successfully" };
  }),
});
