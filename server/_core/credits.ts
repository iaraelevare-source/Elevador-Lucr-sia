/**
 * 🔒 SISTEMA DE VALIDAÇÃO E CONSUMO DE CRÉDITOS
 * Protege rotas de geração contra uso não autorizado
 */

import { db } from "../db";
import { subscription } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { logger } from "./logger";

// Custos por tipo de geração
export const CREDIT_COSTS = {
  post: 5,
  ebook: 20,
  ebook_audio: 30,
  ad: 10,
  reel_script: 10,
  bio_analysis: 5,
  diagnostico: 0, // Grátis para captação
} as const;

export type GenerationType = keyof typeof CREDIT_COSTS;

/**
 * Verifica se usuário tem créditos suficientes
 * @throws TRPCError se não tiver créditos
 */
export async function checkCredits(
  userId: number,
  type: GenerationType
): Promise<{ subscription: typeof subscription.$inferSelect; cost: number }> {
  const cost = CREDIT_COSTS[type];

  const [userSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (!userSub) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Assinatura não encontrada. Faça login novamente.",
    });
  }

  // Plano free com créditos limitados
  if (userSub.plan === "free") {
    if (userSub.creditsRemaining < cost) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Créditos insuficientes. Você tem ${userSub.creditsRemaining} créditos, mas esta ação requer ${cost}. Faça upgrade para continuar gerando!`,
      });
    }
  }

  // Plano essencial
  if (userSub.plan === "essencial") {
    if (userSub.creditsRemaining < cost) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Você atingiu seu limite de créditos este mês. Aguarde a renovação ou faça upgrade para o plano Profissional.`,
      });
    }
  }

  // Plano profissional tem créditos ilimitados (-1)
  // Não precisa verificar

  return { subscription: userSub, cost };
}

/**
 * Consome créditos do usuário após geração bem-sucedida
 */
export async function consumeCredits(
  userId: number,
  type: GenerationType,
  description?: string
): Promise<void> {
  const { subscription: userSub, cost } = await checkCredits(userId, type);

  // Não consumir se plano profissional (créditos ilimitados)
  if (userSub.plan === "profissional" || userSub.creditsRemaining === -1) {
    logger.info("Credits not consumed - unlimited plan", { userId, type });
    return;
  }

  // Consumir créditos
  await db
    .update(subscription)
    .set({
      creditsRemaining: userSub.creditsRemaining - cost,
    })
    .where(eq(subscription.userId, userId));

  logger.info("Credits consumed", {
    userId,
    type,
    cost,
    remaining: userSub.creditsRemaining - cost,
    description,
  });
}

/**
 * Obtém saldo de créditos do usuário
 */
export async function getCreditsBalance(userId: number): Promise<{
  remaining: number;
  limit: number;
  plan: string;
  isUnlimited: boolean;
}> {
  const [userSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (!userSub) {
    return {
      remaining: 0,
      limit: 0,
      plan: "free",
      isUnlimited: false,
    };
  }

  return {
    remaining: userSub.creditsRemaining,
    limit: userSub.monthlyCreditsLimit,
    plan: userSub.plan,
    isUnlimited: userSub.creditsRemaining === -1 || userSub.plan === "profissional",
  };
}

/**
 * Adiciona créditos bônus ao usuário
 * Usado para referrals, avaliações, etc.
 */
export async function addBonusCredits(
  userId: number,
  credits: number,
  reason: string
): Promise<void> {
  const [userSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (!userSub) {
    logger.warn("Cannot add bonus credits - subscription not found", { userId });
    return;
  }

  // Não adicionar a planos ilimitados
  if (userSub.creditsRemaining === -1) {
    logger.info("Bonus credits skipped - unlimited plan", { userId, credits, reason });
    return;
  }

  await db
    .update(subscription)
    .set({
      creditsRemaining: userSub.creditsRemaining + credits,
    })
    .where(eq(subscription.userId, userId));

  logger.info("Bonus credits added", {
    userId,
    credits,
    reason,
    newBalance: userSub.creditsRemaining + credits,
  });
}
