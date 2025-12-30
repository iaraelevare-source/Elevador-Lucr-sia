/**
 * 🔄 SECRETS ROTATION
 * Sistema de rotação automática de segredos
 */

import { randomBytes } from "crypto";
import { logger } from "./logger";
import { encrypt, decrypt } from "./encryption";

interface Secret {
  id: string;
  value: string;
  version: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface RotationPolicy {
  maxAge: number; // Idade máxima em milissegundos
  gracePeriod: number; // Período de graça para aceitar versão antiga
  autoRotate: boolean; // Rotacionar automaticamente
}

// Store de secrets em memória (em produção, usar AWS Secrets Manager ou Vault)
const SECRETS_STORE = new Map<string, Secret[]>();

// Políticas de rotação
const DEFAULT_ROTATION_POLICY: RotationPolicy = {
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 dias
  gracePeriod: 7 * 24 * 60 * 60 * 1000, // 7 dias
  autoRotate: true,
};

const ROTATION_POLICIES = new Map<string, RotationPolicy>([
  ["jwt", { maxAge: 30 * 24 * 60 * 60 * 1000, gracePeriod: 2 * 24 * 60 * 60 * 1000, autoRotate: true }],
  ["stripe", { maxAge: 180 * 24 * 60 * 60 * 1000, gracePeriod: 14 * 24 * 60 * 60 * 1000, autoRotate: false }],
  ["gemini", { maxAge: 365 * 24 * 60 * 60 * 1000, gracePeriod: 30 * 24 * 60 * 60 * 1000, autoRotate: false }],
  ["encryption", { maxAge: 90 * 24 * 60 * 60 * 1000, gracePeriod: 7 * 24 * 60 * 60 * 1000, autoRotate: true }],
]);

/**
 * Gera novo secret aleatório
 */
function generateSecret(length = 32): string {
  return randomBytes(length).toString("base64url");
}

/**
 * Cria novo secret
 */
export function createSecret(
  id: string,
  value: string,
  version = 1,
  maxAgeMs?: number
): Secret {
  const now = new Date();
  const policy = ROTATION_POLICIES.get(id) || DEFAULT_ROTATION_POLICY;
  const maxAge = maxAgeMs || policy.maxAge;

  const secret: Secret = {
    id,
    value: encrypt(value), // Criptografa o valor
    version,
    createdAt: now,
    expiresAt: new Date(now.getTime() + maxAge),
    isActive: true,
  };

  // Adiciona ao store
  const secrets = SECRETS_STORE.get(id) || [];
  secrets.push(secret);
  SECRETS_STORE.set(id, secrets);

  logger.info("Secret created", { id, version, expiresAt: secret.expiresAt });

  return secret;
}

/**
 * Obtém secret ativo
 */
export function getSecret(id: string, version?: number): string | null {
  const secrets = SECRETS_STORE.get(id);
  if (!secrets || secrets.length === 0) return null;

  let secret: Secret | undefined;

  if (version !== undefined) {
    secret = secrets.find((s: Secret) => s.version === version && s.isActive);
  } else {
    // Pega a versão mais recente ativa
    secret = secrets
      .filter((s: Secret) => s.isActive)
      .sort((a: Secret, b: Secret) => b.version - a.version)[0];
  }

  if (!secret) return null;

  // Verifica se expirou
  const now = new Date();
  const policy = ROTATION_POLICIES.get(id) || DEFAULT_ROTATION_POLICY;
  const isExpired = now > secret.expiresAt;
  const isInGracePeriod = now <= new Date(secret.expiresAt.getTime() + policy.gracePeriod);

  if (isExpired && !isInGracePeriod) {
    logger.warn("Secret expired", { id, version: secret.version });
    return null;
  }

  if (isExpired && isInGracePeriod) {
    logger.warn("Secret in grace period", { id, version: secret.version });
  }

  return decrypt(secret.value);
}

/**
 * Rotaciona secret
 */
export function rotateSecret(id: string, newValue?: string): Secret {
  const secrets = SECRETS_STORE.get(id) || [];
  const currentSecret = secrets
    .filter((s: Secret) => s.isActive)
    .sort((a: Secret, b: Secret) => b.version - a.version)[0];

  const newVersion = currentSecret ? currentSecret.version + 1 : 1;
  const value = newValue || generateSecret();

  const newSecret = createSecret(id, value, newVersion);

  // Desativa versão anterior após período de graça
  if (currentSecret) {
    const policy = ROTATION_POLICIES.get(id) || DEFAULT_ROTATION_POLICY;
    setTimeout(() => {
      currentSecret.isActive = false;
      logger.info("Previous secret version deactivated", {
        id,
        version: currentSecret.version,
      });
    }, policy.gracePeriod);
  }

  logger.info("Secret rotated", { id, oldVersion: currentSecret?.version, newVersion });

  return newSecret;
}

/**
 * Verifica se secret precisa de rotação
 */
export function needsRotation(id: string): boolean {
  const secrets = SECRETS_STORE.get(id);
  if (!secrets || secrets.length === 0) return true;

  const activeSecret = secrets
    .filter((s: Secret) => s.isActive)
    .sort((a: Secret, b: Secret) => b.version - a.version)[0];

  if (!activeSecret) return true;

  const now = new Date();
  const policy = ROTATION_POLICIES.get(id) || DEFAULT_ROTATION_POLICY;
  const ageMs = now.getTime() - activeSecret.createdAt.getTime();
  const shouldRotate = ageMs >= policy.maxAge * 0.8; // Rotaciona a 80% da vida útil

  return shouldRotate;
}

/**
 * Rotação automática de todos os secrets
 */
export function autoRotateSecrets(): void {
  for (const [id, policy] of ROTATION_POLICIES.entries()) {
    if (!policy.autoRotate) continue;

    if (needsRotation(id)) {
      logger.info("Auto-rotating secret", { id });
      rotateSecret(id);
    }
  }
}

/**
 * Inicializa secrets a partir de ENV
 */
export function initializeSecrets(): void {
  const secrets = [
    { id: "jwt", value: process.env.JWT_SECRET },
    { id: "stripe", value: process.env.STRIPE_SECRET_KEY },
    { id: "gemini", value: process.env.GEMINI_API_KEY },
    { id: "encryption", value: process.env.ENCRYPTION_KEY },
  ];

  for (const secret of secrets) {
    if (secret.value) {
      createSecret(secret.id, secret.value);
      logger.info("Secret initialized", { id: secret.id });
    }
  }

  logger.info("Secrets initialization complete");
}

/**
 * Agenda rotação automática
 */
export function scheduleAutoRotation(intervalMs = 24 * 60 * 60 * 1000): NodeJS.Timeout {
  const timer = setInterval(() => {
    logger.info("Running scheduled secrets rotation");
    autoRotateSecrets();
  }, intervalMs);

  // Primeira execução imediata
  autoRotateSecrets();

  return timer;
}

/**
 * Lista todos os secrets (apenas metadados, sem valores)
 */
export function listSecrets(): Array<Omit<Secret, "value">> {
  const result: Array<Omit<Secret, "value">> = [];

  for (const [id, secrets] of SECRETS_STORE.entries()) {
    const activeSecrets = secrets
      .filter((s: Secret) => s.isActive)
      .sort((a: Secret, b: Secret) => b.version - a.version);

    for (const secret of activeSecrets) {
      result.push({
        id: secret.id,
        version: secret.version,
        createdAt: secret.createdAt,
        expiresAt: secret.expiresAt,
        isActive: secret.isActive,
      });
    }
  }

  return result;
}

/**
 * Valida secret contra valor
 */
export function validateSecret(id: string, valueToValidate: string): boolean {
  const secrets = SECRETS_STORE.get(id);
  if (!secrets) return false;

  // Verifica contra todas as versões ativas
  for (const secret of secrets.filter((s: Secret) => s.isActive)) {
    try {
      const decryptedValue = decrypt(secret.value);
      if (decryptedValue === valueToValidate) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

// Inicializa secrets ao carregar módulo
if (process.env.NODE_ENV !== "test") {
  initializeSecrets();
  scheduleAutoRotation();
}
