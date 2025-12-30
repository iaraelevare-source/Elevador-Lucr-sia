/**
 * 📊 Sistema de Logging Avançado - Elevare
 * Features: Correlation ID, Performance Tracking, Structured Logging
 */

import { nanoid } from "nanoid";

// ==================== TYPES ====================

interface LogMeta {
  [key: string]: unknown;
}

interface LogContext {
  correlationId?: string;
  userId?: number;
  requestPath?: string;
  method?: string;
  ip?: string;
  [key: string]: unknown;
}

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  meta?: LogMeta;
  duration?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

// ==================== CONFIG ====================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_FIELDS = [
  "password",
  "senha",
  "token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "creditCard",
  "cvv",
];

// ==================== HELPERS ====================

function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLogLevel()];
}

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ==================== COLORS (Dev Only) ====================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const levelColors: Record<LogLevel, string> = {
  debug: colors.gray,
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
};

const levelIcons: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️ ",
  warn: "⚠️ ",
  error: "❌",
};

// ==================== LOGGER CLASS ====================

class Logger {
  private context: LogContext = {};
  private isProduction = process.env.NODE_ENV === "production";

  constructor(context?: LogContext) {
    if (context) {
      this.context = context;
    }
  }

  /**
   * Create a child logger with inherited context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Generate a new correlation ID
   */
  static generateCorrelationId(): string {
    return nanoid(12);
  }

  /**
   * Set correlation ID for this logger instance
   */
  setCorrelationId(id: string): this {
    this.context.correlationId = id;
    return this;
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string | undefined {
    return this.context.correlationId;
  }

  private formatLog(entry: LogEntry): void {
    if (this.isProduction) {
      // JSON format for production (easy to parse by log aggregators)
      console.log(JSON.stringify({
        ...entry,
        context: sanitize(entry.context),
        meta: sanitize(entry.meta),
      }));
    } else {
      // Pretty format for development
      const color = levelColors[entry.level];
      const icon = levelIcons[entry.level];
      const corrId = entry.context?.correlationId 
        ? `${colors.dim}[${entry.context.correlationId}]${colors.reset} `
        : "";
      
      const levelLabel = `${color}[${entry.level.toUpperCase()}]${colors.reset}`;
      const meta = entry.meta ? ` ${colors.dim}${JSON.stringify(sanitize(entry.meta))}${colors.reset}` : "";
      const duration = entry.duration ? ` ${colors.cyan}(${entry.duration})${colors.reset}` : "";
      
      console.log(`${icon} ${levelLabel} ${corrId}${entry.message}${meta}${duration}`);
      
      if (entry.error?.stack) {
        console.log(`${colors.dim}${entry.error.stack}${colors.reset}`);
      }
    }
  }

  private log(level: LogLevel, message: string, meta?: LogMeta, error?: Error): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: Object.keys(this.context).length > 0 ? this.context : undefined,
      meta: meta && Object.keys(meta).length > 0 ? meta : undefined,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
        code: (error as any).code,
      };
    }

    this.formatLog(entry);
  }

  debug(message: string, meta?: LogMeta): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log("warn", message, meta);
  }

  error(message: string, error?: unknown, meta?: LogMeta): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log("error", message, meta, err);
  }

  /**
   * Time an async operation
   * @example
   * const result = await logger.time('fetch-users', async () => {
   *   return await db.users.findMany();
   * });
   */
  async time<T>(label: string, fn: () => Promise<T>, meta?: LogMeta): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = formatDuration(performance.now() - start);
      this.info(`${label} completed`, { ...meta, duration });
      return result;
    } catch (error) {
      const duration = formatDuration(performance.now() - start);
      this.error(`${label} failed`, error, { ...meta, duration });
      throw error;
    }
  }

  /**
   * Time a sync operation
   */
  timeSync<T>(label: string, fn: () => T, meta?: LogMeta): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = formatDuration(performance.now() - start);
      this.info(`${label} completed`, { ...meta, duration });
      return result;
    } catch (error) {
      const duration = formatDuration(performance.now() - start);
      this.error(`${label} failed`, error, { ...meta, duration });
      throw error;
    }
  }

  /**
   * Create a request logger with correlation ID
   */
  static forRequest(req: { 
    headers?: Record<string, string | string[] | undefined>;
    method?: string;
    path?: string;
    ip?: string;
    user?: { id?: number };
  }): Logger {
    const correlationId = 
      (req.headers?.["x-correlation-id"] as string) || 
      Logger.generateCorrelationId();
    
    return new Logger({
      correlationId,
      method: req.method,
      requestPath: req.path,
      ip: req.ip,
      userId: req.user?.id,
    });
  }
}

// ==================== SINGLETON EXPORT ====================

export const logger = new Logger();
export { Logger, LogLevel, LogMeta, LogContext, LogEntry };

