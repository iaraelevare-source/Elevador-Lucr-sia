/**
 * 🔍 SENTRY ERROR TRACKING CONFIGURATION
 * Integração completa de rastreamento de erros e performance monitoring
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Inicializar Sentry para capturar erros e performance
 */
export function initSentry(app: any) {
  if (!process.env.SENTRY_DSN) {
    console.warn("⚠️  SENTRY_DSN não configurada - error tracking desativado");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration({
        app,
        // Você pode adicionar mais opções aqui se necessário
      }),
    ],
    beforeSend(event, hint) {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers["authorization"];
        }
      }
      if (event.contexts) {
        delete event.contexts.trace?.user_id;
      }
      return event;
    },
    release: process.env.APP_VERSION || "1.0.0",
    // ignoreUrls e denyUrls não são mais suportados diretamente, use beforeSend para filtrar se necessário
  });

  return Sentry;
}

/**
 * Capturar exceção com contexto extra
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!process.env.SENTRY_DSN) {
    console.error("❌ Error:", error.message, context);
    return;
  }

  Sentry.captureException(error, {
    contexts: {
      ...(context && { custom: context }),
    },
  });
}

/**
 * Capturar mensagem com nível de severity
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, any>
) {
  if (!process.env.SENTRY_DSN) {
    console.log(`[${level.toUpperCase()}] ${message}`, context || "");
    return;
  }

  Sentry.captureMessage(message, level);

  if (context) {
    Sentry.setContext("custom", context);
  }
}

/**
 * Configurar tags para melhor organização de erros
 */
export function setErrorTags(tags: Record<string, string>) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setTags(tags);
}

/**
 * Configurar breadcrumb (rastreamento de ações)
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category: string = "default"
) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrapper para funções assíncronas
 */
export function withSentry<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, { args });
      throw error;
    }
  }) as T;
}

/**
 * Integração com tRPC para capturar erros automaticamente
 */
export const sentryTRPCMiddleware = () => (opts: any) => {
  return async (next: any) => {
    try {
      addBreadcrumb(
        `tRPC: ${opts.path}`,
        { type: opts.type, input: opts.input },
        "rpc"
      );
      return await next();
    } catch (error) {
      captureException(error as Error, {
        path: opts.path,
        type: opts.type,
      });
      throw error;
    }
  };
};

/**
 * Monitorar performance de queries
 */
export function monitorQuery(
  queryName: string,
  duration: number,
  success: boolean
) {
  if (!process.env.SENTRY_DSN) return;

  if (duration > 1000) {
    captureMessage(
      `Slow query detected: ${queryName} took ${duration}ms`,
      "warning",
      { queryName, duration, success }
    );
  }

  addBreadcrumb(`DB Query: ${queryName}`, { duration, success }, "database");
}

/**
 * Callback para erros não capturados
 */
export function setupGlobalErrorHandlers() {
  // Unhandled promise rejection
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    captureException(new Error(`Unhandled Rejection: ${reason}`), { promise });
  });

  // Uncaught exception
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    captureException(error, {});
    process.exit(1);
  });
}

export default Sentry;
