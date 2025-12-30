import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { llm } from "../_core/llm";
import { logger } from "../adapters/loggingAdapter";
import { AIServiceError, RateLimitError } from "../_core/errors";
import { db } from "../db";
import { diagnosticos, freeTrials, feedback, referrals } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================
// RATE LIMITING
// ============================================
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = ipRateLimit.get(ip);
  
  if (!limit || now > limit.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  
  if (limit.count >= 10) return false;
  limit.count++;
  return true;
}

// ============================================
// CLASSIFICAÇÃO AUTOMÁTICA DE PERFIL
// ============================================
type Perfil = {
  nivel: "desbravadora" | "estrategista" | "rainha";
  total: number;
  pontoFraco: { nome: string; label: string; score: number };
  behaviorScore: number;
};

function classificarPerfil(
  scores: { consciencia: number; financeiro: number; posicionamento: number },
  metadata?: { completedLevel3?: boolean; repeatDiagnosis?: boolean; abandonedFlow?: boolean }
): Perfil {
  const total = scores.consciencia + scores.financeiro + scores.posicionamento;
  
  let nivel: "desbravadora" | "estrategista" | "rainha";
  if (total <= 15) nivel = "desbravadora";
  else if (total <= 21) nivel = "estrategista";
  else nivel = "rainha";

  // Identificar ponto fraco
  const areas = [
    { nome: "consciencia", label: "consciência empreendedora", score: scores.consciencia },
    { nome: "financeiro", label: "gestão financeira", score: scores.financeiro },
    { nome: "posicionamento", label: "posicionamento digital", score: scores.posicionamento },
  ];
  const pontoFraco = areas.reduce((a, b) => a.score < b.score ? a : b);

  // Calcular behavior score
  let behaviorScore = total;
  if (metadata?.completedLevel3) behaviorScore += 3;
  if (metadata?.repeatDiagnosis) behaviorScore += 2;
  if (metadata?.abandonedFlow) behaviorScore -= 1;

  return { nivel, total, pontoFraco, behaviorScore };
}

function determinarEstagioPipeline(nivel: string, temTrial: boolean): string {
  if (temTrial) return "TRIAL";
  if (nivel === "rainha") return "PROPOSTA";
  if (nivel === "estrategista") return "DIAGNOSTICO";
  return "CONSCIENCIA";
}

// ============================================
// PROMPTS DE IA DINÂMICOS
// ============================================
function gerarPromptDiagnostico(
  scores: { consciencia: number; financeiro: number; posicionamento: number },
  answers: Record<string, number>,
  perfil: Perfil
) {
  return `Você é a LucresIA, mentora executiva de clínicas de estética de alto padrão.
Você não usa gírias de marketing digital. Você usa linguagem de negócios e neurociência.
Tom: Firme, respeitoso, empresarial. Sem motivação barata.

PERFIL DA PROFISSIONAL:
- Nível: ${perfil.nivel.toUpperCase()}
- Score Total: ${perfil.total}/27
- Consciência Empreendedora: ${scores.consciencia}/9
- Gestão Financeira: ${scores.financeiro}/9
- Posicionamento Digital: ${scores.posicionamento}/9
- Ponto Fraco Principal: ${perfil.pontoFraco.label}

RESPOSTAS DETALHADAS:
${JSON.stringify(answers, null, 2)}

OBJETIVO:
1. Identificar o principal gargalo (não seja genérica, use os dados)
2. Explicar por que ela está sobrecarregada ou travada
3. Indicar o próximo passo sem vender diretamente

ESTRUTURA DA RESPOSTA:

**Seu Momento Atual**
[2-3 frases diretas sobre onde ela está. Use os dados.]

**O Ponto Invisível**
[O gargalo que ela não está vendo. Seja específica baseada no ponto fraco.]

**O Impacto Real**
[O que isso está custando para ela em dinheiro, tempo ou sanidade.]

**Próximo Passo**
[UMA ação clara para os próximos 7 dias. Não seja vaga.]

Não use emojis.
Máximo 250 palavras.
Isso não é coaching motivacional. É diagnóstico empresarial.`;
}

