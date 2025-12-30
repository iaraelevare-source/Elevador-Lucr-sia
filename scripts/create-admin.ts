/**
 * 🔐 Script de Seed para criar primeiro usuário admin
 * Executar com: npx tsx scripts/create-admin.ts
 */

import "dotenv/config";
import { getDb } from "../server/db";
import { users, subscription } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { logger } from "../server/_core/logger";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@elevare.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!@#";

async function createAdminUser() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Erro ao conectar com o banco de dados");
    }

    // Verificar se admin já existe
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin) {
      console.log("✅ Admin já existe:", existingAdmin.email);
      console.log("   ID:", existingAdmin.id);
      if (existingAdmin.role) {
        console.log("   Role:", existingAdmin.role);
      }
      return;
    }

    // Criar novo usuário admin
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);


    // Inserir apenas campos válidos conforme o schema
    const [adminUser] = await db
      .insert(users)
      .values({
        name: "Admin Elevare",
        openId: "admin-seed-openid",
        email: ADMIN_EMAIL,
        role: "admin",
        // loginMethod pode ser preenchido se necessário
      })
      .$returningId();

    console.log("✅ Admin criado com sucesso!");
    console.log("   Email:", ADMIN_EMAIL);
    console.log("   ID:", adminUser.id);

    // Criar subscription padrão (plano profissional)
    const [adminSub] = await db
      .insert(subscription)
      .values({
        userId: adminUser.id,
        plan: "profissional",
        status: "active",
        creditsRemaining: -1, // Ilimitado
        monthlyCreditsLimit: -1,
      })
      .$returningId();

    console.log("✅ Subscription criada!");
    console.log("   Plan: profissional");
    console.log("   Status: active");

    console.log("\n🔐 IMPORTANTE - Altere a senha do admin:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha temporária: ${ADMIN_PASSWORD}`);
    console.log("\n⚠️  SEGURANÇA:");
    console.log("   - Mude a senha imediatamente no dashboard");
    console.log("   - Não compartilhe essas credenciais");
    console.log("   - Use ADMIN_EMAIL e ADMIN_PASSWORD como variáveis de ambiente\n");

  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    process.exit(1);
  }
}

// Executar
createAdminUser().then(() => {
  console.log("✨ Script concluído!");
  process.exit(0);
});

export default createAdminUser;
