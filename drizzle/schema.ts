import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Two-Factor Authentication (2FA)
  twoFactorEnabled: int("twoFactorEnabled").default(0),
  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
  twoFactorBackupCodes: text("twoFactorBackupCodes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Essência da marca do usuário (para geração de conteúdo personalizado)
 */
export const brandEssence = mysqlTable("brandEssence", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandName: varchar("brandName", { length: 255 }).notNull(),
  brandDescription: text("brandDescription"),
  targetAudience: text("targetAudience"),
  brandValues: text("brandValues"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandEssence = typeof brandEssence.$inferSelect;
export type InsertBrandEssence = typeof brandEssence.$inferInsert;

/**
 * Histórico de gerações de conteúdo (posts, e-books, etc.)
 */
export const contentGeneration = mysqlTable("contentGeneration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'post', 'ebook', 'ad', 'prompt'
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  metadata: text("metadata"), // JSON
  creditsUsed: int("creditsUsed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
  userTypeIdx: index("user_type_idx").on(table.userId, table.type),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type ContentGeneration = typeof contentGeneration.$inferSelect;
export type InsertContentGeneration = typeof contentGeneration.$inferInsert;

/**
 * Diagnóstico do Radar de Bio (Lead Magnet)
 */
export const bioRadarDiagnosis = mysqlTable("bioRadarDiagnosis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  instagramHandle: varchar("instagramHandle", { length: 255 }).notNull(),
  bioAnalysis: text("bioAnalysis"), // JSON com análise
  recommendations: text("recommendations"), // JSON com recomendações
  score: int("score"), // 0-100
  leadEmail: varchar("leadEmail", { length: 320 }),
  leadPhone: varchar("leadPhone", { length: 20 }),
  leadWhatsapp: varchar("leadWhatsapp", { length: 20 }),
  convertedToUser: int("convertedToUser").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("bioradar_user_id_idx").on(table.userId),
  createdAtIdx: index("bioradar_created_at_idx").on(table.createdAt),
  instagramHandleIdx: index("instagram_handle_idx").on(table.instagramHandle),
}));

export type BioRadarDiagnosis = typeof bioRadarDiagnosis.$inferSelect & { convertedToUser: boolean };
export type InsertBioRadarDiagnosis = typeof bioRadarDiagnosis.$inferInsert & { convertedToUser?: boolean };

/**
 * Plano de assinatura do usuário
 */
export const subscription = mysqlTable("subscription", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: mysqlEnum("plan", ["free", "essencial", "profissional"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "cancelled"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  creditsRemaining: int("creditsRemaining").default(100).notNull(),
  monthlyCreditsLimit: int("monthlyCreditsLimit").default(100).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  renewalDate: timestamp("renewalDate"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscription_user_id_idx").on(table.userId),
  stripeCustomerIdx: index("stripe_customer_idx").on(table.stripeCustomerId),
  stripeSubscriptionIdx: index("stripe_subscription_idx").on(table.stripeSubscriptionId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Subscription = typeof subscription.$inferSelect;
export type InsertSubscription = typeof subscription.$inferInsert;

// ============================================
// 🚀 NOVAS TABELAS - BACKEND REAL LUCRESIA
// ============================================

/**
 * 👥 LEADS - Fluxo Inteligente de Clientes
 * Persiste leads do CRM com temperatura e pipeline
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  procedimento: varchar("procedimento", { length: 255 }),
  origem: varchar("origem", { length: 100 }), // instagram, google, indicação
  temperatura: mysqlEnum("temperatura", ["frio", "morno", "quente"]).default("frio").notNull(),
  status: mysqlEnum("status", ["novo", "contatado", "agendado", "convertido", "perdido"]).default("novo").notNull(),
  valorEstimado: int("valorEstimado"), // em centavos
  observacoes: text("observacoes"),
  ultimoContato: timestamp("ultimoContato"),
  proximoContato: timestamp("proximoContato"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("leads_user_id_idx").on(table.userId),
  statusIdx: index("leads_status_idx").on(table.status),
  temperaturaIdx: index("leads_temperatura_idx").on(table.temperatura),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * 📅 AGENDAMENTOS - Agenda Estratégica de Faturamento
 * Compromissos com clientes, procedimentos e valores
 */
export const agendamentos = mysqlTable("agendamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  leadId: int("leadId").references(() => leads.id, { onDelete: "set null" }),
  clienteNome: varchar("clienteNome", { length: 255 }).notNull(),
  procedimento: varchar("procedimento", { length: 255 }).notNull(),
  valor: int("valor").notNull(), // em centavos
  data: varchar("data", { length: 10 }).notNull(), // YYYY-MM-DD
  horario: varchar("horario", { length: 5 }).notNull(), // HH:MM
  status: mysqlEnum("status", ["confirmado", "pendente", "realizado", "cancelado", "remarcado"]).default("pendente").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("agendamentos_user_id_idx").on(table.userId),
  leadIdIdx: index("agendamentos_lead_id_idx").on(table.leadId),
  dataIdx: index("agendamentos_data_idx").on(table.data),
  statusIdx: index("agendamentos_status_idx").on(table.status),
}));

export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertAgendamento = typeof agendamentos.$inferInsert;

/**
 * 📆 CALENDARIO_POSTS - Calendário de Conteúdo e Vendas
 * Posts agendados com sugestões de conteúdo estratégico
 */
export const calendarioPosts = mysqlTable("calendarioPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: int("contentId").references(() => contentGeneration.id, { onDelete: "set null" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["autoridade", "desejo", "fechamento", "conexao"]).default("conexao").notNull(),
  plataforma: varchar("plataforma", { length: 50 }).default("instagram").notNull(),
  dataAgendada: varchar("dataAgendada", { length: 10 }).notNull(), // YYYY-MM-DD
  horario: varchar("horario", { length: 5 }).default("19:00").notNull(),
  legenda: text("legenda"),
  hashtags: text("hashtags"),
  status: mysqlEnum("status", ["pendente", "publicado", "cancelado"]).default("pendente").notNull(),
  engajamento: text("engajamento"), // JSON: {likes, comentarios, salvos}
  publicadoEm: timestamp("publicadoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("calendario_user_id_idx").on(table.userId),
  dataIdx: index("calendario_data_idx").on(table.dataAgendada),
  statusIdx: index("calendario_status_idx").on(table.status),
  tipoIdx: index("calendario_tipo_idx").on(table.tipo),
}));

export type CalendarioPost = typeof calendarioPosts.$inferSelect;
export type InsertCalendarioPost = typeof calendarioPosts.$inferInsert;

// ============================================
// 🎯 GAMIFICAÇÃO - SISTEMA DE TRIAL & REFERRAL
// ============================================

/**
 * 📊 DIAGNOSTICOS COMPLETOS - Resultado do diagnóstico Elevare
 * Armazena análise completa de Bio, Consciência e Financeiro
 */
export const diagnosticos = mysqlTable("diagnosticos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  // Dados do visitante (caso não logado)
  visitorId: varchar("visitorId", { length: 64 }),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  visitorNome: varchar("visitorNome", { length: 255 }),
  // Análises
  bioAnalysis: text("bioAnalysis"), // JSON
  conscienciaAnalysis: text("conscienciaAnalysis"), // JSON
  financeiroAnalysis: text("financeiroAnalysis"), // JSON
  // Scores
  bioScore: int("bioScore"),
  conscienciaScore: int("conscienciaScore"),
  financeiroScore: int("financeiroScore"),
  // Níveis determinados
  bioNivel: varchar("bioNivel", { length: 50 }), // 'invisivel', 'estetica', 'magnetica'
  conscienciaNivel: varchar("conscienciaNivel", { length: 50 }), // 'desbravadora', 'estrategista', 'rainha'
  financeiroNivel: varchar("financeiroNivel", { length: 50 }), // 'tecnica', 'transicao', 'ceo'
  // Plano gerado pela IA
  planoCorrecao: text("planoCorrecao"), // JSON com calendário e recomendações
  // Referral tracking
  referredBy: int("referredBy").references(() => users.id),
  referralCode: varchar("referralCode", { length: 64 }),
  // Status
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("diagnosticos_user_id_idx").on(table.userId),
  visitorIdIdx: index("diagnosticos_visitor_id_idx").on(table.visitorId),
  referralCodeIdx: index("diagnosticos_referral_code_idx").on(table.referralCode),
}));

export type Diagnostico = typeof diagnosticos.$inferSelect;
export type InsertDiagnostico = typeof diagnosticos.$inferInsert;

/**
 * ⭐ FEEDBACK - Avaliações internas
 * Avaliação do diagnóstico (1-5 estrelas)
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  diagnosticoId: int("diagnosticoId").references(() => diagnosticos.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  trialActivated: int("trialActivated").default(0).notNull(), // boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("feedback_user_id_idx").on(table.userId),
  diagnosticoIdIdx: index("feedback_diagnostico_id_idx").on(table.diagnosticoId),
}));

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * 🔗 REFERRALS - Sistema de indicação
 * Rastreia compartilhamentos e conversões
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredEmail: varchar("referredEmail", { length: 320 }),
  referredUserId: int("referredUserId").references(() => users.id),
  referralCode: varchar("referralCode", { length: 64 }).notNull().unique(),
  clicked: int("clicked").default(0).notNull(), // boolean - link foi clicado
  converted: int("converted").default(0).notNull(), // boolean - diagnóstico concluído
  shareMethod: varchar("shareMethod", { length: 50 }), // 'whatsapp', 'copy', 'email'
  trialActivated: int("trialActivated").default(0).notNull(), // boolean - trial dado ao referrer
  clickedAt: timestamp("clickedAt"),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  referrerIdIdx: index("referrals_referrer_id_idx").on(table.referrerId),
  referralCodeIdx: index("referrals_code_idx").on(table.referralCode),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * 🌟 GOOGLE REVIEW INTENTS - Rastreia intenção de avaliar no Google
 */
export const googleReviewIntents = mysqlTable("googleReviewIntents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  diagnosticoId: int("diagnosticoId").references(() => diagnosticos.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  trialActivated: int("trialActivated").default(0).notNull(), // boolean
}, (table) => ({
  userIdIdx: index("google_review_user_id_idx").on(table.userId),
}));

export type GoogleReviewIntent = typeof googleReviewIntents.$inferSelect;
export type InsertGoogleReviewIntent = typeof googleReviewIntents.$inferInsert;

/**
 * 🎁 FREE TRIALS - Controle de trials ativados
 * Centraliza todas as ativações de período grátis
 */
export const freeTrials = mysqlTable("freeTrials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  activationMethod: varchar("activationMethod", { length: 50 }).notNull(), // 'feedback', 'referral', 'google_review'
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isActive: int("isActive").default(1).notNull(), // boolean
}, (table) => ({
  userIdIdx: index("free_trials_user_id_idx").on(table.userId),
  expiresAtIdx: index("free_trials_expires_idx").on(table.expiresAt),
}));

export type FreeTrial = typeof freeTrials.$inferSelect;
export type InsertFreeTrial = typeof freeTrials.$inferInsert;