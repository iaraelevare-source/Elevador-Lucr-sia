import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import simpleAuthRouter from "../routes/simple-auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV, validateEnvOnStartup } from "./env";
import { logger } from "./logger";
import { getDb } from "../db";
import { runMigrations } from "../db/migrate";
import { initSentry, setupGlobalErrorHandlers, captureMessage } from "./sentry";

// 🔐 VALIDAR VARIÁVEIS CRÍTICAS EM STARTUP
validateEnvOnStartup();

// 🔍 INICIALIZAR SENTRY PARA MONITORAMENTO
const app = express();
initSentry(app);
setupGlobalErrorHandlers();
captureMessage("🚀 Servidor iniciando", "info", {
  environment: process.env.NODE_ENV,
  version: "1.0.0",
});

import { subscription as subscriptionTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "../routers/subscription";

// Inicializar Stripe
const stripe = new Stripe(ENV.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

// Verificar disponibilidade de porta
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ==================== WEBHOOK HANDLERS ====================
// BUG-001: Implementar webhook do Stripe

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    logger.error('Database not available in webhook handler');
    return;
  }

  const userId = parseInt(session.metadata?.userId || '0');
  const plan = session.metadata?.plan as 'essencial' | 'profissional';
  
  if (!userId || !plan) {
    logger.error('Missing userId or plan in checkout session', { session });
    return;
  }

  const planConfig = PLANS[plan];
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  try {
    await db
      .update(subscriptionTable)
      .set({
        plan,
        status: 'active',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        creditsRemaining: planConfig.credits === -1 ? -1 : planConfig.credits,
        monthlyCreditsLimit: planConfig.credits === -1 ? -1 : planConfig.credits,
        renewalDate,
      })
      .where(eq(subscriptionTable.userId, userId));

    logger.info('Checkout completed successfully', { userId, plan });
  } catch (error) {
    logger.error('Error handling checkout completed', error);
    throw error;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const [userSub] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (!userSub) {
    logger.warn('Subscription not found in database', { subscriptionId: subscription.id });
    return;
  }

  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'canceled' ? 'cancelled' : 'inactive';

  try {
    await db
      .update(subscriptionTable)
      .set({ status })
      .where(eq(subscriptionTable.id, userSub.id));

    logger.info('Subscription status updated', { subscriptionId: subscription.id, status });
  } catch (error) {
    logger.error('Error updating subscription status', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  // Extract subscription ID from invoice
  // Note: The Stripe Invoice type may not include subscription in all versions
  // We use type assertion here as the property exists at runtime
  interface InvoiceWithSubscription extends Stripe.Invoice {
    subscription?: string | Stripe.Subscription;
  }
  
  const invoiceWithSub = invoice as InvoiceWithSubscription;
  const subscriptionId = typeof invoiceWithSub.subscription === 'string' 
    ? invoiceWithSub.subscription 
    : invoiceWithSub.subscription?.id;

  if (!subscriptionId) {
    logger.warn('Invalid subscription in invoice', { invoiceId: invoice.id });
    return;
  }

  const [userSub] = await db
    .select()
    .from(subscriptionTable)
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!userSub) {
    logger.warn('Subscription not found for payment', { invoiceId: invoice.id });
    return;
  }

  // Check if plan exists in PLANS
  const planKey = userSub.plan as keyof typeof PLANS;
  if (!(planKey in PLANS)) {
    logger.error('Invalid plan in subscription', { plan: userSub.plan });
    return;
  }

  const planConfig = PLANS[planKey];
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  try {
    await db
      .update(subscriptionTable)
      .set({
        creditsRemaining: planConfig.credits,
        renewalDate,
      })
      .where(eq(subscriptionTable.id, userSub.id));

    logger.info('Credits renewed after payment', { userId: userSub.userId, plan: userSub.plan });
  } catch (error) {
    logger.error('Error renewing credits', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logger.error('Payment failed for invoice', { invoiceId: invoice.id });
  // Aqui você pode implementar lógica de notificação ao usuário
}

// ==================== SERVER SETUP ====================

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ==================== TRUST PROXY ====================
  // IMPORTANTE: Necessário quando atrás de um proxy reverso (Railway, Heroku, etc)
  // Isso permite que o express-rate-limit identifique corretamente os IPs dos usuários
  // via header X-Forwarded-For
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Confiar no primeiro proxy
    console.log('[Server] Trust proxy enabled for production');
  }

  // ==================== DATABASE MIGRATION ====================
  // Run migrations on startup to ensure all tables exist
  console.log('[Server] Running database migrations...');
  const migrationSuccess = await runMigrations();
  if (!migrationSuccess) {
    console.error('[Server] ⚠️ Database migrations failed, but continuing startup');
  }

  // ==================== HEALTH CHECK ====================
  // IMPORTANTE: Registrar ANTES de qualquer outro middleware
  // Endpoint para Railway/Kubernetes verificar se a aplicação está saudável
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // ==================== SENTRY TEST ERROR ====================
  // Endpoint controlado para forçar um erro e validar captura no Sentry
  app.post('/api/test-error', (_req, _res, _next) => {
    // Lança um erro proposital; o middleware de erro do Sentry irá capturá-lo
    throw new Error('🔧 Sentry test error triggered intentionally');
  });

  // ==================== REQUEST LOGGING ====================
  // Correlation ID e logging automático de requests
  const { requestLoggingMiddleware } = await import("./logging-middleware");
  app.use(requestLoggingMiddleware());

  // ==================== SECURITY: WAF & PROTECTION ====================
  // Web Application Firewall e proteções de segurança
  const { wafMiddleware, securityHeaders, forceHTTPS, csrfProtection } = await import("./waf");
  app.use(forceHTTPS); // Força HTTPS em produção
  app.use(securityHeaders); // Headers de segurança
  app.use(wafMiddleware); // WAF (SQL injection, XSS, etc)
  app.use(csrfProtection); // Proteção CSRF

  // ==================== SECURITY HEADERS (HELMET) ====================
  // Proteção contra vulnerabilidades web comuns
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://oauth.manus.im", "wss:", "ws:"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Necessário para carregar recursos externos
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // ==================== CORS CONFIGURATION ====================
  // BUG-009: Configurar CORS apropriadamente
  // Em produção no Railway, pegar a URL automaticamente
  const railwayUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    ...(railwayUrl ? [`https://${railwayUrl}`] : []),
  ];

  // Log de startup para debug
  console.log('[Server] Starting with configuration:', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    allowedOrigins,
    railwayUrl,
  });

  app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requisições sem origin (mobile apps, postman, health checks, etc)
      if (!origin) return callback(null, true);
      
      // Em produção, verificar allowedOrigins
      if (process.env.NODE_ENV === 'production') {
        // Permitir qualquer subdomínio do Railway
        if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
          return callback(null, true);
        }
        // Permitir origens configuradas
        if (allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed.replace('https://', '')))) {
          return callback(null, true);
        }
        // Em produção, bloquear origens desconhecidas mas logar
        logger.warn('CORS blocked origin in production', { origin });
        return callback(null, true); // Temporariamente permitir enquanto configura
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked origin', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  // ==================== RATE LIMITING ====================
  // BUG-004: Adicionar rate limiting
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 requisições por IP
    message: {
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authenticatedApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Usuários autenticados: 100 req/15min
    message: {
      error: 'Limite de requisições atingido. Aguarde antes de tentar novamente.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // ==================== STRIPE WEBHOOK ====================
  // BUG-001: Webhook do Stripe
  // IMPORTANTE: Deve vir ANTES do express.json()
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const sig = req.headers['stripe-signature'];
      
      if (!sig || !ENV.STRIPE_WEBHOOK_SECRET) {
        logger.warn('Webhook signature missing');
        return res.status(400).send('Webhook signature missing');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        logger.error(`Webhook signature verification failed`, err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Processar eventos
      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionChange(subscription);
            break;
          }
          case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentSucceeded(invoice);
            break;
          }
          case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentFailed(invoice);
            break;
          }
          default:
            logger.info('Unhandled webhook event type', { type: event.type });
        }

        res.json({ received: true });
      } catch (error) {
        logger.error('Error processing webhook', error);
        res.status(500).send('Webhook processing failed');
      }
    }
  );

  // ==================== BODY PARSERS ====================
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Simple email/password authentication
  app.use("/api/simple-auth", simpleAuthRouter);

  // ==================== tRPC API ====================
  app.use(
    "/api/trpc",
    publicApiLimiter, // Rate limiting para API pública
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ==================== STATIC FILES / VITE ====================
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    console.log('[Server] Production mode - serving static files');
    serveStatic(app);
  }

  // ==================== START SERVER ====================
  const port = parseInt(process.env.PORT || "3000");
  
  // Em produção, NÃO procurar por outra porta - usar exatamente a PORT definida
  // Em desenvolvimento, podemos procurar uma porta disponível
  const finalPort = process.env.NODE_ENV === "production" 
    ? port 
    : await findAvailablePort(port);

  if (finalPort !== port && process.env.NODE_ENV !== "production") {
    logger.warn(`Port ${port} is busy, using port ${finalPort} instead`);
  }

  // Em produção (containers), SEMPRE fazer bind em 0.0.0.0
  // Em desenvolvimento, também usar 0.0.0.0 para acesso externo
  const host = "0.0.0.0";

  console.log(`[Server] Attempting to bind to ${host}:${finalPort}`);
  
  server.listen(finalPort, host, () => {
    console.log(`[Server] ✅ Successfully bound to ${host}:${finalPort}`);
    logger.info(`Server running on http://${host}:${finalPort}/`);
  });
  
  server.on('error', (err) => {
    console.error('[Server] ❌ Failed to start:', err);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error('[Server] ❌ Startup error:', error);
  console.error('[Server] Stack:', error?.stack);
  logger.error('Failed to start server', error);
  process.exit(1);
});

// Captura de erros não tratados
process.on('uncaughtException', (error) => {
  console.error('[Server] ❌ Uncaught Exception:', error);
  console.error('[Server] Stack:', error?.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] ❌ Unhandled Rejection at:', promise);
  console.error('[Server] Reason:', reason);
  process.exit(1);
});

// Log inicial para confirmar que o módulo foi carregado
console.log('[Server] 🚀 Module loaded, starting initialization...');
console.log('[Server] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? '***configured***' : '❌ MISSING',
  JWT_SECRET: process.env.JWT_SECRET ? '***configured***' : '❌ MISSING',
});
