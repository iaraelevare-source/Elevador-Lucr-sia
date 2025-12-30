/**
 * 🔐 TWO-FACTOR AUTHENTICATION ROUTER
 * Endpoints para configurar e validar 2FA (Admin apenas)
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { logger } from "../_core/logger";
import {
  generate2FASecret,
  verify2FACode,
  has2FAEnabled,
  enable2FA,
  disable2FA,
  verifyBackupCode,
} from "../_core/2fa";

// Middleware para garantir que apenas admins acessem
const adminOnly = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "2FA é disponível apenas para administradores",
    });
  }
  return next({ ctx });
});

export const twoFactorRouter = router({
  /**
   * Verifica se 2FA está ativo
   */
  status: adminOnly.query(async ({ ctx }) => {
    const enabled = await has2FAEnabled(ctx.user.id);
    return { enabled };
  }),

  /**
   * Gera secret e QR code para configurar 2FA
   */
  setup: adminOnly.mutation(async ({ ctx }) => {
    try {
      const alreadyEnabled = await has2FAEnabled(ctx.user.id);
      
      if (alreadyEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA já está ativado. Desative primeiro para reconfigurar.",
        });
      }

      const setup = await generate2FASecret(ctx.user.id, ctx.user.email || "");

      logger.info("2FA setup initiated", { userId: ctx.user.id });

      return {
        secret: setup.secret,
        qrCode: setup.qrCode,
        backupCodes: setup.backupCodes,
      };
    } catch (error) {
      logger.error("Failed to setup 2FA", { userId: ctx.user.id, error });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao configurar 2FA",
      });
    }
  }),

  /**
   * Ativa 2FA após validar código TOTP
   */
  enable: adminOnly
    .input(
      z.object({
        secret: z.string(),
        code: z.string().length(6),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Valida código TOTP
        const isValid = verify2FACode(input.secret, input.code);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código inválido. Verifique o código no seu autenticador.",
          });
        }

        // Ativa 2FA
        await enable2FA(ctx.user.id, input.secret, input.backupCodes);

        logger.info("2FA enabled successfully", { userId: ctx.user.id });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        logger.error("Failed to enable 2FA", { userId: ctx.user.id, error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao ativar 2FA",
        });
      }
    }),

  /**
   * Desativa 2FA (requer código TOTP ou backup code)
   */
  disable: adminOnly
    .input(
      z.object({
        code: z.string(),
        isBackupCode: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const enabled = await has2FAEnabled(ctx.user.id);

        if (!enabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "2FA não está ativo",
          });
        }

        let isValid = false;

        if (input.isBackupCode) {
          isValid = await verifyBackupCode(ctx.user.id, input.code);
        } else {
          // Buscar secret do usuário
          const { db } = await import("../db");
          const { users } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          const [user] = await db
            .select({ twoFactorSecret: users.twoFactorSecret })
            .from(users)
            .where(eq(users.id, ctx.user.id))
            .limit(1);

          if (user?.twoFactorSecret) {
            isValid = verify2FACode(user.twoFactorSecret, input.code);
          }
        }

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código inválido",
          });
        }

        await disable2FA(ctx.user.id);

        logger.info("2FA disabled successfully", { userId: ctx.user.id });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        logger.error("Failed to disable 2FA", { userId: ctx.user.id, error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao desativar 2FA",
        });
      }
    }),

  /**
   * Verifica código 2FA (usado no login)
   */
  verify: adminOnly
    .input(
      z.object({
        code: z.string(),
        isBackupCode: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let isValid = false;

        if (input.isBackupCode) {
          isValid = await verifyBackupCode(ctx.user.id, input.code);
        } else {
          const { db } = await import("../db");
          const { users } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          const [user] = await db
            .select({ twoFactorSecret: users.twoFactorSecret })
            .from(users)
            .where(eq(users.id, ctx.user.id))
            .limit(1);

          if (user?.twoFactorSecret) {
            isValid = verify2FACode(user.twoFactorSecret, input.code);
          }
        }

        if (!isValid) {
          logger.warn("Invalid 2FA code attempt", { userId: ctx.user.id });
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código inválido",
          });
        }

        logger.info("2FA verification successful", { userId: ctx.user.id });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        logger.error("Failed to verify 2FA", { userId: ctx.user.id, error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao verificar código",
        });
      }
    }),
});
