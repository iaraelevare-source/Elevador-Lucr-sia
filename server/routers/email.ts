/**
 * 📧 Email Router - Elevare
 * Endpoints tRPC para envio de emails transacionais
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  sendEmail,
  getEmailConfig,
  welcomeEmail,
  subscriptionConfirmationEmail,
  lowCreditsEmail,
  renewalReminderEmail,
  passwordResetEmail,
} from "../adapters/emailAdapter";
import { logger } from "../adapters/loggingAdapter";

export const emailRouter = router({
  /**
   * Obter configuração de email (admin apenas)
   */
  getConfig: adminProcedure.query(() => {
    return getEmailConfig();
  }),

  /**
   * Enviar email de boas-vindas
   */
  sendWelcome: protectedProcedure
    .input(z.object({
      userName: z.string().min(1),
      email: z.string().email(),
      dashboardUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const template = welcomeEmail({
        userName: input.userName,
        dashboardUrl: input.dashboardUrl,
      });

      const result = await sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
      });

      if (!result.success) {
        logger.error("Failed to send welcome email", { error: result.error, to: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao enviar email de boas-vindas",
        });
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar confirmação de assinatura
   */
  sendSubscriptionConfirmation: protectedProcedure
    .input(z.object({
      userName: z.string().min(1),
      email: z.string().email(),
      planName: z.string().min(1),
      monthlyCredits: z.number(),
      renewalDate: z.string(),
      dashboardUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const template = subscriptionConfirmationEmail({
        userName: input.userName,
        planName: input.planName,
        monthlyCredits: input.monthlyCredits,
        renewalDate: input.renewalDate,
        dashboardUrl: input.dashboardUrl,
      });

      const result = await sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
      });

      if (!result.success) {
        logger.error("Failed to send subscription confirmation", { error: result.error, to: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao enviar confirmação de assinatura",
        });
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar alerta de créditos baixos
   */
  sendLowCreditsAlert: protectedProcedure
    .input(z.object({
      userName: z.string().min(1),
      email: z.string().email(),
      creditsRemaining: z.number().min(0),
      upgradeUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const template = lowCreditsEmail({
        userName: input.userName,
        creditsRemaining: input.creditsRemaining,
        upgradeUrl: input.upgradeUrl,
      });

      const result = await sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
      });

      if (!result.success) {
        logger.error("Failed to send low credits alert", { error: result.error, to: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao enviar alerta de créditos",
        });
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar lembrete de renovação
   */
  sendRenewalReminder: protectedProcedure
    .input(z.object({
      userName: z.string().min(1),
      email: z.string().email(),
      planName: z.string().min(1),
      renewalDate: z.string(),
      amount: z.string(),
      manageUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const template = renewalReminderEmail({
        userName: input.userName,
        planName: input.planName,
        renewalDate: input.renewalDate,
        amount: input.amount,
        manageUrl: input.manageUrl,
      });

      const result = await sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
      });

      if (!result.success) {
        logger.error("Failed to send renewal reminder", { error: result.error, to: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao enviar lembrete de renovação",
        });
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar email de redefinição de senha (público - não requer auth)
   */
  sendPasswordReset: publicProcedure
    .input(z.object({
      userName: z.string().min(1),
      email: z.string().email(),
      resetUrl: z.string().url(),
      expiresIn: z.string().default("1 hora"),
    }))
    .mutation(async ({ input }) => {
      const template = passwordResetEmail({
        userName: input.userName,
        resetUrl: input.resetUrl,
        expiresIn: input.expiresIn,
      });

      const result = await sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
      });

      if (!result.success) {
        logger.error("Failed to send password reset email", { error: result.error, to: input.email });
        // Não expor erro detalhado por segurança
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao processar solicitação",
        });
      }

      return { success: true };
    }),

  /**
   * Endpoint de teste (desenvolvimento apenas)
   */
  testEmail: adminProcedure
    .input(z.object({
      to: z.string().email(),
      template: z.enum(["welcome", "subscription", "lowCredits", "renewal", "passwordReset"]),
    }))
    .mutation(async ({ input }) => {
      if (process.env.NODE_ENV === "production") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Endpoint de teste não disponível em produção",
        });
      }

      const testData = {
        welcome: welcomeEmail({ userName: "Usuário Teste" }),
        subscription: subscriptionConfirmationEmail({
          userName: "Usuário Teste",
          planName: "Profissional",
          monthlyCredits: 500,
          renewalDate: "15/01/2026",
        }),
        lowCredits: lowCreditsEmail({
          userName: "Usuário Teste",
          creditsRemaining: 5,
        }),
        renewal: renewalReminderEmail({
          userName: "Usuário Teste",
          planName: "Essencial",
          renewalDate: "20/01/2026",
          amount: "R$ 49,90",
        }),
        passwordReset: passwordResetEmail({
          userName: "Usuário Teste",
          resetUrl: "https://elevare.app/reset?token=test123",
          expiresIn: "1 hora",
        }),
      };

      const template = testData[input.template];
      const result = await sendEmail({
        to: input.to,
        subject: `[TESTE] ${template.subject}`,
        html: template.html,
      });

      return {
        success: result.success,
        messageId: result.messageId,
        provider: result.provider,
        error: result.error,
      };
    }),
});
