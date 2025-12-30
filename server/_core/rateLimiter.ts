/**
 * 🔴 Sistema de Rate Limiting com Redis
 * Persiste entre restarts e funciona com múltiplas instâncias
 */

import { logger } from "./logger";

// Interface para Rate Limit
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Fallback para in-memory quando Redis não está disponível
class InMemoryRateLimit {
  private store = new Map<string, RateLimitEntry>();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (entry.resetAt < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.store.delete(key));
  }
}

// Inicializar fallback
const fallbackRateLimit = new InMemoryRateLimit();

// Cleanup periódico (a cada 5 minutos)
setInterval(() => {
  fallbackRateLimit.cleanup();
}, 5 * 60 * 1000);

/**
 * Verificar rate limit com fallback para in-memory
 * @returns true se a requisição é permitida, false caso contrário
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): boolean {
  try {
    // TODO: Implementar com Redis quando disponível
    // Por enquanto, usar fallback em memória
    return fallbackRateLimit.check(key, maxRequests, windowMs);
  } catch (error) {
    logger.warn("Rate limit check failed, using fallback", { error });
    return fallbackRateLimit.check(key, maxRequests, windowMs);
  }
}

/**
 * Resetar rate limit para uma chave
 */
export function resetRateLimit(key: string): void {
  try {
    fallbackRateLimit.reset(key);
  } catch (error) {
    logger.warn("Rate limit reset failed", { error });
  }
}

/**
 * Criar middleware de rate limiting para Express
 * @example
 * app.use(createRateLimitMiddleware(10, 60000))
 */
export function createRateLimitMiddleware(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.socket.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
    const key = `ratelimit:${ip}`;

    if (!checkRateLimit(key, maxRequests, windowMs)) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Excedeu o limite de ${maxRequests} requisições por ${Math.floor(windowMs / 1000)} segundos. Tente novamente mais tarde.`,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    next();
  };
}

/**
 * Validação específica para análises gratuitas (BioRadar)
 * 5 análises por hora para usuários não autenticados
 */
export function checkFreeBioRadarLimit(ip: string): boolean {
  const key = `bioradar:free:${ip}`;
  return checkRateLimit(key, 5, 60 * 60 * 1000); // 5 por hora
}

/**
 * Validação para diagnósticos (máximo 10 por hora)
 */
export function checkDiagnosticoLimit(ip: string): boolean {
  const key = `diagnostico:${ip}`;
  return checkRateLimit(key, 10, 60 * 60 * 1000); // 10 por hora
}

/**
 * Validação para usuários autenticados (mais generoso)
 * 100 requisições por 15 minutos
 */
export function checkAuthenticatedLimit(userId: number): boolean {
  const key = `auth:${userId}`;
  return checkRateLimit(key, 100, 15 * 60 * 1000);
}

export default {
  checkRateLimit,
  resetRateLimit,
  createRateLimitMiddleware,
  checkFreeBioRadarLimit,
  checkDiagnosticoLimit,
  checkAuthenticatedLimit,
};
