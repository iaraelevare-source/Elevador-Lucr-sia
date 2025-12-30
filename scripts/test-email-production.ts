/**
 * 📧 Script de Teste de Email em Produção
 * 
 * Testa todos os 5 templates de email com SendGrid/Resend
 * Execução: pnpm tsx scripts/test-email-production.ts
 * 
 * IMPORTANTE: Só envia emails para o endereço configurado (não envia para usuários reais)
 */

import {
  sendEmail,
  welcomeEmail,
  subscriptionConfirmationEmail,
  lowCreditsEmail,
  renewalReminderEmail,
  passwordResetEmail,
} from "../server/adapters/emailAdapter";

// 🔧 CONFIGURAÇÃO
const TEST_EMAIL = process.env.TEST_EMAIL || "your-email@example.com";
const DRY_RUN = process.env.DRY_RUN === "true"; // Se true, não envia de verdade

// 🎨 Cores para console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color: keyof typeof colors, emoji: string, message: string) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

// ✅ Validar configuração
function validateConfig() {
  log("blue", "🔍", "Validando configuração...");

  if (TEST_EMAIL === "your-email@example.com") {
    log("red", "❌", "ERRO: Configure TEST_EMAIL no .env ou via variável de ambiente");
    log("yellow", "💡", 'Exemplo: TEST_EMAIL=seu-email@gmail.com pnpm tsx scripts/test-email-production.ts');
    process.exit(1);
  }

  const hasSendGrid = !!process.env.SENDGRID_API_KEY;
  const hasResend = !!process.env.RESEND_API_KEY;

  if (!hasSendGrid && !hasResend) {
    log("red", "❌", "ERRO: Configure SENDGRID_API_KEY ou RESEND_API_KEY no .env");
    process.exit(1);
  }

  const provider = hasSendGrid ? "SendGrid" : "Resend";
  log("green", "✅", `Provider configurado: ${provider}`);
  log("cyan", "📧", `Emails serão enviados para: ${TEST_EMAIL}`);

  if (DRY_RUN) {
    log("yellow", "⚠️", "Modo DRY_RUN ativado - Nenhum email será enviado de verdade");
  }

  return provider;
}

// Utilitário: sleep
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 📧 Testar um template específico
async function testTemplate(
  name: string,
  template: { subject: string; html: string }
) {
  log("blue", "📨", `Testando: ${name}...`);

  if (DRY_RUN) {
    log("yellow", "⏭️", "  [DRY RUN] Email não enviado");
    return { success: true, dryRun: true };
  }

  try {
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: `[TESTE] ${template.subject}`,
      html: template.html,
    });

    if (result.success) {
      log("green", "✅", `  Enviado! Message ID: ${result.messageId || "N/A"}`);
      return { success: true, messageId: result.messageId };
    } else {
      log("red", "❌", `  Falhou: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    log("red", "❌", `  Erro inesperado: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 🎯 Executar todos os testes
async function runAllTests() {
  console.log("\n");
  log("cyan", "🚀", "=".repeat(60));
  log("cyan", "📧", "TESTE DE EMAILS EM PRODUÇÃO - Elevare AI");
  log("cyan", "🚀", "=".repeat(60));
  console.log("\n");

  const provider = validateConfig();

  console.log("\n");
  log("blue", "📋", "Iniciando testes...");
  console.log("\n");

  const results: Record<string, any> = {};

  // Template 1: Boas-vindas
  results.welcome = await testTemplate(
    "1. Email de Boas-vindas",
    welcomeEmail({
      userName: "João Silva (Teste)",
      dashboardUrl: "https://elevare.app/dashboard",
    })
  );
  await sleep(2000); // Delay entre emails

  // Template 2: Confirmação de Assinatura
  results.subscription = await testTemplate(
    "2. Confirmação de Assinatura",
    subscriptionConfirmationEmail({
      userName: "Maria Santos (Teste)",
      planName: "Profissional",
      monthlyCredits: 500,
      renewalDate: "15/01/2026",
    })
  );
  await sleep(2000);

  // Template 3: Créditos Baixos
  results.lowCredits = await testTemplate(
    "3. Alerta de Créditos Baixos",
    lowCreditsEmail({
      userName: "Carlos Oliveira (Teste)",
      creditsRemaining: 5,
    })
  );
  await sleep(2000);

  // Template 4: Lembrete de Renovação
  results.renewal = await testTemplate(
    "4. Lembrete de Renovação",
    renewalReminderEmail({
      userName: "Ana Costa (Teste)",
      planName: "Essencial",
      renewalDate: "20/01/2026",
      amount: "R$ 49,90",
    })
  );
  await sleep(2000);

  // Template 5: Reset de Senha
  results.passwordReset = await testTemplate(
    "5. Redefinição de Senha",
    passwordResetEmail({
      userName: "Pedro Almeida (Teste)",
      resetUrl: "https://elevare.app/reset?token=abc123test",
      expiresIn: "1 hora",
    })
  );

  // 📊 Relatório Final
  console.log("\n");
  log("cyan", "📊", "=".repeat(60));
  log("cyan", "📈", "RELATÓRIO DE TESTES");
  log("cyan", "📊", "=".repeat(60));
  console.log("\n");

  const total = Object.keys(results).length;
  const successful = Object.values(results).filter((r) => r.success).length;
  const failed = total - successful;

  log("blue", "📧", `Provider: ${provider}`);
  log("blue", "📬", `Email de teste: ${TEST_EMAIL}`);
  log("blue", "📝", `Total de templates: ${total}`);
  log("green", "✅", `Sucesso: ${successful}`);
  if (failed > 0) {
    log("red", "❌", `Falhas: ${failed}`);
  }

  console.log("\n");

  if (DRY_RUN) {
    log("yellow", "⚠️", "Modo DRY_RUN - Nenhum email foi enviado de verdade");
  } else {
    log("cyan", "📥", `Verifique sua caixa de entrada: ${TEST_EMAIL}`);
    log("yellow", "💡", "Nota: Emails de teste têm prefixo [TESTE] no assunto");
  }

  console.log("\n");

  // Detalhes de falhas (se houver)
  const failedTests = Object.entries(results).filter(([_, r]) => !r.success);
  if (failedTests.length > 0 && !DRY_RUN) {
    log("red", "🔥", "FALHAS DETECTADAS:");
    console.log("\n");
    failedTests.forEach(([name, result]) => {
      log("red", "  ❌", `${name}: ${result.error}`);
    });
    console.log("\n");
  }

  // Status final
  if (successful === total) {
    log("green", "🎉", "TODOS OS TESTES PASSARAM! Sistema de email funcionando ✅");
    process.exit(0);
  } else {
    log("red", "💥", `${failed} teste(s) falharam. Verifique a configuração do provider.`);
    process.exit(1);
  }
}

// 🚀 Executar
runAllTests().catch((error) => {
  log("red", "💥", `Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
