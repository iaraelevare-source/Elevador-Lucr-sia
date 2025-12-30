import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { feedback, referrals, googleReviewIntents, freeTrials, diagnosticos, users } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// ============================================
// 🎯 CONSTANTES
// ============================================
const FREE_TRIAL_DAYS = 30;
const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL || "https://g.page/r/lucresia";
const BASE_URL = process.env.BASE_URL || "https://lucresia.com";

// ============================================
// 🔧 FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Ativa trial de 30 dias para um usuário
 */
async function activateFreeTrial(userId: number, method: string): Promise<{ success: boolean; expiresAt: Date }> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + FREE_TRIAL_DAYS);
  
  // Verificar se já tem trial ativo
  const existingTrial = await db
    .select()
    .from(freeTrials)
    .where(and(
      eq(freeTrials.userId, userId),
      eq(freeTrials.isActive, 1)
    ))
    .limit(1);
  
  if (existingTrial.length > 0) {
    // Já tem trial ativo, retorna o existente
    return { success: true, expiresAt: existingTrial[0].expiresAt };
  }
  
  // Criar novo trial
  await db.insert(freeTrials).values({
    userId,
    activationMethod: method,
    expiresAt,
    isActive: 1,
  });
  
  return { success: true, expiresAt };
}

/**
 * Gera código de referral único
 */
function generateReferralCode(): string {
  return nanoid(12);
}

