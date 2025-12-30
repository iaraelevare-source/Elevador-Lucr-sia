/**
 * Classes de Erro Customizadas
 * BUG-008: Melhorar tratamento de erros
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, public originalError?: any) {
    super(message, 'AI_SERVICE_ERROR', 503);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message: string) {
    super(message, 'INSUFFICIENT_CREDITS', 402);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Você não tem permissão para acessar este recurso') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND', 404);
  }
}
