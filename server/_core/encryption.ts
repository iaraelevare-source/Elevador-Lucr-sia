/**
 * 🔒 DATA ENCRYPTION AT REST
 * Criptografia de dados sensíveis em repouso
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { logger } from "./logger";
import { ENV } from "./env";

// Algoritmo de criptografia
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Deriva chave de criptografia a partir de senha
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Obtém chave master de encryption
 */
function getMasterKey(): string {
  const key = ENV.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  
  if (!key || key === "your-32-char-encryption-key-here") {
    logger.warn("ENCRYPTION_KEY not set - using default (INSECURE)");
    return "change-this-to-secure-32-char-key!";
  }

  return key;
}

/**
 * Criptografa dados sensíveis
 */
export function encrypt(plaintext: string): string {
  try {
    const masterKey = getMasterKey();
    const salt = randomBytes(SALT_LENGTH);
    const key = deriveKey(masterKey, salt);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Formato: salt:iv:tag:encrypted
    const result = [
      salt.toString("hex"),
      iv.toString("hex"),
      tag.toString("hex"),
      encrypted,
    ].join(":");

    return result;
  } catch (error) {
    logger.error("Encryption failed", { error });
    throw new Error("Falha ao criptografar dados");
  }
}

/**
 * Descriptografa dados
 */
export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    
    if (parts.length !== 4) {
      throw new Error("Formato de dados criptografados inválido");
    }

    const [saltHex, ivHex, tagHex, encrypted] = parts;

    const masterKey = getMasterKey();
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const key = deriveKey(masterKey, salt);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Decryption failed", { error });
    throw new Error("Falha ao descriptografar dados");
  }
}

/**
 * Hash seguro para senhas (one-way)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verifica senha contra hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [saltHex, hashHex] = hashedPassword.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const hash = scryptSync(password, salt, 64);
    return hash.toString("hex") === hashHex;
  } catch {
    return false;
  }
}

/**
 * Criptografa objeto JSON
 */
export function encryptJSON<T>(data: T): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Descriptografa objeto JSON
 */
export function decryptJSON<T>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted) as T;
}

/**
 * Mascara dados sensíveis para logs
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars) {
    return "***";
  }
  
  const visible = data.slice(-visibleChars);
  const masked = "*".repeat(data.length - visibleChars);
  return masked + visible;
}

/**
 * Redact campos sensíveis de objeto
 */
export function redactSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = ["password", "token", "secret", "apiKey", "creditCard"]
): T {
  const redacted: Record<string, any> = { ...obj };

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) =>
      lowerKey.includes(field.toLowerCase())
    );

    if (isSensitive && typeof redacted[key] === "string") {
      redacted[key] = maskSensitiveData(redacted[key]);
    }
  }

  return redacted as T;
}