// ============================================
// 🚀 ROUTER DE GAMIFICAÇÃO
// ============================================
export const gamificationRouter = router({
  
  // ──────────────────────────────────────────
  // 📊 STATUS DO USUÁRIO
  // ──────────────────────────────────────────
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // Buscar trial ativo
    const activeTrial = await db
      .select()
      .from(freeTrials)
      .where(and(
        eq(freeTrials.userId, userId),
        eq(freeTrials.isActive, 1)
      ))
      .limit(1);
    
    // Buscar diagnóstico mais recente
    const lastDiagnostico = await db
      .select()
      .from(diagnosticos)
      .where(eq(diagnosticos.userId, userId))
      .orderBy(sql`createdAt DESC`)
      .limit(1);
    
    // Buscar feedback dado
    const feedbackGiven = await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .limit(1);
    
    // Contar referrals convertidos
    const referralStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        converted: sql<number>`SUM(CASE WHEN converted = 1 THEN 1 ELSE 0 END)`
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
    
    return {
      hasActiveTrial: activeTrial.length > 0,
      trialExpiresAt: activeTrial[0]?.expiresAt || null,
      hasDiagnostico: lastDiagnostico.length > 0,
      diagnosticoCompleted: lastDiagnostico[0]?.completedAt !== null,
      hasFeedback: feedbackGiven.length > 0,
      referralsTotal: referralStats[0]?.total || 0,
      referralsConverted: referralStats[0]?.converted || 0,
      progress: {
        diagnostico: lastDiagnostico.length > 0,
        plano: lastDiagnostico[0]?.planoCorrecao !== null,
        trial: activeTrial.length > 0
      }
    };
  }),

  // ──────────────────────────────────────────
  // ⭐ AÇÃO 1: AVALIAÇÃO INTERNA (FEEDBACK)
  // ──────────────────────────────────────────
  submitFeedback: protectedProcedure
    .input(z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
      diagnosticoId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Verificar se já deu feedback
      const existingFeedback = await db
        .select()
        .from(feedback)
        .where(eq(feedback.userId, userId))
        .limit(1);
      
      if (existingFeedback.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já avaliou a experiência.",
        });
      }
      
      // Salvar feedback
      await db.insert(feedback).values({
        userId,
        diagnosticoId: input.diagnosticoId,
        rating: input.rating,
        comment: input.comment || null,
        trialActivated: 1,
      });
      
      // Ativar trial
      const trial = await activateFreeTrial(userId, "feedback");
      
      return {
        success: true,
        message: "Obrigada pela avaliação! Seu acesso de 30 dias foi ativado.",
        trialExpiresAt: trial.expiresAt,
      };
    }),

  // ──────────────────────────────────────────
  // 🔗 AÇÃO 2: COMPARTILHAMENTO / REFERRAL
  // ──────────────────────────────────────────
  
  // Gerar link de indicação
  getReferralLink: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // Verificar se já tem código
    const existingReferral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1);
    
    let referralCode: string;
    
    if (existingReferral.length > 0) {
      referralCode = existingReferral[0].referralCode;
    } else {
      // Criar novo código
      referralCode = generateReferralCode();
      await db.insert(referrals).values({
        referrerId: userId,
        referralCode,
      });
    }
    
    const referralLink = `${BASE_URL}/diagnostico?ref=${referralCode}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
      `Fiz um diagnóstico gratuito da minha clínica e me surpreendi. Testa aqui: ${referralLink}`
    )}`;
    
    return {
      referralCode,
      referralLink,
      whatsappLink,
    };
  }),
  
  // Registrar compartilhamento
  trackShare: protectedProcedure
    .input(z.object({
      method: z.enum(["whatsapp", "copy", "email"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Atualizar método de compartilhamento
      await db
        .update(referrals)
        .set({ shareMethod: input.method })
        .where(eq(referrals.referrerId, userId));
      
      // Ativar trial
      const trial = await activateFreeTrial(userId, "referral_share");
      
      return {
        success: true,
        message: "Compartilhamento registrado! Seu acesso de 30 dias foi ativado.",
        trialExpiresAt: trial.expiresAt,
      };
    }),
  
  // Registrar clique em link de referral (público)
  trackReferralClick: publicProcedure
    .input(z.object({
      referralCode: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { referralCode } = input;
      
      // Buscar referral
      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);
      
      if (referral.length === 0) {
        return { success: false, message: "Código inválido" };
      }
      
      // Atualizar como clicado
      await db
        .update(referrals)
        .set({
          clicked: 1,
          clickedAt: new Date(),
        })
        .where(eq(referrals.referralCode, referralCode));
      
      return { success: true, referrerId: referral[0].referrerId };
    }),
  
  // Registrar conversão de referral
  trackReferralConversion: publicProcedure
    .input(z.object({
      referralCode: z.string(),
      diagnosticoId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { referralCode, diagnosticoId } = input;
      
      // Buscar referral
      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);
      
      if (referral.length === 0) {
        return { success: false };
      }
      
      // Atualizar como convertido
      await db
        .update(referrals)
        .set({
          converted: 1,
          convertedAt: new Date(),
        })
        .where(eq(referrals.referralCode, referralCode));
      
      // Se o referrer ainda não tem trial por conversão, dar bônus
      if (!referral[0].trialActivated) {
        await activateFreeTrial(referral[0].referrerId, "referral_conversion");
        await db
          .update(referrals)
          .set({ trialActivated: 1 })
          .where(eq(referrals.referralCode, referralCode));
      }
      
      return { success: true };
    }),

  // ──────────────────────────────────────────
  // 🌟 AÇÃO 3: GOOGLE REVIEW (INTENÇÃO)
  // ──────────────────────────────────────────
  trackGoogleReviewIntent: protectedProcedure
    .input(z.object({
      diagnosticoId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Verificar se já registrou intenção
      const existing = await db
        .select()
        .from(googleReviewIntents)
        .where(eq(googleReviewIntents.userId, userId))
        .limit(1);
      
      if (existing.length > 0) {
        // Já registrou, apenas retorna o link
        return {
          success: true,
          googleReviewUrl: GOOGLE_REVIEW_URL,
          message: "Redirecionando para o Google...",
        };
      }
      
      // Registrar intenção
      await db.insert(googleReviewIntents).values({
        userId,
        diagnosticoId: input.diagnosticoId,
        trialActivated: 1,
      });
      
      // Ativar trial
      const trial = await activateFreeTrial(userId, "google_review");
      
      return {
        success: true,
        googleReviewUrl: GOOGLE_REVIEW_URL,
        trialExpiresAt: trial.expiresAt,
        message: "Obrigada! Seu acesso de 30 dias foi ativado.",
      };
    }),

  // ──────────────────────────────────────────
  // 🎁 VERIFICAR TRIAL
  // ──────────────────────────────────────────
  checkTrial: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const trial = await db
      .select()
      .from(freeTrials)
      .where(and(
        eq(freeTrials.userId, userId),
        eq(freeTrials.isActive, 1)
      ))
      .limit(1);
    
    if (trial.length === 0) {
      return {
        hasActiveTrial: false,
        daysRemaining: 0,
      };
    }
    
    const now = new Date();
    const expiresAt = new Date(trial[0].expiresAt);
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se expirou, desativar
    if (daysRemaining <= 0) {
      await db
        .update(freeTrials)
        .set({ isActive: 0 })
        .where(eq(freeTrials.id, trial[0].id));
      
      return {
        hasActiveTrial: false,
        daysRemaining: 0,
      };
    }
    
    return {
      hasActiveTrial: true,
      daysRemaining,
      expiresAt: trial[0].expiresAt,
      activationMethod: trial[0].activationMethod,
    };
  }),

  // ──────────────────────────────────────────
  // 📊 OPÇÕES DE DESBLOQUEIO
  // ──────────────────────────────────────────
  getUnlockOptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // Verificar o que já foi feito
    const [feedbackDone, sharesDone, googleDone] = await Promise.all([
      db.select().from(feedback).where(eq(feedback.userId, userId)).limit(1),
      db.select().from(referrals).where(and(
        eq(referrals.referrerId, userId),
        eq(referrals.trialActivated, 1)
      )).limit(1),
      db.select().from(googleReviewIntents).where(eq(googleReviewIntents.userId, userId)).limit(1),
    ]);
    
    return {
      options: [
        {
          id: "feedback",
          label: "Avaliar a experiência",
          description: "Conte como foi o diagnóstico",
          completed: feedbackDone.length > 0,
          icon: "star",
        },
        {
          id: "share",
          label: "Compartilhar com uma amiga",
          description: "Envie pelo WhatsApp",
          completed: sharesDone.length > 0,
          icon: "share",
        },
        {
          id: "google",
          label: "Avaliar no Google",
          description: "Ajude outras profissionais",
          completed: googleDone.length > 0,
          icon: "google",
        },
      ],
      canUnlock: feedbackDone.length === 0 || sharesDone.length === 0 || googleDone.length === 0,
    };
  }),
});
