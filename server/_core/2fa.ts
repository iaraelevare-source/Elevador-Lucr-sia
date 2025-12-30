/**
 * 🔐 TWO-FACTOR AUTHENTICATION (2FA) - Admin Only
 * Implementação de TOTP (Time-based One-Time Password)
 */

import * as OTPAuth from "otpauth";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * Gera secret e QR code para configurar 2FA
 */
export async function generate2FASecret(
  userId: number,
  email: string
): Promise<TwoFactorSetup> {
  try {
    // Gerar secret aleatório
    const totp = new OTPAuth.TOTP({
      issuer: "Elevare AI",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    // Gerar QR code URI
    const qrCode = totp.toString();

    // Gerar backup codes (8 códigos de 8 dígitos)
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    logger.info("2FA secret generated", { userId, email });

    return {
      secret,
      qrCode,
      backupCodes,
    };
  } catch (error) {
    logger.error("Failed to generate 2FA secret", { userId, error });
    throw new Error("Erro ao gerar 2FA");
  }
}

/**
 * Verifica código TOTP
 */
export function verify2FACode(secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const delta = totp.validate({ token, window: 1 }); // Aceita 1 período antes/depois
    return delta !== null;
  } catch (error) {
    logger.error("Failed to verify 2FA code", { error });
    return false;
  }
}

/**
 * Verifica se usuário tem 2FA ativado
 */
export async function has2FAEnabled(userId: number): Promise<boolean> {
  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorSecret })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return !!(user?.twoFactorSecret && user.twoFactorSecret.length > 0);
}

/**
 * Ativa 2FA para usuário
 */
export async function enable2FA(
  userId: number,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        twoFactorEnabled: true,
      })
      .where(eq(users.id, userId));

    logger.info("2FA enabled for user", { userId });
  } catch (error) {
    logger.error("Failed to enable 2FA", { userId, error });
    throw new Error("Erro ao ativar 2FA");
  }
}

/**
 * Desativa 2FA para usuário
 */
export async function disable2FA(userId: number): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorEnabled: false,
      })
      .where(eq(users.id, userId));

    logger.info("2FA disabled for user", { userId });
  } catch (error) {
    logger.error("Failed to disable 2FA", { userId, error });
    throw new Error("Erro ao desativar 2FA");
  }
}

/**
 * Verifica backup code
 */
export async function verifyBackupCode(
  userId: number,
  code: string
): Promise<boolean> {
  try {
    const [user] = await db
      .select({ twoFactorBackupCodes: users.twoFactorBackupCodes })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.twoFactorBackupCodes) return false;

    const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes);
    const index = backupCodes.indexOf(code.toUpperCase());

    if (index === -1) return false;

    // Remove backup code usado
    backupCodes.splice(index, 1);

    await db
      .update(users)
      .set({
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      })
      .where(eq(users.id, userId));

    logger.info("Backup code used", { userId, remainingCodes: backupCodes.length });

    return true;
  } catch (error) {
    logger.error("Failed to verify backup code", { userId, error });
    return false;
  }
}
