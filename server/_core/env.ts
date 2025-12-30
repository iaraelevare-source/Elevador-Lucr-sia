/**
 * Gerenciamento de Variáveis de Ambiente
 * BUG-002: Validação de credenciais obrigatórias
 * 🔒 SEGURANÇA: Validação rigorosa em produção
 */

import { z } from "zod";

// Schema de validação RIGOROSA para produção
const productionEnvSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter no mínimo 32 caracteres")
    .refine(
      (val) => val !== 'dev-secret-change-in-production-32chars',
      "JWT_SECRET não pode usar valor padrão de desenvolvimento"
    ),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL deve ser uma URL válida")
    .startsWith("mysql://", "DATABASE_URL deve começar com mysql://"),
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith("sk_live_", "STRIPE_SECRET_KEY deve começar com sk_live_ em produção"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", "STRIPE_WEBHOOK_SECRET deve começar com whsec_"),
  STRIPE_ESSENCIAL_PRICE_ID: z
    .string()
    .startsWith("price_", "STRIPE_ESSENCIAL_PRICE_ID inválido"),
  STRIPE_PROFISSIONAL_PRICE_ID: z
    .string()
    .startsWith("price_", "STRIPE_PROFISSIONAL_PRICE_ID inválido"),
});

/**
 * 🔒 Validar variáveis críticas em startup
 * Chame esta função no início do servidor
 */
export function validateEnvOnStartup(): void {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    console.log("🔒 [ENV] Validando variáveis de ambiente em PRODUÇÃO...");
    
    const result = productionEnvSchema.safeParse(process.env);
    
    if (!result.success) {
      console.error("❌ [ENV] ERRO CRÍTICO - Variáveis inválidas:");
      result.error.issues.forEach((issue) => {
        console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
      });
      console.error("\n⛔ Servidor não pode iniciar com configuração insegura.");
      process.exit(1);
    }
    
    // Validações adicionais de segurança
    if (process.env.JWT_SECRET === 'dev-secret-change-in-production-32chars') {
      console.error("❌ [ENV] JWT_SECRET está usando valor padrão de desenvolvimento!");
      process.exit(1);
    }
    
    console.log("✅ [ENV] Todas as variáveis validadas com sucesso");
  } else {
    console.log("⚠️  [ENV] Modo desenvolvimento - validação relaxada");
  }
}

function getRequiredEnv(key: string, defaultForDev?: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    // Em desenvolvimento ou se houver default, usar default
    if (defaultForDev && process.env.NODE_ENV !== 'production') {
      console.warn(`[ENV] Using default value for ${key} in development`);
      return defaultForDev;
    }
    // Em produção, logar erro mas não crashar
    console.error(`[ENV] Missing required variable: ${key}`);
    return defaultForDev || '';
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

// Validar ambiente de produção
const isProduction = process.env.NODE_ENV === "production";

export const ENV = {
  // App ID - opcional com valor padrão
  appId: getOptionalEnv('VITE_APP_ID', 'elevare-production'),
  
  // Obrigatórias - com defaults para não crashar
  cookieSecret: getRequiredEnv('JWT_SECRET', 'dev-secret-change-in-production-32chars'),
  databaseUrl: getRequiredEnv('DATABASE_URL', ''),
  oAuthServerUrl: getOptionalEnv('OAUTH_SERVER_URL', 'https://oauth.manus.im'),
  ownerOpenId: getOptionalEnv('OWNER_OPEN_ID', 'admin'),
  
  // Forge API - Opcional (funcionalidade de IA não funcionará sem)
  forgeApiUrl: getOptionalEnv('BUILT_IN_FORGE_API_URL'),
  forgeApiKey: getOptionalEnv('BUILT_IN_FORGE_API_KEY'),
  
  // Stripe - opcional
  STRIPE_SECRET_KEY: getOptionalEnv('STRIPE_SECRET_KEY', 'sk_test_placeholder'),
  STRIPE_ESSENCIAL_PRICE_ID: getOptionalEnv('STRIPE_ESSENCIAL_PRICE_ID'),
  STRIPE_PROFISSIONAL_PRICE_ID: getOptionalEnv('STRIPE_PROFISSIONAL_PRICE_ID'),
  STRIPE_WEBHOOK_SECRET: getOptionalEnv('STRIPE_WEBHOOK_SECRET'),
  
  // Encryption key para criptografia em repouso
  ENCRYPTION_KEY: getOptionalEnv('ENCRYPTION_KEY', 'change-this-to-secure-32-char-key!'),
  
  isProduction,
};

// Validações de segurança - apenas avisos, não crashar
if (ENV.cookieSecret.length < 32) {
  console.warn('[ENV] JWT_SECRET should be at least 32 characters for security');
}

if (!ENV.databaseUrl) {
  console.warn('[ENV] DATABASE_URL not set - database features will not work');
}

// Logger não pode ser importado aqui pois causa dependência circular
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Environment variables loaded');
}

export const env = ENV;
