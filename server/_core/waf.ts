/**
 * 🛡️ WEB APPLICATION FIREWALL (WAF)
 * Proteção contra ataques comuns: SQL Injection, XSS, Path Traversal, etc.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

// Listas de bloqueio
const BLOCKED_IPS = new Set<string>();
const BLOCKED_USER_AGENTS = new Set<string>();
const SUSPICIOUS_PATTERNS: RegExp[] = [
  // SQL Injection
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b.*\b(FROM|INTO|WHERE|TABLE)\b)/gi,
  /(\-\-|;|\/\*|\*\/)/g,
  /(\bOR\b.*=.*\bOR\b)/gi,
  
  // XSS
  /<script[^>]*>.*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>/gi,
  
  // Path Traversal
  /\.\.[\/\\]/g,
  /(\/etc\/passwd|\/etc\/shadow)/gi,
  
  // Command Injection
  /(\||;|&|\$\(|\`)/g,
  /(bash|sh|cmd|powershell).*\-c/gi,
  
  // LDAP Injection
  /(\(|\)|\*|\||&)/g,
];

// Rate limiting por IP
const IP_REQUEST_COUNT = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_REQUESTS_PER_HOUR = 1000;

/**
 * Obtém IP real do request
 */
function getClientIP(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/**
 * Verifica se IP está bloqueado
 */
function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip);
}

/**
 * Bloqueia IP temporariamente
 */
export function blockIP(ip: string, durationMs = 3600000): void {
  BLOCKED_IPS.add(ip);
  logger.warn("IP blocked", { ip, durationMs });

  setTimeout(() => {
    BLOCKED_IPS.delete(ip);
    logger.info("IP unblocked", { ip });
  }, durationMs);
}

/**
 * Verifica rate limiting
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = IP_REQUEST_COUNT.get(ip);

  if (!record || record.resetAt < now) {
    IP_REQUEST_COUNT.set(ip, {
      count: 1,
      resetAt: now + 60000, // 1 minuto
    });
    return true;
  }

  record.count++;

  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  return true;
}

/**
 * Detecta padrões suspeitos na string
 */
function detectSuspiciousPattern(input: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza input removendo caracteres perigosos
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < >
    .replace(/['";]/g, "") // Remove aspas e ponto-e-vírgula
    .replace(/(\-\-|\/\*|\*\/)/g, "") // Remove comentários SQL
    .trim();
}

/**
 * Middleware WAF principal
 */
export function wafMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIP(req);
  const userAgent = req.headers["user-agent"] || "";
  const url = req.url;
  const method = req.method;

  // 1. Verificar IP bloqueado
  if (isIPBlocked(ip)) {
    logger.warn("Blocked IP attempted access", { ip, url, method });
    res.status(403).json({ error: "Access denied" });
    return;
  }

  // 2. Verificar User-Agent bloqueado
  if (BLOCKED_USER_AGENTS.has(userAgent)) {
    logger.warn("Blocked User-Agent attempted access", { userAgent, ip, url });
    res.status(403).json({ error: "Access denied" });
    return;
  }

  // 3. Rate limiting
  if (!checkRateLimit(ip)) {
    logger.warn("Rate limit exceeded", { ip, url, method });
    blockIP(ip, 300000); // Bloqueia por 5 minutos
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  // 4. Verificar URL suspeita
  if (detectSuspiciousPattern(url)) {
    logger.error("Suspicious URL pattern detected", { ip, url, method });
    blockIP(ip, 3600000); // Bloqueia por 1 hora
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  // 5. Verificar query params suspeitos
  const queryString = JSON.stringify(req.query);
  if (detectSuspiciousPattern(queryString)) {
    logger.error("Suspicious query parameter detected", { ip, url, query: req.query });
    blockIP(ip, 3600000);
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  // 6. Verificar body suspeito (POST/PUT)
  if ((method === "POST" || method === "PUT") && req.body) {
    const bodyString = JSON.stringify(req.body);
    if (detectSuspiciousPattern(bodyString)) {
      logger.error("Suspicious request body detected", { ip, url, method });
      blockIP(ip, 3600000);
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
  }

  // 7. Verificar headers suspeitos
  const suspiciousHeaders = ["x-forwarded-host", "x-original-url", "x-rewrite-url"];
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      logger.warn("Suspicious header detected", { ip, url, header });
    }
  }

  // Request válido - continua
  next();
}

/**
 * Middleware para proteção CSRF
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Apenas para métodos que modificam dados
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    return next();
  }

  // Verificar Origin/Referer
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.VITE_APP_URL || "http://localhost:5173",
    "https://elevare.ai",
    "https://www.elevare.ai",
  ];

  if (!origin || !allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    logger.warn("CSRF attempt detected", {
      ip: getClientIP(req),
      origin,
      url: req.url,
    });
    res.status(403).json({ error: "CSRF validation failed" });
    return;
  }

  next();
}

/**
 * Middleware para forçar HTTPS
 */
export function forceHTTPS(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    logger.info("Redirecting to HTTPS", { originalUrl: req.url });
    res.redirect(301, httpsUrl);
    return;
  }
  next();
}

/**
 * Headers de segurança
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Proteção XSS
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // CSP (Content Security Policy)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  // Prevenir clickjacking
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  next();
}

/**
 * Limpa cache de rate limiting periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of IP_REQUEST_COUNT.entries()) {
    if (record.resetAt < now) {
      IP_REQUEST_COUNT.delete(ip);
    }
  }
}, 60000); // A cada 1 minuto
