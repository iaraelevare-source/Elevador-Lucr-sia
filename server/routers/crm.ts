import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { leads, agendamentos } from "../../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { logger } from "../adapters/loggingAdapter";

// ============================================
// 🚀 CRM ROUTER - FLUXO INTELIGENTE DE CLIENTES
// Backend real para persistência de leads e agendamentos
// ============================================

export const crmRouter = router({
  // =====================
  // 👥 LEADS
  // =====================

  // Criar novo lead
  createLead: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().min(10).optional().or(z.literal("")),
        procedimento: z.string().optional(),
        origem: z.string().optional(),
        temperatura: z.enum(["frio", "morno", "quente"]).default("frio"),
        valorEstimado: z.number().int().min(0).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newLead] = await db
        .insert(leads)
        .values({
          userId: ctx.user.id,
          nome: input.nome,
          email: input.email || null,
          telefone: input.telefone || null,
          procedimento: input.procedimento || null,
          origem: input.origem || null,
          temperatura: input.temperatura,
          valorEstimado: input.valorEstimado || null,
          observacoes: input.observacoes || null,
          status: "novo",
        })
        .$returningId();

      const [createdLead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, newLead.id))
        .limit(1);

      logger.info("Lead criado", { leadId: newLead.id, userId: ctx.user.id });

      return { success: true, lead: createdLead };
    }),

  // Listar leads do usuário
  getLeads: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        temperatura: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = db
        .select()
        .from(leads)
        .where(eq(leads.userId, ctx.user.id))
        .orderBy(desc(leads.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const leadsList = await query;

      // Filtrar no JS por simplicidade (Drizzle MySQL não suporta bem AND dinâmico)
      let filtered = leadsList;
      if (input.status) {
        filtered = filtered.filter((l: typeof leadsList[0]) => l.status === input.status);
      }
      if (input.temperatura) {
        filtered = filtered.filter((l: typeof leadsList[0]) => l.temperatura === input.temperatura);
      }

      // Contar total
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.userId, ctx.user.id));

      return {
        success: true,
        leads: filtered,
        total: totalResult?.count || 0,
      };
    }),

  // Obter lead específico
  getLead: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const [lead] = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, input.id), eq(leads.userId, ctx.user.id)))
        .limit(1);

      if (!lead) {
        throw new Error("Lead não encontrado");
      }

      return { success: true, lead };
    }),

  // Atualizar lead
  updateLead: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        nome: z.string().min(2).optional(),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().optional(),
        procedimento: z.string().optional(),
        origem: z.string().optional(),
        temperatura: z.enum(["frio", "morno", "quente"]).optional(),
        status: z.enum(["novo", "contatado", "agendado", "convertido", "perdido"]).optional(),
        valorEstimado: z.number().int().min(0).optional(),
        observacoes: z.string().optional(),
        ultimoContato: z.string().optional(), // ISO date string
        proximoContato: z.string().optional(), // ISO date string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ultimoContato, proximoContato, ...updateData } = input;

      // Verificar se lead pertence ao usuário
      const [existingLead] = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, id), eq(leads.userId, ctx.user.id)))
        .limit(1);

      if (!existingLead) {
        throw new Error("Lead não encontrado ou não autorizado");
      }

      const updateValues: any = { ...updateData };
      if (ultimoContato) {
        updateValues.ultimoContato = new Date(ultimoContato);
      }
      if (proximoContato) {
        updateValues.proximoContato = new Date(proximoContato);
      }

      await db
        .update(leads)
        .set(updateValues)
        .where(eq(leads.id, id));

      const [updatedLead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      logger.info("Lead atualizado", { leadId: id, userId: ctx.user.id });

      return { success: true, lead: updatedLead };
    }),

  // Deletar lead
  deleteLead: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const [existingLead] = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, input.id), eq(leads.userId, ctx.user.id)))
        .limit(1);

      if (!existingLead) {
        throw new Error("Lead não encontrado ou não autorizado");
      }

      await db.delete(leads).where(eq(leads.id, input.id));

      logger.info("Lead deletado", { leadId: input.id, userId: ctx.user.id });

      return { success: true, deletedId: input.id };
    }),

  // =====================
  // 📅 AGENDAMENTOS
  // =====================

  // Criar agendamento
  createAgendamento: protectedProcedure
    .input(
      z.object({
        leadId: z.number().int().optional(),
        clienteNome: z.string().min(2),
        procedimento: z.string().min(2),
        valor: z.number().int().min(0), // em centavos
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
        horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário deve ser HH:MM"),
        status: z.enum(["confirmado", "pendente", "realizado", "cancelado", "remarcado"]).default("pendente"),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newAgendamento] = await db
        .insert(agendamentos)
        .values({
          userId: ctx.user.id,
          leadId: input.leadId || null,
          clienteNome: input.clienteNome,
          procedimento: input.procedimento,
          valor: input.valor,
          data: input.data,
          horario: input.horario,
          status: input.status,
          observacoes: input.observacoes || null,
        })
        .$returningId();

      const [created] = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.id, newAgendamento.id))
        .limit(1);

      logger.info("Agendamento criado", { agendamentoId: newAgendamento.id, userId: ctx.user.id });

      return { success: true, agendamento: created };
    }),

  // Listar agendamentos por período
  getAgendamentos: protectedProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(), // YYYY-MM-DD
        dataFim: z.string().optional(), // YYYY-MM-DD
        status: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const agendamentosList = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.userId, ctx.user.id))
        .orderBy(desc(agendamentos.data), desc(agendamentos.horario))
        .limit(input.limit);

      // Filtrar por data e status
      let filtered = agendamentosList;
      if (input.dataInicio) {
        filtered = filtered.filter((a: typeof agendamentosList[0]) => a.data >= input.dataInicio!);
      }
      if (input.dataFim) {
        filtered = filtered.filter((a: typeof agendamentosList[0]) => a.data <= input.dataFim!);
      }
      if (input.status) {
        filtered = filtered.filter((a: typeof agendamentosList[0]) => a.status === input.status);
      }

      return { success: true, agendamentos: filtered };
    }),

  // Atualizar agendamento
  updateAgendamento: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        clienteNome: z.string().min(2).optional(),
        procedimento: z.string().optional(),
        valor: z.number().int().min(0).optional(),
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        horario: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        status: z.enum(["confirmado", "pendente", "realizado", "cancelado", "remarcado"]).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [existing] = await db
        .select()
        .from(agendamentos)
        .where(and(eq(agendamentos.id, id), eq(agendamentos.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("Agendamento não encontrado");
      }

      await db
        .update(agendamentos)
        .set(updateData)
        .where(eq(agendamentos.id, id));

      const [updated] = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.id, id))
        .limit(1);

      logger.info("Agendamento atualizado", { agendamentoId: id, userId: ctx.user.id });

      return { success: true, agendamento: updated };
    }),

  // Deletar agendamento
  deleteAgendamento: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(agendamentos)
        .where(and(eq(agendamentos.id, input.id), eq(agendamentos.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("Agendamento não encontrado");
      }

      await db.delete(agendamentos).where(eq(agendamentos.id, input.id));

      logger.info("Agendamento deletado", { agendamentoId: input.id, userId: ctx.user.id });

      return { success: true, deletedId: input.id };
    }),

  // =====================
  // 📊 ESTATÍSTICAS CRM
  // =====================

  getCrmStats: protectedProcedure.query(async ({ ctx }) => {
    // Total de leads por status
    const leadsData = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, ctx.user.id));

    const totalLeads = leadsData.length;
    const leadsPorStatus = {
      novo: leadsData.filter((l: typeof leadsData[0]) => l.status === "novo").length,
      contatado: leadsData.filter((l: typeof leadsData[0]) => l.status === "contatado").length,
      agendado: leadsData.filter((l: typeof leadsData[0]) => l.status === "agendado").length,
      convertido: leadsData.filter((l: typeof leadsData[0]) => l.status === "convertido").length,
      perdido: leadsData.filter((l: typeof leadsData[0]) => l.status === "perdido").length,
    };

    const leadsPorTemperatura = {
      frio: leadsData.filter((l: typeof leadsData[0]) => l.temperatura === "frio").length,
      morno: leadsData.filter((l: typeof leadsData[0]) => l.temperatura === "morno").length,
      quente: leadsData.filter((l: typeof leadsData[0]) => l.temperatura === "quente").length,
    };

    // Valor total estimado
    const valorTotalEstimado = leadsData.reduce(
      (sum: number, l: typeof leadsData[0]) => sum + (l.valorEstimado || 0),
      0
    );

    // Agendamentos de hoje
    const hoje = new Date().toISOString().split("T")[0];
    const agendamentosHoje = await db
      .select()
      .from(agendamentos)
      .where(
        and(eq(agendamentos.userId, ctx.user.id), eq(agendamentos.data, hoje))
      );

    // Faturamento do mês (agendamentos realizados)
    const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const agendamentosRealizados = await db
      .select()
      .from(agendamentos)
      .where(eq(agendamentos.userId, ctx.user.id));

    const faturamentoMes = agendamentosRealizados
      .filter((a: typeof agendamentosRealizados[0]) => a.data.startsWith(mesAtual) && a.status === "realizado")
      .reduce((sum: number, a: typeof agendamentosRealizados[0]) => sum + a.valor, 0);

    const faturamentoPrevisto = agendamentosRealizados
      .filter((a: typeof agendamentosRealizados[0]) => a.data.startsWith(mesAtual) && a.status !== "cancelado")
      .reduce((sum: number, a: typeof agendamentosRealizados[0]) => sum + a.valor, 0);

    return {
      success: true,
      stats: {
        totalLeads,
        leadsPorStatus,
        leadsPorTemperatura,
        valorTotalEstimado,
        agendamentosHoje: agendamentosHoje.length,
        faturamentoMes,
        faturamentoPrevisto,
        taxaConversao:
          totalLeads > 0
            ? ((leadsPorStatus.convertido / totalLeads) * 100).toFixed(1)
            : "0",
      },
    };
  }),
});
