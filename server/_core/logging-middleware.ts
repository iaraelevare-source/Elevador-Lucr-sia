/**
 * 📊 Request Logging Middleware - Elevare
 * Automatic HTTP request/response logging with correlation ID
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { logger, forRequest, generateCorrelationId } from "../adapters/loggingAdapter";

// ==================== TYPES ====================

interface RequestLogMeta {
  method: string;
  path: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  userId?: number;
  correlationId: string;
  [key: string]: unknown;
}

interface ResponseLogMeta extends RequestLogMeta {
  statusCode: number;
  duration: string;
  contentLength?: string;
}

// ==================== CONFIG ====================

const SENSITIVE_PATHS = ["/api/auth", "/api/stripe/webhook"];
const SKIP_PATHS = ["/api/health", "/favicon.ico"];
const MAX_BODY_LOG_SIZE = 1000; // characters

// ==================== HELPERS ====================

function sanitizeBody(body: unknown): Record<string, unknown> | undefined {
  if (!body || typeof body !== "object") return undefined;
  
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ["password", "senha", "token", "secret", "apiKey", "creditCard", "cvv"];
  
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 100) {
      sanitized[key] = value.slice(0, 100) + "...[truncated]";
    } else {
      sanitized[key] = value;
    }
  }
  
  const str = JSON.stringify(sanitized);
  if (str.length > MAX_BODY_LOG_SIZE) {
    return { _truncated: true, _size: str.length };
  }
  
  return sanitized;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function formatDuration(startTime: [number, number]): string {
  const diff = process.hrtime(startTime);
  const ms = diff[0] * 1000 + diff[1] / 1e6;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ==================== MIDDLEWARE ====================

/**
 * Request logging middleware
 * Adds correlation ID and logs request/response
 */
export function requestLoggingMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip health checks and static files
    if (SKIP_PATHS.some(p => req.path.startsWith(p))) {
      return next();
    }

    const startTime = process.hrtime();
    
    // Get or generate correlation ID
    const correlationId =
      (req.headers["x-correlation-id"] as string) ||
      generateCorrelationId();
    
    // Add correlation ID to response headers
    res.setHeader("x-correlation-id", correlationId);
    
    // Create request-scoped logger
    // Garantir que o adapter receba o correlationId já definido
    (req.headers as any)["x-correlation-id"] = correlationId;

    const reqLogger = forRequest({
      headers: req.headers as Record<string, string | string[] | undefined>,
      method: req.method,
      path: req.path,
      ip: getClientIp(req),
      user: (req as any).user,
    });

    // Attach logger to request for use in handlers
    (req as any).logger = reqLogger;
    (req as any).correlationId = correlationId;

    // Build request meta
    const requestMeta: RequestLogMeta = {
      method: req.method,
      path: req.path,
      correlationId,
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"]?.slice(0, 100),
    };

    // Add query params (non-sensitive paths only)
    if (!SENSITIVE_PATHS.some(p => req.path.startsWith(p))) {
      if (Object.keys(req.query).length > 0) {
        requestMeta.query = req.query as Record<string, unknown>;
      }
      if (req.body && Object.keys(req.body).length > 0) {
        requestMeta.body = sanitizeBody(req.body);
      }
    }

    // Log request start
    reqLogger.info("Request started", requestMeta as Record<string, unknown>);

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function(this: Response, chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      const duration = formatDuration(startTime);
      
      const responseMeta: ResponseLogMeta = {
        ...requestMeta,
        statusCode: res.statusCode,
        duration,
        contentLength: res.getHeader("content-length") as string | undefined,
      };

      // Log based on status code
      if (res.statusCode >= 500) {
        reqLogger.error("Request failed", undefined, responseMeta as Record<string, unknown>);
      } else if (res.statusCode >= 400) {
        reqLogger.warn("Request client error", responseMeta as Record<string, unknown>);
      } else {
        reqLogger.info("Request completed", responseMeta as Record<string, unknown>);
      }

      return originalEnd(chunk, encoding as BufferEncoding, cb);
    } as typeof res.end;

    next();
  };
}

/**
 * Error logging middleware
 * Must be registered AFTER all routes
 */
export function errorLoggingMiddleware() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const reqLogger = (req as any).logger || logger;
    const correlationId = (req as any).correlationId || "unknown";

    reqLogger.error("Unhandled error", err, {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode || 500,
    });

    // Don't expose error details in production
    const isProduction = process.env.NODE_ENV === "production";
    
    if (!res.headersSent) {
      res.status(500).json({
        error: isProduction ? "Internal server error" : err.message,
        correlationId,
        ...(isProduction ? {} : { stack: err.stack }),
      });
    }

    next(err);
  };
}

// ==================== EXPRESS AUGMENTATION ====================

declare global {
  namespace Express {
    interface Request {
      logger?: any;
      correlationId?: string;
    }
  }
}
