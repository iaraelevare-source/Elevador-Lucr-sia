import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  transport: !isProd
    ? {
        target: 'pino-pretty',
        options: { 
          ignore: 'pid,hostname', 
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o' 
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function getLogger(serviceName: string, correlationId?: string) {
  const bindings: Record<string, any> = { service: serviceName };
  if (correlationId) bindings.correlationId = correlationId;
  return baseLogger.child(bindings);
}

// Logger específico para database
export const dbLogger = getLogger('database');

// Logger específico para API
export const apiLogger = getLogger('api');

// Logger específico para IA
export const aiLogger = getLogger('ai-service');
