/**
 * 📧 Templates de Email - Elevare
 * Templates HTML responsivos e profissionais
 */

// ==================== BASE LAYOUT ====================

const baseLayout = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Elevare</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; }
    .content p { color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; font-size: 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .info-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-box h3 { color: #374151; margin: 0 0 10px 0; font-size: 16px; }
    .info-box p { color: #6b7280; margin: 0; font-size: 14px; }
    .highlight { background-color: #eff6ff; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0 0 8px 0; }
    .footer a { color: #6366f1; text-decoration: none; }
    .badge { display: inline-block; background-color: #6366f1; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Elevare</h1>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Elevare. Todos os direitos reservados.</p>
      <p>Este email foi enviado para você porque você está cadastrado na plataforma Elevare.</p>
      <p><a href="https://elevare.app/lgpd">Política de Privacidade</a> | <a href="https://elevare.app/unsubscribe">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>
`;

// ==================== TEMPLATES ====================

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl?: string;
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2>Bem-vindo(a) ao Elevare! 🎉</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>É com grande prazer que damos as boas-vindas à nossa plataforma de Neurovendas com IA!</p>
      
      <div class="highlight">
        <p><strong>🚀 O que você pode fazer agora:</strong></p>
        <ul style="color: #4b5563; line-height: 2;">
          <li>Fazer o Quiz de Perfil de Vendedor</li>
          <li>Explorar o Dashboard de Insights</li>
          <li>Usar a IA para criar abordagens personalizadas</li>
          <li>Acessar conteúdos exclusivos de treinamento</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl || 'https://elevare.app/dashboard'}" class="button">Acessar meu Dashboard</a>
      </div>
      
      <p>Se tiver qualquer dúvida, nossa equipe está pronta para ajudar!</p>
      <p>Sucesso em suas vendas! 💪</p>
    </div>
  `;
  
  return {
    subject: "🎉 Bem-vindo(a) ao Elevare - Sua jornada começa agora!",
    html: baseLayout(content, "Bem-vindo ao Elevare! Sua conta foi criada com sucesso."),
  };
}

export interface SubscriptionConfirmationData {
  userName: string;
  planName: string;
  monthlyCredits: number;
  renewalDate: string;
  dashboardUrl?: string;
}

export function subscriptionConfirmationEmail(data: SubscriptionConfirmationData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2>Assinatura Confirmada! ✅</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Sua assinatura do plano <span class="badge">${data.planName}</span> foi confirmada com sucesso!</p>
      
      <div class="info-box">
        <h3>📋 Detalhes da sua assinatura:</h3>
        <p><strong>Plano:</strong> ${data.planName}</p>
        <p><strong>Créditos mensais:</strong> ${data.monthlyCredits === -1 ? "Ilimitados" : data.monthlyCredits}</p>
        <p><strong>Próxima renovação:</strong> ${data.renewalDate}</p>
      </div>
      
      <div class="highlight">
        <p>🎁 <strong>Seus benefícios estão ativos!</strong> Aproveite todos os recursos premium da plataforma.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl || 'https://elevare.app/dashboard'}" class="button">Explorar Recursos Premium</a>
      </div>
      
      <p>Obrigado por confiar no Elevare!</p>
    </div>
  `;
  
  return {
    subject: `✅ Assinatura ${data.planName} confirmada - Elevare`,
    html: baseLayout(content, `Sua assinatura ${data.planName} foi confirmada com sucesso!`),
  };
}

export interface LowCreditsData {
  userName: string;
  creditsRemaining: number;
  upgradeUrl?: string;
}

export function lowCreditsEmail(data: LowCreditsData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2>⚠️ Créditos Acabando</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Notamos que seus créditos estão acabando. Você tem apenas <strong style="color: #ef4444; font-size: 20px;">${data.creditsRemaining}</strong> créditos restantes.</p>
      
      <div class="info-box" style="background-color: #fef2f2; border-left: 4px solid #ef4444;">
        <h3 style="color: #b91c1c;">📊 Seu uso:</h3>
        <p>Créditos restantes: <strong>${data.creditsRemaining}</strong></p>
        <p>Quando seus créditos acabarem, algumas funcionalidades ficarão limitadas.</p>
      </div>
      
      <div class="highlight">
        <p><strong>💡 Dica:</strong> Faça upgrade do seu plano para continuar usando todos os recursos sem interrupções!</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.upgradeUrl || 'https://elevare.app/upgrade'}" class="button" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">Fazer Upgrade Agora</a>
      </div>
      
      <p>Precisa de ajuda para escolher o melhor plano? Entre em contato conosco!</p>
    </div>
  `;
  
  return {
    subject: `⚠️ Apenas ${data.creditsRemaining} créditos restantes - Elevare`,
    html: baseLayout(content, `Seus créditos estão acabando. Apenas ${data.creditsRemaining} restantes.`),
  };
}

export interface RenewalReminderData {
  userName: string;
  planName: string;
  renewalDate: string;
  amount: string;
  manageUrl?: string;
}

export function renewalReminderEmail(data: RenewalReminderData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2>🔄 Lembrete de Renovação</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Este é um lembrete amigável de que sua assinatura será renovada em breve.</p>
      
      <div class="info-box">
        <h3>📋 Detalhes da renovação:</h3>
        <p><strong>Plano:</strong> ${data.planName}</p>
        <p><strong>Data de renovação:</strong> ${data.renewalDate}</p>
        <p><strong>Valor:</strong> ${data.amount}</p>
      </div>
      
      <div class="highlight">
        <p>✅ <strong>Não é necessária nenhuma ação.</strong> A renovação será feita automaticamente na data indicada.</p>
      </div>
      
      <p>Se desejar fazer alguma alteração na sua assinatura:</p>
      
      <div style="text-align: center;">
        <a href="${data.manageUrl || 'https://elevare.app/subscription'}" class="button">Gerenciar Assinatura</a>
      </div>
      
      <p>Obrigado por continuar conosco!</p>
    </div>
  `;
  
  return {
    subject: `🔄 Sua assinatura será renovada em ${data.renewalDate} - Elevare`,
    html: baseLayout(content, `Lembrete: sua assinatura ${data.planName} será renovada em ${data.renewalDate}.`),
  };
}

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetData): { subject: string; html: string } {
  const content = `
    <div class="content">
      <h2>🔐 Redefinição de Senha</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no Elevare.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetUrl}" class="button">Redefinir Minha Senha</a>
      </div>
      
      <div class="info-box" style="background-color: #fef3c7; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e;">⏰ Importante:</h3>
        <p>Este link expira em <strong>${data.expiresIn}</strong>.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
      </div>
      
      <div class="highlight">
        <p><strong>🔒 Dica de segurança:</strong> Nunca compartilhe este link com ninguém. Nossa equipe nunca pedirá sua senha.</p>
      </div>
      
      <p>Se tiver problemas com o botão, copie e cole este link no navegador:</p>
      <p style="word-break: break-all; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 10px; border-radius: 4px;">${data.resetUrl}</p>
    </div>
  `;
  
  return {
    subject: "🔐 Redefinir sua senha - Elevare",
    html: baseLayout(content, "Solicitação de redefinição de senha para sua conta Elevare."),
  };
}
