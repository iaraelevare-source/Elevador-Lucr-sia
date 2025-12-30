/**
 * 🔒 LGPD Router - Conformidade com Lei Geral de Proteção de Dados
 * Endpoints para exercício dos direitos dos titulares (Art. 18 LGPD)
 */

import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  users, 
  subscription, 
  contentGeneration, 
  leads, 
  agendamentos,
  brandEssence,
  bioRadarDiagnosis,
  calendarioPosts
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Stripe from "stripe";
import { ENV } from "../_core/env";

// Stripe client para cancelamento de assinatura
const stripe = ENV.STRIPE_SECRET_KEY && ENV.STRIPE_SECRET_KEY !== 'sk_test_placeholder'
  ? new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" as const })
  : null;

export const lgpdRouter = router({
  /**
   * 📦 EXPORTAR DADOS (Art. 18, V - Portabilidade)
   * Retorna todos os dados do usuário em formato estruturado
   */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    try {
      // Buscar todos os dados do usuário
      const [userData] = await db.select().from(users).where(eq(users.id, userId));
      const [subscriptionData] = await db.select().from(subscription).where(eq(subscription.userId, userId));
      const [brandData] = await db.select().from(brandEssence).where(eq(brandEssence.userId, userId));
      const contentData = await db.select().from(contentGeneration).where(eq(contentGeneration.userId, userId));
      const leadsData = await db.select().from(leads).where(eq(leads.userId, userId));
      const agendamentosData = await db.select().from(agendamentos).where(eq(agendamentos.userId, userId));
      const bioRadarData = await db.select().from(bioRadarDiagnosis).where(eq(bioRadarDiagnosis.userId, userId));
      const calendarData = await db.select().from(calendarioPosts).where(eq(calendarioPosts.userId, userId));
      
      return {
        exportInfo: {
          requestedAt: new Date().toISOString(),
          format: "JSON",
          version: "1.0",
          lgpdArticle: "Art. 18, V - Portabilidade de dados",
        },
        personalData: {
          id: userData?.id,
          name: userData?.name,
          email: userData?.email,
          loginMethod: userData?.loginMethod,
          createdAt: userData?.createdAt,
          lastSignedIn: userData?.lastSignedIn,
        },
        subscription: subscriptionData ? {
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          creditsRemaining: subscriptionData.creditsRemaining,
          startDate: subscriptionData.startDate,
          renewalDate: subscriptionData.renewalDate,
        } : null,
        brandEssence: brandData ? {
          brandName: brandData.brandName,
          brandDescription: brandData.brandDescription,
          targetAudience: brandData.targetAudience,
          brandValues: brandData.brandValues,
        } : null,
        contentGenerations: contentData.map((c: typeof contentData[number]) => ({
          id: c.id,
          type: c.type,
          title: c.title,
          content: c.content,
          createdAt: c.createdAt,
        })),
        leads: leadsData.map((l: typeof leadsData[number]) => ({
          id: l.id,
          nome: l.nome,
          email: l.email,
          telefone: l.telefone,
          procedimento: l.procedimento,
          status: l.status,
          createdAt: l.createdAt,
        })),
        agendamentos: agendamentosData.map((a: typeof agendamentosData[number]) => ({
          id: a.id,
          clienteNome: a.clienteNome,
          procedimento: a.procedimento,
          data: a.data,
          status: a.status,
        })),
        bioRadarDiagnosis: bioRadarData.map((b: typeof bioRadarData[number]) => ({
          instagramHandle: b.instagramHandle,
          score: b.score,
          createdAt: b.createdAt,
        })),
        calendarPosts: calendarData.map((p: typeof calendarData[number]) => ({
          titulo: p.titulo,
          tipo: p.tipo,
          dataAgendada: p.dataAgendada,
          status: p.status,
        })),
        totalRecords: {
          contentGenerations: contentData.length,
          leads: leadsData.length,
          agendamentos: agendamentosData.length,
          bioRadarDiagnosis: bioRadarData.length,
          calendarPosts: calendarData.length,
        },
      };
    } catch (error) {
      console.error("[LGPD] Erro ao exportar dados:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao exportar dados. Tente novamente.",
      });
    }
  }),

  /**
   * 🗑️ DELETAR CONTA (Art. 18, VI - Eliminação)
   * Anonimiza dados pessoais e cancela assinatura
   */
  deleteAccount: protectedProcedure
    .input(z.object({
      confirmacao: z.literal("DELETAR MINHA CONTA"),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      try {
        // 1. Buscar assinatura para cancelar no Stripe
        const [sub] = await db.select().from(subscription).where(eq(subscription.userId, userId));
        
        if (sub?.stripeSubscriptionId && stripe) {
          try {
            await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
            console.log(`[LGPD] Assinatura Stripe cancelada: ${sub.stripeSubscriptionId}`);
          } catch (stripeError) {
            console.error("[LGPD] Erro ao cancelar Stripe:", stripeError);
            // Continua mesmo se Stripe falhar
          }
        }

        // 2. Anonimizar dados do usuário (soft delete - LGPD recomenda)
        const anonymizedEmail = `deleted-${userId}-${Date.now()}@anonimizado.lgpd`;
        
        await db.update(users)
          .set({
            name: "Usuário Removido",
            email: anonymizedEmail,
            openId: `deleted-${userId}-${Date.now()}`,
          })
          .where(eq(users.id, userId));

        // 3. Atualizar assinatura para cancelada
        if (sub) {
          await db.update(subscription)
            .set({
              status: "cancelled",
              cancelledAt: new Date(),
            })
            .where(eq(subscription.userId, userId));
        }

        // 4. Anonimizar leads (manter para estatísticas agregadas)
        await db.update(leads)
          .set({
            nome: "Lead Anonimizado",
            email: null,
            telefone: null,
            observacoes: null,
          })
          .where(eq(leads.userId, userId));

        // 5. Remover dados sensíveis de agendamentos
        await db.update(agendamentos)
          .set({
            clienteNome: "Cliente Anonimizado",
            observacoes: null,
          })
          .where(eq(agendamentos.userId, userId));

        console.log(`[LGPD] Conta deletada: userId=${userId}`);
        
        return { 
          success: true, 
          message: "Conta deletada conforme LGPD Art. 18, VI",
          deletedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[LGPD] Erro ao deletar conta:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar exclusão. Entre em contato com suporte.",
        });
      }
    }),

  /**
   * 📋 REVOGAR CONSENTIMENTO (Art. 18, IX)
   * Marca que usuário revogou consentimento para processamento
   */
  revokeConsent: protectedProcedure.mutation(async ({ ctx }) => {
    // Por ora, revogar consentimento = deletar conta
    // Em implementação completa, poderia ter granularidade
    return {
      success: true,
      message: "Para revogar consentimento completamente, utilize a opção de deletar conta.",
      deleteAccountUrl: "/settings/delete-account",
    };
  }),

  /**
   * 📊 INFORMAÇÕES DE PRIVACIDADE
   * Retorna informações sobre coleta e uso de dados
   */
  getPrivacyInfo: protectedProcedure.query(async ({ ctx }) => {
    return {
      dataCollected: [
        { type: "Dados de Identificação", examples: "Nome, email", purpose: "Autenticação e comunicação" },
        { type: "Dados de Uso", examples: "Conteúdos gerados, leads cadastrados", purpose: "Prestação do serviço" },
        { type: "Dados de Pagamento", examples: "ID Stripe (não armazenamos cartão)", purpose: "Processamento de pagamentos" },
      ],
      dataSharing: [
        { partner: "Stripe", purpose: "Processamento de pagamentos", dataShared: "Email, ID cliente" },
        { partner: "OpenAI/Anthropic", purpose: "Geração de conteúdo IA", dataShared: "Prompts (sem dados pessoais)" },
        { partner: "Manus OAuth", purpose: "Autenticação", dataShared: "Token de sessão" },
      ],
      retentionPeriod: "Dados mantidos enquanto conta ativa. Após exclusão, anonimizados em 30 dias.",
      rights: [
        "Acessar seus dados (Art. 18, II)",
        "Corrigir dados incompletos (Art. 18, III)",
        "Solicitar anonimização (Art. 18, IV)",
        "Portabilidade dos dados (Art. 18, V)",
        "Eliminação de dados (Art. 18, VI)",
        "Revogar consentimento (Art. 18, IX)",
      ],
      dpoContact: "privacidade@elevare.com.br",
      lastUpdated: "2025-12-25",
    };
  }),
});
