import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { subscriptionRouter } from "./routers/subscription";
import { bioRadarRouter } from "./routers/bioRadar";
import { contentRouter } from "./routers/content";
import { crmRouter } from "./routers/crm";
import { calendarRouter } from "./routers/calendar";
import { diagnosticoRouter } from "./routers/diagnostico";
import { gamificationRouter } from "./routers/gamification";
import { quizRouter } from "./routers/quiz";
import { adminRouter } from "./routers/admin";
import { lgpdRouter } from "./routers/lgpd";
import { emailRouter } from "./routers/email";
import { cacheRouter } from "./routers/cache";
import { twoFactorRouter } from "./routers/twoFactor";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  subscription: subscriptionRouter,
  bioRadar: bioRadarRouter,
  content: contentRouter,
  
  // 🚀 NOVOS ROUTERS - Backend Real
  crm: crmRouter,
  calendar: calendarRouter,
  diagnostico: diagnosticoRouter,
  gamification: gamificationRouter,
  quiz: quizRouter,
  
  // 🔒 ADMIN
  admin: adminRouter,
  
  // 🔐 LGPD - Conformidade com Lei Geral de Proteção de Dados
  lgpd: lgpdRouter,
  
  // 📧 EMAIL - Sistema de emails transacionais
  email: emailRouter,
  
  // 💾 CACHE - Monitoramento de cache (admin)
  cache: cacheRouter,
  
  // 🔐 TWO-FACTOR - Autenticação de dois fatores (admin)
  twoFactor: twoFactorRouter,
});

export type AppRouter = typeof appRouter;
