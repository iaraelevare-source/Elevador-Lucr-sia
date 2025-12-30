// Adapter to toggle between core logger and features_elevare logger

import * as core from "../_core/logger";
import * as feat from "../../features_elevare/logging/logger";

const useFeatures = process.env.USE_FEATURES_LOGGER === "true";

// Unified exports
export type LogLevel = core.LogLevel;
export type LogMeta = core.LogMeta;
export type LogContext = core.LogContext;
export type LogEntry = core.LogEntry;

// Singleton logger (delegated)
export const logger = useFeatures ? feat.logger : core.logger;

// Helper to create child loggers in a unified way
export function child(context: LogContext) {
  if (useFeatures && typeof (feat.logger as any).child === "function") {
    return (feat.logger as any).child(context);
  }
  return (core.logger as any).child(context);
}

// Helper to create request-scoped logger (correlation ID)
export function forRequest(req: { 
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  path?: string;
  ip?: string;
  user?: { id?: number };
}) {
  if (useFeatures && typeof (feat as any).createRequestLogger === "function") {
    return (feat as any).createRequestLogger(req);
  }
  return core.Logger.forRequest(req);
}

// Correlation ID helper
export function generateCorrelationId(): string {
  if (useFeatures && typeof (feat.logger as any).generateCorrelationId === "function") {
    return (feat.logger as any).generateCorrelationId();
  }
  return core.Logger.generateCorrelationId();
}
