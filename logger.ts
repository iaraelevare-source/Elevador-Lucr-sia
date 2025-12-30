/**
 * Sistema de Logging Centralizado - Enhanced
 * 
 * Features:
 * - Logs estruturados com contexto
 * - Correlation ID para tracking de requests
 * - Níveis de log configuráveis
 * - Formatação JSON em produção
 * - Performance tracking
 */

import { randomUUID } from "crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogMeta {
  [key: string]: any;
}

export interface LogContext {
  correlationId?: string;
  userId?: number;
  requestPath?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  meta?: LogMeta;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    unit: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";
  private minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
  private context: LogContext = {};

  /**
   * Níveis de log em ordem de severidade
   */
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  /**
   * Define contexto global para todos os logs subsequentes
   */
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Limpa contexto global
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Cria um logger filho com contexto adicional
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  /**
   * Verifica se o nível de log deve ser exibido
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  /**
   * Formata e exibe o log
   */
  private log(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Merge context
    entry.context = { ...this.context, ...entry.context };

    if (this.isDevelopment) {
      // Desenvolvimento: formato legível
      const emoji = {
        debug: "🔍",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
      }[entry.level];

      const colorCode = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m",  // Green
        warn: "\x1b[33m",  // Yellow
        error: "\x1b[31m", // Red
      }[entry.level];

      const reset = "\x1b[0m";

      console.log(
        `${emoji} ${colorCode}[${entry.level.toUpperCase()}]${reset} ${entry.message}`,
        entry.context?.correlationId ? `[${entry.context.correlationId.slice(0, 8)}]` : "",
        entry.meta || "",
        entry.error || "",
        entry.performance ? `(${entry.performance.duration}${entry.performance.unit})` : ""
      );
    } else {
      // Produção: formato JSON estruturado
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, meta?: LogMeta, context?: LogContext) {
    this.log({
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      meta,
      context,
    });
  }

  /**
   * Log informativo
   */
  info(message: string, meta?: LogMeta, context?: LogContext) {
    this.log({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      meta,
      context,
    });
  }

  /**
   * Log de aviso
   */
  warn(message: string, meta?: LogMeta, context?: LogContext) {
    this.log({
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      meta,
      context,
    });
  }

  /**
   * Log de erro
   */
  error(message: string, error?: any, context?: LogContext) {
    const errorInfo = error
      ? {
          message: error?.message || String(error),
          stack: this.isDevelopment ? error?.stack : undefined,
          code: error?.code,
        }
      : undefined;

    this.log({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: errorInfo,
      context,
    });

    // TODO: Em produção, enviar para Sentry, LogRocket, etc
    // if (!this.isDevelopment && error) {
    //   Sentry.captureException(error, { extra: { message, context } });
    // }
  }

  /**
   * Medir performance de operações
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      
      this.log({
        level: "info",
        message: `Performance: ${label}`,
        timestamp: new Date().toISOString(),
        context,
        performance: {
          duration,
          unit: "ms",
        },
      });
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      
      this.log({
        level: "error",
        message: `Performance: ${label} (failed)`,
        timestamp: new Date().toISOString(),
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: this.isDevelopment && error instanceof Error ? error.stack : undefined,
        },
        context,
        performance: {
          duration,
          unit: "ms",
        },
      });
      
      throw error;
    }
  }

  /**
   * Gerar correlation ID único
   */
  generateCorrelationId(): string {
    return randomUUID();
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Middleware para adicionar correlation ID em requests
 */
export function createRequestLogger(req: any) {
  const correlationId = req.headers["x-correlation-id"] || logger.generateCorrelationId();
  
  return logger.child({
    correlationId,
    requestPath: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
}
