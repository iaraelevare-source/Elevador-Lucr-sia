import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { users, subscription, diagnosticos, feedback, freeTrials, referrals, contentGeneration } from "../../drizzle/schema";
import { eq, desc, gte, sql, and, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { logger } from "../adapters/loggingAdapter";

// ============================================
// 🔒 ADMIN MIDDLEWARE
// ============================================
const adminOnly = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  return next({ ctx: { ...ctx, admin: ctx.user } });
});

// Helper para logs de admin
async function logAdminAction(adminId: number, action: string, details: string) {
  logger.info(`[ADMIN] ${action}`, { adminId, details });
}

// ============================================
// 🎛️ ADMIN ROUTER
// ============================================
export const adminRouter = router({
  // ==========================================
  // 📊 DASHBOARD STATS
  // ==========================================
  getStats: adminOnly.query(async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total de usuários
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Usuários novos (última semana)
    const [newUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, weekAgo));

    // Assinantes ativos
    const [activeSubsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscription)
      .where(eq(subscription.status, "active"));

    // Assinantes pagos (não free)
    const [paidSubsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          sql`${subscription.plan} != 'free'`
        )
      );

    // Diagnósticos totais
    const [diagnosticsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(diagnosticos);

    // Diagnósticos último mês
    const [diagnosticsMonthResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(diagnosticos)
      .where(gte(diagnosticos.createdAt, monthAgo));

    // MRR estimado (baseado em planos)
    const planPrices: Record<string, number> = {
      essencial: 5700,      // R$ 57
      profissional: 9700,   // R$ 97
    };

    const subscriptionsData = await db
      .select({ plan: subscription.plan })
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          sql`${subscription.plan} != 'free'`
        )
      );

    const mrr = subscriptionsData.reduce((acc: number, sub: { plan: string }) => {
      return acc + (planPrices[sub.plan] || 0);
    }, 0);

    // Média de avaliações
    const [avgRatingResult] = await db
      .select({ avg: sql<number>`COALESCE(AVG(${feedback.rating}), 0)` })
      .from(feedback);

    return {
      totalUsers: totalUsersResult.count,
      newUsersThisWeek: newUsersResult.count,
      activeSubscriptions: activeSubsResult.count,
      paidSubscriptions: paidSubsResult.count,
      totalDiagnostics: diagnosticsResult.count,
      diagnosticsThisMonth: diagnosticsMonthResult.count,
      mrr: mrr / 100, // Converter para reais
      avgRating: Math.round(avgRatingResult.avg * 10) / 10,
    };
  }),

  // ==========================================
  // 👥 USERS LIST
  // ==========================================
  getUsers: adminOnly
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        plan: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          subscription: {
            plan: subscription.plan,
            status: subscription.status,
            creditsRemaining: subscription.creditsRemaining,
          },
        })
        .from(users)
        .leftJoin(subscription, eq(users.id, subscription.userId))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const usersData = await query;

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      return {
        users: usersData,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
        currentPage: page,
      };
    }),

  // ==========================================
  // 🔄 USER ACTIONS
  // ==========================================
  updateUserRole: adminOnly
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, role } = input;

      await db.update(users).set({ role }).where(eq(users.id, userId));

      await logAdminAction(
        ctx.admin.id,
        "UPDATE_USER_ROLE",
        `User ${userId} role changed to ${role}`
      );

      return { success: true };
    }),

  updateUserPlan: adminOnly
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "essencial", "profissional"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, plan } = input;

      const planCredits: Record<string, number> = {
        free: 10,
        essencial: 100,
        profissional: -1, // ilimitado
      };

      await db
        .update(subscription)
        .set({
          plan,
          status: "active",
          creditsRemaining: planCredits[plan],
          monthlyCreditsLimit: planCredits[plan],
        })
        .where(eq(subscription.userId, userId));

      await logAdminAction(
        ctx.admin.id,
        "UPDATE_USER_PLAN",
        `User ${userId} plan changed to ${plan}`
      );

      return { success: true };
    }),

  addCredits: adminOnly
    .input(
      z.object({
        userId: z.number(),
        credits: z.number().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, credits } = input;

      await db
        .update(subscription)
        .set({
          creditsRemaining: sql`${subscription.creditsRemaining} + ${credits}`,
        })
        .where(eq(subscription.userId, userId));

      await logAdminAction(
        ctx.admin.id,
        "ADD_CREDITS",
        `Added ${credits} credits to user ${userId}`
      );

      return { success: true };
    }),

  deleteUser: adminOnly
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      // Não permitir deletar a si mesmo
      if (userId === ctx.admin.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode deletar sua própria conta",
        });
      }

      await db.delete(users).where(eq(users.id, userId));

      await logAdminAction(
        ctx.admin.id,
        "DELETE_USER",
        `Deleted user ${userId}`
      );

      return { success: true };
    }),

  // ==========================================
  // 📊 ANALYTICS
  // ==========================================
  getAnalytics: adminOnly.query(async () => {
    // Últimos 30 dias de cadastros
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Cadastros por dia
    const signupsPerDay = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Diagnósticos por dia
    const diagnosticsPerDay = await db
      .select({
        date: sql<string>`DATE(${diagnosticos.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(diagnosticos)
      .where(gte(diagnosticos.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${diagnosticos.createdAt})`)
      .orderBy(sql`DATE(${diagnosticos.createdAt})`);

    // Distribuição de planos
    const planDistribution = await db
      .select({
        plan: subscription.plan,
        count: sql<number>`count(*)`,
      })
      .from(subscription)
      .groupBy(subscription.plan);

    // Top gerações de conteúdo
    const contentTypes = await db
      .select({
        type: contentGeneration.type,
        count: sql<number>`count(*)`,
      })
      .from(contentGeneration)
      .groupBy(contentGeneration.type)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    return {
      signupsPerDay,
      diagnosticsPerDay,
      planDistribution,
      contentTypes,
    };
  }),

  // ==========================================
  // 🎁 TRIALS & REFERRALS
  // ==========================================
  getTrials: adminOnly.query(async () => {
    const trials = await db
      .select({
        id: freeTrials.id,
        userId: freeTrials.userId,
        activationMethod: freeTrials.activationMethod,
        activatedAt: freeTrials.activatedAt,
        expiresAt: freeTrials.expiresAt,
        isActive: freeTrials.isActive,
        userName: users.name,
        userEmail: users.email,
      })
      .from(freeTrials)
      .leftJoin(users, eq(freeTrials.userId, users.id))
      .orderBy(desc(freeTrials.activatedAt))
      .limit(50);

    return trials;
  }),

  getReferrals: adminOnly.query(async () => {
    const refs = await db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        referralCode: referrals.referralCode,
        clicked: referrals.clicked,
        converted: referrals.converted,
        shareMethod: referrals.shareMethod,
        createdAt: referrals.createdAt,
        referrerName: users.name,
        referrerEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .orderBy(desc(referrals.createdAt))
      .limit(50);

    return refs;
  }),
});