function gerarPromptComparativo(diagnosticoAnterior: string, diagnosticoAtual: string) {
  return `Você é a LucresIA, mentora executiva de clínicas de estética.

Compare os dois diagnósticos abaixo da mesma profissional.

DIAGNÓSTICO ANTERIOR:
${diagnosticoAnterior}

DIAGNÓSTICO ATUAL:
${diagnosticoAtual}

Analise:
1. Se houve evolução mental ou apenas mudança de discurso
2. Quais gargalos persistem
3. Se o ritmo de evolução é compatível com crescimento saudável

Gere uma análise direta, sem elogios fáceis.
Tom executivo e estratégico.
Máximo 200 palavras.
Sem emojis.`;
}

// ============================================
// ROUTER PRINCIPAL
// ============================================
export const quizRouter = router({
  
  // ========================================
  // SUBMETER QUIZ COMPLETO
  // ========================================
  submit: publicProcedure
    .input(z.object({
      answers: z.record(z.string(), z.number()),
      scores: z.object({
        consciencia: z.number(),
        financeiro: z.number(),
        posicionamento: z.number(),
      }),
      visitorId: z.string().optional(),
      referralCode: z.string().optional(),
      metadata: z.object({
        timeToComplete: z.number().optional(),
        repeatDiagnosis: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      // Classificar perfil com metadata comportamental
      const perfil = classificarPerfil(input.scores, {
        repeatDiagnosis: input.metadata?.repeatDiagnosis,
      });
      
      // Buscar referral se existir
      let referredBy: number | null = null;
      if (input.referralCode) {
        const [ref] = await db.select()
          .from(referrals)
          .where(eq(referrals.referralCode, input.referralCode))
          .limit(1);
        
        if (ref) {
          referredBy = ref.referrerId;
          // Marcar como convertido
          await db.update(referrals)
            .set({ converted: 1, convertedAt: new Date() })
            .where(eq(referrals.referralCode, input.referralCode));
        }
      }

      // Salvar diagnóstico no banco
      const result = await db.insert(diagnosticos).values({
        visitorId: input.visitorId || `anon_${Date.now()}`,
        conscienciaScore: input.scores.consciencia,
        financeiroScore: input.scores.financeiro,
        bioScore: input.scores.posicionamento,
        conscienciaNivel: perfil.nivel,
        financeiroNivel: perfil.pontoFraco.nome === "financeiro" ? "atencao" : "ok",
        bioNivel: perfil.pontoFraco.nome === "posicionamento" ? "atencao" : "ok",
        conscienciaAnalysis: JSON.stringify(input.answers),
        referredBy,
        referralCode: input.referralCode,
        completedAt: new Date(),
      });

      const insertId = (result as any)[0]?.insertId || Date.now();

      logger.info('Quiz submetido', { 
        nivel: perfil.nivel, 
        total: perfil.total,
        pontoFraco: perfil.pontoFraco.nome,
        behaviorScore: perfil.behaviorScore,
      });

      return {
        diagnosticoId: insertId,
        nivel: perfil.nivel,
        total: perfil.total,
        pontoFraco: perfil.pontoFraco,
        behaviorScore: perfil.behaviorScore,
        estagioPipeline: determinarEstagioPipeline(perfil.nivel, false),
      };
    }),

  // ========================================
  // GERAR DIAGNÓSTICO COM IA
  // ========================================
  gerarDiagnosticoIA: publicProcedure
    .input(z.object({
      answers: z.record(z.string(), z.number()),
      scores: z.object({
        consciencia: z.number(),
        financeiro: z.number(),
        posicionamento: z.number(),
      }),
      diagnosticoId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        throw new RateLimitError('Limite atingido. Aguarde 1 hora.');
      }

      const perfil = classificarPerfil(input.scores);
      const prompt = gerarPromptDiagnostico(input.scores, input.answers, perfil);

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é a LucresIA. Responda em texto formatado. Sem emojis. Tom de CEO.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new AIServiceError('Resposta vazia da IA.');

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

        // Atualizar diagnóstico no banco se existir
        if (input.diagnosticoId) {
          await db.update(diagnosticos)
            .set({ planoCorrecao: contentStr })
            .where(eq(diagnosticos.id, input.diagnosticoId));
        }

        logger.info('Diagnóstico IA gerado', { nivel: perfil.nivel });

        return { 
          diagnostico: contentStr,
          nivel: perfil.nivel,
          pontoFraco: perfil.pontoFraco,
        };
      } catch (error) {
        logger.error('Erro diagnóstico IA', { error });
        if (error instanceof AIServiceError || error instanceof RateLimitError) throw error;
        throw new AIServiceError('Não foi possível gerar o diagnóstico.');
      }
    }),

  // ========================================
  // COMPARAR EVOLUÇÃO (MENTORIA SILENCIOSA)
  // ========================================
  compararEvolucao: protectedProcedure
    .input(z.object({
      visitorId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        throw new RateLimitError('Limite atingido. Aguarde 1 hora.');
      }

      // Buscar últimos 2 diagnósticos do visitor
      const ultimos = await db.select()
        .from(diagnosticos)
        .where(eq(diagnosticos.visitorId, input.visitorId))
        .orderBy(desc(diagnosticos.createdAt))
        .limit(2);

      if (ultimos.length < 2) {
        return { 
          hasComparison: false,
          message: "Ainda não há diagnósticos suficientes para comparação.",
        };
      }

      const [atual, anterior] = ultimos;
      
      if (!atual.planoCorrecao || !anterior.planoCorrecao) {
        return {
          hasComparison: false,
          message: "Diagnósticos incompletos para comparação.",
        };
      }

      const prompt = gerarPromptComparativo(anterior.planoCorrecao, atual.planoCorrecao);

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é a LucresIA. Analise evolução com tom executivo. Sem emojis.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new AIServiceError('Resposta vazia da IA.');

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

        // Calcular evolução numérica
        const scoreAnterior = (anterior.conscienciaScore || 0) + (anterior.financeiroScore || 0) + (anterior.bioScore || 0);
        const scoreAtual = (atual.conscienciaScore || 0) + (atual.financeiroScore || 0) + (atual.bioScore || 0);
        const evolucao = scoreAtual - scoreAnterior;

        return {
          hasComparison: true,
          analise: contentStr,
          scoreAnterior,
          scoreAtual,
          evolucao,
          nivelAnterior: anterior.conscienciaNivel,
          nivelAtual: atual.conscienciaNivel,
        };
      } catch (error) {
        logger.error('Erro comparação evolução', { error });
        throw new AIServiceError('Não foi possível gerar a comparação.');
      }
    }),

  // ========================================
  // DASHBOARD KPIs (EXECUTIVO)
  // ========================================
  dashboardKPIs: protectedProcedure
    .query(async ({ ctx }) => {
      // Buscar todos os diagnósticos
      const todos = await db.select().from(diagnosticos);
      
      // Calcular KPIs
      const total = todos.length;
      
      type DiagnosticoRow = typeof todos[number];
      
      const porNivel = {
        desbravadora: todos.filter((d: DiagnosticoRow) => d.conscienciaNivel === "desbravadora").length,
        estrategista: todos.filter((d: DiagnosticoRow) => d.conscienciaNivel === "estrategista").length,
        rainha: todos.filter((d: DiagnosticoRow) => d.conscienciaNivel === "rainha").length,
      };

      // Score médio
      const scores = todos.map((d: DiagnosticoRow) => 
        (d.conscienciaScore || 0) + (d.financeiroScore || 0) + (d.bioScore || 0)
      );
      const scoreMedio = scores.length > 0 
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length 
        : 0;

      // Gargalos mais comuns
      const gargalos = {
        consciencia: todos.filter((d: DiagnosticoRow) => d.conscienciaNivel === "atencao" || 
          (d.conscienciaScore && d.conscienciaScore <= 5)).length,
        financeiro: todos.filter((d: DiagnosticoRow) => d.financeiroNivel === "atencao" ||
          (d.financeiroScore && d.financeiroScore <= 5)).length,
        posicionamento: todos.filter((d: DiagnosticoRow) => d.bioNivel === "atencao" ||
          (d.bioScore && d.bioScore <= 5)).length,
      };

      // Trials ativos
      const trialsAtivos = await db.select()
        .from(freeTrials)
        .where(eq(freeTrials.isActive, 1));

      // Feedbacks
      const feedbacks = await db.select().from(feedback);
      type FeedbackRow = typeof feedbacks[number];
      const mediaRating = feedbacks.length > 0
        ? feedbacks.reduce((a: number, b: FeedbackRow) => a + b.rating, 0) / feedbacks.length
        : 0;

      // Conversões via referral
      const referralsConvertidos = await db.select()
        .from(referrals)
        .where(eq(referrals.converted, 1));

      return {
        totalDiagnosticos: total,
        scoreMedio: Math.round(scoreMedio * 10) / 10,
        distribuicaoPorNivel: porNivel,
        gargalosPrincipais: gargalos,
        trialsAtivos: trialsAtivos.length,
        mediaRating: Math.round(mediaRating * 10) / 10,
        conversoesPorReferral: referralsConvertidos.length,
        ultimosDiagnosticos: todos.slice(-5).reverse().map((d: DiagnosticoRow) => ({
          id: d.id,
          nivel: d.conscienciaNivel,
          score: (d.conscienciaScore || 0) + (d.financeiroScore || 0) + (d.bioScore || 0),
          data: d.createdAt,
        })),
      };
    }),

  // ========================================
  // BUSCAR DIAGNÓSTICO ANTERIOR (RETOMADA)
  // ========================================
  buscarDiagnostico: publicProcedure
    .input(z.object({
      visitorId: z.string(),
    }))
    .query(async ({ input }) => {
      const [diag] = await db.select()
        .from(diagnosticos)
        .where(eq(diagnosticos.visitorId, input.visitorId))
        .orderBy(desc(diagnosticos.createdAt))
        .limit(1);

      if (!diag) return null;

      return {
        id: diag.id,
        scores: {
          consciencia: diag.conscienciaScore,
          financeiro: diag.financeiroScore,
          posicionamento: diag.bioScore,
        },
        nivel: diag.conscienciaNivel,
        plano: diag.planoCorrecao,
        completedAt: diag.completedAt,
      };
    }),

  // ========================================
  // ATIVAR TRIAL (APÓS FEEDBACK 4-5 ESTRELAS)
  // ========================================
  ativarTrial: protectedProcedure
    .input(z.object({
      diagnosticoId: z.number(),
      rating: z.number().min(1).max(5),
      metodo: z.enum(["feedback", "referral", "google_review"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Verificar se já tem trial ativo
      const [trialExistente] = await db.select()
        .from(freeTrials)
        .where(and(
          eq(freeTrials.userId, userId),
          eq(freeTrials.isActive, 1)
        ))
        .limit(1);

      if (trialExistente) {
        return { 
          success: false, 
          message: "Você já possui um trial ativo.",
          expiresAt: trialExistente.expiresAt,
        };
      }

      // Ativar trial de 30 dias
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.insert(freeTrials).values({
        userId,
        activationMethod: input.metodo,
        expiresAt,
      });

      // Salvar feedback
      await db.insert(feedback).values({
        userId,
        diagnosticoId: input.diagnosticoId,
        rating: input.rating,
        trialActivated: 1,
      });

      logger.info('Trial ativado', { userId, metodo: input.metodo });

      return { 
        success: true, 
        message: "Trial de 30 dias ativado!",
        expiresAt,
      };
    }),

  // ========================================
  // DETERMINAR OFERTA AUTOMÁTICA
  // ========================================
  determinarOferta: publicProcedure
    .input(z.object({
      nivel: z.string(),
      behaviorScore: z.number(),
      temTrial: z.boolean(),
    }))
    .query(({ input }) => {
      // Lógica de oferta baseada em behavior score
      if (input.behaviorScore >= 20 && input.nivel === "estrategista") {
        return { 
          oferta: "plano_estruturante",
          mensagem: "Você está pronta para estruturar seu negócio. Conheça o Plano Estruturante.",
          prioridade: "alta",
        };
      }

      if (input.behaviorScore >= 25 && input.nivel === "rainha") {
        return {
          oferta: "mentoria_premium",
          mensagem: "Você domina o jogo. Hora de escalar com mentoria 1:1.",
          prioridade: "alta",
        };
      }

      if (input.nivel === "desbravadora" && !input.temTrial) {
        return {
          oferta: "trial_30_dias",
          mensagem: "Teste a plataforma por 30 dias e veja a diferença.",
          prioridade: "media",
        };
      }

      return {
        oferta: null,
        mensagem: null,
        prioridade: "baixa",
      };
    }),
});
