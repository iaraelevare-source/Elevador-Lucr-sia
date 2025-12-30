import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { calendarioPosts, contentGeneration } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { logger } from "../adapters/loggingAdapter";
import { llm } from "../_core/llm";
import { AIServiceError } from "../_core/errors";

// ============================================
// 📆 CALENDAR ROUTER - CALENDÁRIO DE CONTEÚDO E VENDAS
// Backend real para posts agendados com sugestões IA
// ============================================

export const calendarRouter = router({
  // =====================
  // 📅 AGENDAR POST
  // =====================

  createPost: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
        tipo: z.enum(["autoridade", "desejo", "fechamento", "conexao"]),
        plataforma: z.string().default("instagram"),
        dataAgendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
        horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário deve ser HH:MM").default("19:00"),
        legenda: z.string().optional(),
        hashtags: z.string().optional(),
        contentId: z.number().int().optional(), // Link para conteúdo gerado
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newPost] = await db
        .insert(calendarioPosts)
        .values({
          userId: ctx.user.id,
          titulo: input.titulo,
          tipo: input.tipo,
          plataforma: input.plataforma,
          dataAgendada: input.dataAgendada,
          horario: input.horario,
          legenda: input.legenda || null,
          hashtags: input.hashtags || null,
          contentId: input.contentId || null,
          status: "pendente",
        })
        .$returningId();

      const [created] = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.id, newPost.id))
        .limit(1);

      logger.info("Post de calendário criado", {
        postId: newPost.id,
        userId: ctx.user.id,
      });

      return { success: true, post: created };
    }),

  // Agendar múltiplos posts de uma vez (calendário semanal)
  createMultiplePosts: protectedProcedure
    .input(
      z.object({
        posts: z.array(
          z.object({
            titulo: z.string().min(3),
            tipo: z.enum(["autoridade", "desejo", "fechamento", "conexao"]),
            plataforma: z.string().default("instagram"),
            dataAgendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            horario: z.string().regex(/^\d{2}:\d{2}$/).default("19:00"),
            legenda: z.string().optional(),
            hashtags: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const postsToInsert = input.posts.map((post) => ({
        userId: ctx.user.id,
        titulo: post.titulo,
        tipo: post.tipo,
        plataforma: post.plataforma,
        dataAgendada: post.dataAgendada,
        horario: post.horario,
        legenda: post.legenda || null,
        hashtags: post.hashtags || null,
        status: "pendente" as const,
      }));

      // Inserir todos
      for (const post of postsToInsert) {
        await db.insert(calendarioPosts).values(post);
      }

      logger.info("Múltiplos posts criados", {
        count: input.posts.length,
        userId: ctx.user.id,
      });

      return { success: true, count: input.posts.length };
    }),

  // =====================
  // 📊 LISTAR POSTS
  // =====================

  getPosts: protectedProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(), // YYYY-MM-DD
        dataFim: z.string().optional(), // YYYY-MM-DD
        tipo: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.userId, ctx.user.id))
        .orderBy(desc(calendarioPosts.dataAgendada), desc(calendarioPosts.horario))
        .limit(input.limit);

      // Filtrar
      let filtered = posts;
      if (input.dataInicio) {
        filtered = filtered.filter((p: typeof posts[0]) => p.dataAgendada >= input.dataInicio!);
      }
      if (input.dataFim) {
        filtered = filtered.filter((p: typeof posts[0]) => p.dataAgendada <= input.dataFim!);
      }
      if (input.tipo) {
        filtered = filtered.filter((p: typeof posts[0]) => p.tipo === input.tipo);
      }
      if (input.status) {
        filtered = filtered.filter((p: typeof posts[0]) => p.status === input.status);
      }

      return { success: true, posts: filtered };
    }),

  // Obter posts da semana atual
  getWeekPosts: protectedProcedure
    .input(
      z.object({
        weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Segunda-feira da semana
      })
    )
    .query(async ({ ctx, input }) => {
      // Calcular fim da semana (domingo)
      const startDate = new Date(input.weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const weekEnd = endDate.toISOString().split("T")[0];

      const posts = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.userId, ctx.user.id))
        .orderBy(calendarioPosts.dataAgendada, calendarioPosts.horario);

      const weekPosts = posts.filter(
        (p: typeof posts[0]) => p.dataAgendada >= input.weekStart && p.dataAgendada <= weekEnd
      );

      // Agrupar por dia
      const postsByDay: Record<string, typeof weekPosts> = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        postsByDay[dateStr] = weekPosts.filter((p: typeof posts[0]) => p.dataAgendada === dateStr);
      }

      return { success: true, posts: weekPosts, postsByDay };
    }),

  // =====================
  // ✏️ ATUALIZAR POST
  // =====================

  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        titulo: z.string().min(3).optional(),
        tipo: z.enum(["autoridade", "desejo", "fechamento", "conexao"]).optional(),
        dataAgendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        horario: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        legenda: z.string().optional(),
        hashtags: z.string().optional(),
        status: z.enum(["pendente", "publicado", "cancelado"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [existing] = await db
        .select()
        .from(calendarioPosts)
        .where(and(eq(calendarioPosts.id, id), eq(calendarioPosts.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("Post não encontrado");
      }

      await db
        .update(calendarioPosts)
        .set(updateData)
        .where(eq(calendarioPosts.id, id));

      const [updated] = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.id, id))
        .limit(1);

      logger.info("Post atualizado", { postId: id, userId: ctx.user.id });

      return { success: true, post: updated };
    }),

  // Marcar como publicado
  markAsPublished: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        engajamento: z
          .object({
            likes: z.number().int().optional(),
            comentarios: z.number().int().optional(),
            salvos: z.number().int().optional(),
            alcance: z.number().int().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(calendarioPosts)
        .where(and(eq(calendarioPosts.id, input.id), eq(calendarioPosts.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("Post não encontrado");
      }

      await db
        .update(calendarioPosts)
        .set({
          status: "publicado",
          publicadoEm: new Date(),
          engajamento: input.engajamento ? JSON.stringify(input.engajamento) : null,
        })
        .where(eq(calendarioPosts.id, input.id));

      const [updated] = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.id, input.id))
        .limit(1);

      logger.info("Post marcado como publicado", {
        postId: input.id,
        userId: ctx.user.id,
      });

      return { success: true, post: updated };
    }),

  // Deletar post
  deletePost: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(calendarioPosts)
        .where(and(eq(calendarioPosts.id, input.id), eq(calendarioPosts.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("Post não encontrado");
      }

      await db.delete(calendarioPosts).where(eq(calendarioPosts.id, input.id));

      logger.info("Post deletado", { postId: input.id, userId: ctx.user.id });

      return { success: true, deletedId: input.id };
    }),

  // =====================
  // 🤖 SUGESTÕES COM IA
  // =====================

  generateWeekSuggestions: protectedProcedure
    .input(
      z.object({
        weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        nicho: z.string().default("estética"),
        procedimentos: z.array(z.string()).optional(),
        tom: z.enum(["profissional", "acolhedor", "sofisticado"]).default("profissional"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = `Você é especialista em marketing digital para clínicas de estética.

Crie um calendário de conteúdo para a semana começando em ${input.weekStart}.

Nicho: ${input.nicho}
Procedimentos principais: ${input.procedimentos?.join(", ") || "diversos procedimentos estéticos"}
Tom de voz: ${input.tom}

Gere 5 posts estratégicos para a semana, distribuídos assim:
- 1 post de AUTORIDADE (mostra expertise)
- 2 posts de DESEJO (desperta vontade)
- 1 post de FECHAMENTO (call to action)
- 1 post de CONEXÃO (humaniza)

Retorne em JSON:
{
  "posts": [
    {
      "dia": "segunda",
      "data": "YYYY-MM-DD",
      "tipo": "autoridade|desejo|fechamento|conexao",
      "titulo": "título curto",
      "descricao": "descrição do post",
      "legenda": "legenda completa pronta para usar",
      "hashtags": "#hashtags #relevantes",
      "melhorHorario": "HH:MM"
    }
  ]
}`;

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Você é especialista em marketing para estética. Responda sempre em JSON válido.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new AIServiceError("IA não retornou resposta");
        }

        const suggestions = JSON.parse(
          typeof content === "string" ? content : JSON.stringify(content)
        );

        logger.info("Sugestões de calendário geradas", { userId: ctx.user.id });

        return { success: true, suggestions: suggestions.posts || [] };
      } catch (error) {
        logger.error("Erro ao gerar sugestões", {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.user.id,
        });
        throw new AIServiceError("Não foi possível gerar sugestões. Tente novamente.");
      }
    }),

  // =====================
  // 📊 ESTATÍSTICAS
  // =====================

  getCalendarStats: protectedProcedure
    .input(
      z.object({
        mes: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await db
        .select()
        .from(calendarioPosts)
        .where(eq(calendarioPosts.userId, ctx.user.id));

      const postsMes = posts.filter((p: typeof posts[0]) => p.dataAgendada.startsWith(input.mes));

      const stats = {
        totalPosts: postsMes.length,
        pendentes: postsMes.filter((p: typeof posts[0]) => p.status === "pendente").length,
        publicados: postsMes.filter((p: typeof posts[0]) => p.status === "publicado").length,
        cancelados: postsMes.filter((p: typeof posts[0]) => p.status === "cancelado").length,
        porTipo: {
          autoridade: postsMes.filter((p: typeof posts[0]) => p.tipo === "autoridade").length,
          desejo: postsMes.filter((p: typeof posts[0]) => p.tipo === "desejo").length,
          fechamento: postsMes.filter((p: typeof posts[0]) => p.tipo === "fechamento").length,
          conexao: postsMes.filter((p: typeof posts[0]) => p.tipo === "conexao").length,
        },
        engajamentoTotal: postsMes
          .filter((p: typeof posts[0]) => p.engajamento)
          .reduce((sum: number, p: typeof posts[0]) => {
            try {
              const eng = JSON.parse(p.engajamento || "{}");
              return sum + (eng.likes || 0) + (eng.comentarios || 0);
            } catch {
              return sum;
            }
          }, 0),
      };

      return { success: true, stats };
    }),
});
