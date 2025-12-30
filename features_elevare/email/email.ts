/**
 * Email Router - tRPC
 * 
 * Endpoints para envio de emails transacionais
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { emailClient } from "../email/client";
import {
  welcomeEmail,
  subscriptionConfirmationEmail,
  creditsLowEmail,
  renewalReminderEmail,
  passwordResetEmail,
  type WelcomeEmailData,
  type SubscriptionConfirmationData,
  type CreditsLowData,
  type RenewalReminderData,
  type PasswordResetData,
} from "../email/templates";
import { logger } from "../_core/logger";

export const emailRouter = router({
  /**
   * Enviar email de boas-vindas
   */
  sendWelcomeEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        userName: z.string(),
        loginUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const data: WelcomeEmailData = {
        userName: input.userName,
        loginUrl: input.loginUrl,
      };

      const result = await emailClient.send({
        to: input.to,
        subject: "🚀 Bem-vindo ao Elevare AI!",
        html: welcomeEmail(data),
      });

      if (!result.success) {
        logger.error("Failed to send welcome email", { error: result.error, to: input.to });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar confirmação de assinatura
   */
  sendSubscriptionConfirmation: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        userName: z.string(),
        planName: z.string(),
        credits: z.number(),
        renewalDate: z.string(),
        dashboardUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const data: SubscriptionConfirmationData = {
        userName: input.userName,
        planName: input.planName,
        credits: input.credits,
        renewalDate: input.renewalDate,
        dashboardUrl: input.dashboardUrl,
      };

      const result = await emailClient.send({
        to: input.to,
        subject: "✅ Assinatura Confirmada - Elevare AI",
        html: subscriptionConfirmationEmail(data),
      });

      if (!result.success) {
        logger.error("Failed to send subscription confirmation", { error: result.error, to: input.to });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar alerta de créditos baixos
   */
  sendCreditsLowAlert: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        userName: z.string(),
        creditsRemaining: z.number(),
        planName: z.string(),
        upgradeUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const data: CreditsLowData = {
        userName: input.userName,
        creditsRemaining: input.creditsRemaining,
        planName: input.planName,
        upgradeUrl: input.upgradeUrl,
      };

      const result = await emailClient.send({
        to: input.to,
        subject: "⚠️ Seus créditos estão acabando - Elevare AI",
        html: creditsLowEmail(data),
      });

      if (!result.success) {
        logger.error("Failed to send credits low alert", { error: result.error, to: input.to });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar lembrete de renovação
   */
  sendRenewalReminder: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        userName: z.string(),
        planName: z.string(),
        renewalDate: z.string(),
        amount: z.string(),
        manageSubscriptionUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const data: RenewalReminderData = {
        userName: input.userName,
        planName: input.planName,
        renewalDate: input.renewalDate,
        amount: input.amount,
        manageSubscriptionUrl: input.manageSubscriptionUrl,
      };

      const result = await emailClient.send({
        to: input.to,
        subject: "🔄 Renovação automática em breve - Elevare AI",
        html: renewalReminderEmail(data),
      });

      if (!result.success) {
        logger.error("Failed to send renewal reminder", { error: result.error, to: input.to });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Enviar email de redefinição de senha
   */
  sendPasswordReset: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        userName: z.string(),
        resetUrl: z.string().url(),
        expiresIn: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data: PasswordResetData = {
        userName: input.userName,
        resetUrl: input.resetUrl,
        expiresIn: input.expiresIn,
      };

      const result = await emailClient.send({
        to: input.to,
        subject: "🔐 Redefinir senha - Elevare AI",
        html: passwordResetEmail(data),
      });

      if (!result.success) {
        logger.error("Failed to send password reset", { error: result.error, to: input.to });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),

  /**
   * Testar envio de email (apenas para desenvolvimento)
   */
  sendTestEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Apenas permitir em desenvolvimento ou para admins
      if (process.env.NODE_ENV === "production" && !ctx.user.isAdmin) {
        throw new Error("Test emails are only allowed in development");
      }

      const result = await emailClient.send({
        to: input.to,
        subject: "🧪 Email de Teste - Elevare AI",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>✅ Email de Teste</h1>
            <p>Este é um email de teste do sistema Elevare AI.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Ambiente:</strong> ${process.env.NODE_ENV || "development"}</p>
            <p>Se você recebeu este email, significa que o sistema de emails está funcionando corretamente! 🎉</p>
          </body>
          </html>
        `,
      });

      if (!result.success) {
        throw new Error(`Failed to send test email: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    }),
});
