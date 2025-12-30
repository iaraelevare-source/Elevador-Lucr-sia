/**
 * Logging Middleware para Express
 * 
 * Adiciona logging automático para todas as requests
 * com correlation ID, performance tracking e error handling
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Middleware para logging de requests
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  
  // Gerar ou usar correlation ID existente
  const correlationId = 
    (req.headers["x-correlation-id"] as string) || 
    logger.generateCorrelationId();
  
  // Adicionar correlation ID no header de resposta
  res.setHeader("X-Correlation-ID", correlationId);
  
  // Criar logger com contexto da request
  const requestLogger = logger.child({
    correlationId,
    requestPath: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  });
  
  // Adicionar logger no request para uso posterior
  (req as any).logger = requestLogger;
  
  // Log de início da request
  requestLogger.info("Request started", {
    query: req.query,
    body: req.method !== "GET" ? sanitizeBody(req.body) : undefined,
  });
  
  // Capturar quando a resposta termina
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? "warn" : "info";
    
    requestLogger[level]("Request completed", {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.getHeader("content-length"),
    });
  });
  
  // Capturar erros
  res.on("error", (error: Error) => {
    const duration = Date.now() - startTime;
    
    requestLogger.error("Request failed", error, {
      duration: `${duration}ms`,
    });
  });
  
  next();
}

/**
 * Sanitizar body para não logar informações sensíveis
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== "object") {
    return body;
  }
  
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "apiKey",
    "api_key",
    "authorization",
    "creditCard",
    "credit_card",
    "cvv",
    "ssn",
  ];
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(body)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Middleware para error handling com logging
 */
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestLogger = (req as any).logger || logger;
  
  requestLogger.error("Unhandled error in request", error, {
    requestPath: req.path,
    method: req.method,
    body: sanitizeBody(req.body),
    query: req.query,
  });
  
  // Não enviar stack trace em produção
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  res.status(500).json({
    error: "Internal Server Error",
    message: isDevelopment ? error.message : "An unexpected error occurred",
    correlationId: (req as any).logger?.context?.correlationId,
    ...(isDevelopment && { stack: error.stack }),
  });
}

/**
 * Helper para obter logger da request
 */
export function getRequestLogger(req: Request) {
  return (req as any).logger || logger;
}
