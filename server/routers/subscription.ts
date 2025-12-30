import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { subscription as subscriptionTable, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { env } from "../_core/env";

// Inicializar Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

// Definição dos planos - Atualizado 21/12/2024
export const PLANS = {
  free: {
    id: "free" as const,
    name: "Plano Gratuito",
    price: 0,
    priceId: "",
    credits: 1,
    features: [
      "1 crédito por mês",
      "Acesso ao Radar de Bio",
    ],
  },
  essencial: {
    id: "essencial" as const,
    name: "Plano Essencial",
    price: 57,
    priceId: env.STRIPE_ESSENCIAL_PRICE_ID || "",
    credits: 5,
    features: [
      "Acesso ao Radar de Bio",
      "5 créditos por mês",
      "Gerador de Prompts",
      "Suporte por e-mail",
    ],
  },
  profissional: {
    id: "profissional" as const,
    name: "Plano Profissional",
    price: 97,
    priceId: env.STRIPE_PROFISSIONAL_PRICE_ID || "",
    credits: -1, // Ilimitado
    features: [
      "Créditos ilimitados",
      "Tudo do Plano Essencial",
      "Gerador de E-books",
      "Gerador de Anúncios",
      "Automação de Blogs (SEO)",
      "Área de Membros Exclusiva",
      "Suporte VIP prioritário",
    ],
  },
} as const;

export const subscriptionRouter = router({
  // Listar planos disponíveis
  getPlans: publicProcedure.query(() => {
    return Object.values(PLANS);
  }),

  // Obter assinatura do usuário
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, ctx.user.id))
      .limit(1);

    if (!userSubscription) {
      // Criar assinatura gratuita padrão
      const [newSubscription] = await db
        .insert(subscriptionTable)
        .values({
          userId: ctx.user.id,
          plan: "free",
          status: "active",
          creditsRemaining: PLANS.free.credits,
          monthlyCreditsLimit: PLANS.free.credits,
        })
        .$returningId();

      const [created] = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.id, newSubscription.id))
        .limit(1);

      return created;
    }

    return userSubscription;
  }),

  // Criar sessão de checkout do Stripe
  createCheckout: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["essencial", "profissional"]),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const planConfig = PLANS[input.plan];

      if (!planConfig.priceId) {
        throw new Error("Price ID não configurado para este plano");
      }

      // Verificar se já tem assinatura ativa
      const [existingSubscription] = await db
        .select()
        .from(subscriptionTable)
        .where(
          and(
            eq(subscriptionTable.userId, ctx.user.id),
            eq(subscriptionTable.status, "active")
          )
        )
        .limit(1);

      // Criar ou obter customer do Stripe
      let customerId = existingSubscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;
      }

      // Criar sessão de checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: planConfig.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          userId: ctx.user.id.toString(),
          plan: input.plan,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Cancelar assinatura
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(
        and(
          eq(subscriptionTable.userId, ctx.user.id),
          eq(subscriptionTable.status, "active")
        )
      )
      .limit(1);

    if (!userSubscription) {
      throw new Error("Nenhuma assinatura ativa encontrada");
    }

    if (userSubscription.plan === "free") {
      throw new Error("Não é possível cancelar o plano gratuito");
    }

    // Cancelar no Stripe
    if (userSubscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);
    }

    // Atualizar no banco
    await db
      .update(subscriptionTable)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(subscriptionTable.id, userSubscription.id));

    return {
      success: true,
      message: "Assinatura cancelada com sucesso",
    };
  }),

  // Atualizar créditos (uso interno)
  updateCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        operation: z.enum(["add", "subtract"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [userSubscription] = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.userId, ctx.user.id))
        .limit(1);

      if (!userSubscription) {
        throw new Error("Assinatura não encontrada");
      }

      // Se for Profissional, créditos são ilimitados
      if (userSubscription.plan === "profissional") {
        return {
          success: true,
          creditsRemaining: -1,
          message: "Plano Profissional tem créditos ilimitados",
        };
      }

      const currentCredits = userSubscription.creditsRemaining;
      const newCredits =
        input.operation === "add"
          ? currentCredits + input.amount
          : currentCredits - input.amount;

      if (newCredits < 0) {
        throw new Error("Créditos insuficientes");
      }

      await db
        .update(subscriptionTable)
        .set({
          creditsRemaining: newCredits,
        })
        .where(eq(subscriptionTable.id, userSubscription.id));

      return {
        success: true,
        creditsRemaining: newCredits,
      };
    }),

  // Verificar se tem créditos suficientes
  checkCredits: protectedProcedure
    .input(
      z.object({
        required: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const [userSubscription] = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.userId, ctx.user.id))
        .limit(1);

      if (!userSubscription) {
        return {
          hasCredits: false,
          creditsRemaining: 0,
          plan: "free",
        };
      }

      // Profissional tem créditos ilimitados
      if (userSubscription.plan === "profissional") {
        return {
          hasCredits: true,
          creditsRemaining: -1,
          plan: userSubscription.plan,
        };
      }

      const hasCredits = userSubscription.creditsRemaining >= input.required;

      return {
        hasCredits,
        creditsRemaining: userSubscription.creditsRemaining,
        plan: userSubscription.plan,
      };
    }),

  // Portal do cliente (gerenciar assinatura)
  createPortalSession: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [userSubscription] = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.userId, ctx.user.id))
        .limit(1);

      if (!userSubscription?.stripeCustomerId) {
        throw new Error("Customer ID não encontrado");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return {
        url: session.url,
      };
    }),
});
