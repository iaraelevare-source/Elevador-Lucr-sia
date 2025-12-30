/**
 * Funções Utilitárias Compartilhadas
 * BUG-011: Remover código duplicado
 */

import { logger } from "../../server/_core/logger";

/**
 * Parse seguro de JSON
 * Evita duplicação de try-catch em múltiplos lugares
 */
export function safeParse<T = any>(jsonString: string | null | undefined): T | null {
  if (!jsonString) return null;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.error('Erro ao parsear JSON', { jsonString, error });
    return null;
  }
}

/**
 * Validação de propriedade de recurso
 * Evita duplicação de verificação de ownership
 */
export function assertOwnership(
  resource: { userId: number | null },
  currentUserId: number,
  errorMessage: string = "Você não tem permissão para acessar este recurso"
): void {
  if (resource.userId && resource.userId !== currentUserId) {
    throw new Error(errorMessage);
  }
}

/**
 * Formatar datas de forma consistente
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Truncar texto com ellipsis
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sanitizar entrada de usuário (básico)
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
