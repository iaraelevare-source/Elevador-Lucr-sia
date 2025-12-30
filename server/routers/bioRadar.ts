import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { bioRadarDiagnosis, leads } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { llm } from "../_core/llm";
import { logger } from "../adapters/loggingAdapter";
import { AIServiceError, RateLimitError, AuthorizationError } from "../_core/errors";
import { safeParse, assertOwnership } from "../../shared/_core/utils";
import { consumeCredits, checkCredits } from "../_core/credits";
import { checkFreeBioRadarLimit } from "../_core/rateLimiter";

// 🔴 Rate limiting por IP para análises gratuitas
// Agora centralizado em _core/rateLimiter.ts

export const bioRadarRouter = router({
  // Analisar bio do Instagram
  analyze: publicProcedure
    .input(
      z.object({
        instagramHandle: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      
      // BUG-004: Rate limiting para usuários não autenticados
      const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
      if (!ctx.user && !checkFreeBioRadarLimit(clientIp)) {
        throw new RateLimitError(
          'Limite de análises gratuitas atingido. Faça login ou aguarde 1 hora para continuar.'
        );
      }

      // Prompt para análise da bio - COM NEUROVENDAS
      const prompt = `Você é um consultor especialista em neurovendas para clínicas de estética.

Analise o perfil do Instagram @${input.instagramHandle} como se fosse uma consultoria REAL e PAGA.

Simule uma análise profissional identificando:

1. **DIAGNÓSTICO COMPORTAMENTAL** (Gatilhos mentais faltando):
   - Escassez: A bio cria senso de urgência?
   - Autoridade: Mostra credenciais, experiência, resultados?
   - Prova Social: Tem depoimentos, números, cases?
   - Reciprocidade: Oferece algo de valor antes de vender?

2. **ANÁLISE DE CONVERSÃO**:
   - Headline prende atenção nos primeiros 3 segundos?
   - Call-to-action está claro e irresistível?
   - Link na bio está otimizado para conversão?
   - Bio reflete a jornada emocional da cliente ideal?

3. **OPORTUNIDADES PERDIDAS** (3 erros GRAVES que travam vendas):
   - O que está fazendo a clínica PERDER agendamentos agora?
   - Qual elemento está afastando clientes prontas para pagar?
   - Que gatilho mental crítico está ausente?

Forneça a análise no seguinte formato JSON:
{
  "score": <número de 0 a 100 (seja crítico e realista)>,
  "strengths": [<2-3 pontos fortes específicos>],
  "weaknesses": [<3-4 pontos fracos GRAVES que bloqueiam vendas>],
  "recommendations": [<5-7 recomendações ACIONÁVEIS com impacto direto em conversão>],
  "nextSteps": "<Plano de ação de 30 dias com prioridades claras. Termine com: 'Quer implementar isso com um plano personalizado completo? Nossos especialistas podem criar uma estratégia de neurovendas 100% customizada para sua clínica.'>"
}

Seja DIRETO, ESPECÍFICO e focado em VENDAS REAIS. Use linguagem de consultoria premium.

`;

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista em marketing digital para clínicas de estética. Responda sempre em JSON válido.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        
        // BUG-008: Validação robusta da resposta da IA
        if (!content) {
          logger.error('IA retornou resposta vazia', { response });
          throw new AIServiceError(
            'O serviço de IA não retornou uma resposta válida. Tente novamente em alguns instantes.'
          );
        }

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        let analysis;
        
        try {
          analysis = JSON.parse(contentStr);
        } catch (parseError) {
          logger.error('Erro ao parsear resposta da IA', { content: contentStr, parseError });
          throw new AIServiceError('Resposta da IA está em formato incorreto.');
        }
        
        // Validar estrutura esperada
        if (!analysis.score || !analysis.recommendations) {
          logger.error('IA retornou estrutura inválida', { analysis });
          throw new AIServiceError('Resposta da IA está incompleta.');
        }

        // Salvar diagnóstico no banco
        const [savedDiagnosis] = await db
          .insert(bioRadarDiagnosis)
          .values({
            userId: userId || null,
            instagramHandle: input.instagramHandle,
            bioAnalysis: JSON.stringify(analysis),
            recommendations: JSON.stringify(analysis.recommendations),
            score: analysis.score,
          })
          .$returningId();

        // 💳 Consumir créditos após análise bem-sucedida (apenas para usuários autenticados)
        if (userId) {
          await consumeCredits(userId, 'bio_analysis', `Análise: @${input.instagramHandle}`);
        }

        logger.info('Bio analysis completed', { 
          diagnosisId: savedDiagnosis.id, 
          instagramHandle: input.instagramHandle,
          userId 
        });

        return {
          diagnosisId: savedDiagnosis.id,
          ...analysis,
        };
      } catch (error) {
        // BUG-008: Tratamento de erros apropriado
        if (error instanceof AIServiceError || error instanceof RateLimitError) {
          throw error;
        }
        
        logger.error('Erro ao analisar bio', {
          error: error instanceof Error ? error.message : String(error),
          instagramHandle: input.instagramHandle,
          userId,
        });
        
        throw new AIServiceError(
          'Não foi possível completar a análise. Por favor, tente novamente.',
          error
        );
      }
    }),

  // Salvar lead (email/WhatsApp) - COMPLETO
  saveLead: publicProcedure
    .input(
      z.object({
        diagnosisId: z.number(),
        email: z.string().email().optional(),
        whatsapp: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.email && !input.whatsapp) {
        throw new Error("Forneça pelo menos email ou WhatsApp");
      }

      // 1. Atualizar diagnóstico com dados de contato
      await db
        .update(bioRadarDiagnosis)
        .set({
          leadEmail: input.email || null,
          leadWhatsapp: input.whatsapp || null,
        })
        .where(eq(bioRadarDiagnosis.id, input.diagnosisId));

      // 2. Buscar diagnóstico atualizado para criar lead
      const [diagnosis] = await db
        .select()
        .from(bioRadarDiagnosis)
        .where(eq(bioRadarDiagnosis.id, input.diagnosisId))
        .limit(1);

      if (!diagnosis) {
        throw new Error("Diagnóstico não encontrado");
      }

      // 3. Criar lead na tabela leads (se tiver userId associado)
      if (diagnosis.userId) {
        const leadData = {
          userId: diagnosis.userId,
          nome: input.email?.split('@')[0] || 'Lead via Radar Bio',
          email: input.email || null,
          telefone: input.whatsapp || null,
          procedimento: 'Análise Bio Instagram',
          origem: 'radar_bio' as const,
          temperatura: 'quente' as const, // Lead que deixou contato = quente
          status: 'novo' as const,
          observacoes: `Score: ${diagnosis.score}/100. Instagram: @${diagnosis.instagramHandle}`,
          ultimoContato: new Date(),
        };

        await db.insert(leads).values(leadData);
        
        logger.info('Lead created in CRM', { 
          diagnosisId: input.diagnosisId,
          email: input.email,
          userId: diagnosis.userId 
        });

        // 4. TODO: Enviar email de boas-vindas
        // await sendEmail({
        //   to: input.email,
        //   template: 'welcome',
        //   data: { nome: leadData.nome }
        // });
      }

      logger.info('Lead captured', { 
        diagnosisId: input.diagnosisId,
        hasEmail: !!input.email,
        hasWhatsapp: !!input.whatsapp
      });

      return {
        success: true,
        message: "Obrigado! Em breve entraremos em contato com insights exclusivos para sua clínica.",
      };
    }),

  // Obter diagnóstico
  getDiagnosis: protectedProcedure
    .input(
      z.object({
        diagnosisId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [diagnosis] = await db
        .select()
        .from(bioRadarDiagnosis)
        .where(eq(bioRadarDiagnosis.id, input.diagnosisId))
        .limit(1);

      if (!diagnosis) {
        throw new Error("Diagnóstico não encontrado");
      }

      // BUG-011: Usar função utilitária para verificação de ownership
      assertOwnership(diagnosis, ctx.user.id, "Você não tem permissão para acessar este diagnóstico");

      return {
        ...diagnosis,
        // BUG-011: Usar safeParse
        bioAnalysis: safeParse(diagnosis.bioAnalysis),
        recommendations: safeParse(diagnosis.recommendations),
      };
    }),

  // Listar diagnósticos do usuário
  listDiagnoses: protectedProcedure.query(async ({ ctx }) => {
    const diagnoses = await db
      .select()
      .from(bioRadarDiagnosis)
      .where(eq(bioRadarDiagnosis.userId, ctx.user.id))
      .orderBy(bioRadarDiagnosis.createdAt);

    // BUG-011: Usar safeParse
    return diagnoses.map((d: typeof diagnoses[0]) => ({
      ...d,
      bioAnalysis: safeParse(d.bioAnalysis),
      recommendations: safeParse(d.recommendations),
    }));
  }),
});
