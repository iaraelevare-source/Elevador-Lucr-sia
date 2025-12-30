/**
 * Email Templates
 * 
 * Templates HTML profissionais para emails transacionais
 */

const baseStyle = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 10px 10px;
    }
    .credits-box {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
`;

export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export function welcomeEmail(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>🚀 Bem-vindo ao Elevare AI!</h1>
      </div>
      <div class="content">
        <p>Olá <strong>${data.userName}</strong>,</p>
        
        <p>É um prazer tê-lo conosco! Você acaba de entrar para uma plataforma revolucionária de neurovendas com inteligência artificial.</p>
        
        <p><strong>O que você pode fazer agora:</strong></p>
        <ul>
          <li>🎯 Analisar perfis do Instagram com o Radar de Bio</li>
          <li>📚 Criar e-books profissionais automaticamente</li>
          <li>🤖 Gerar prompts para Midjourney e DALL-E</li>
          <li>📱 Criar anúncios para Instagram, Facebook e Google</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="button">Acessar Plataforma</a>
        </div>
        
        <p>Se precisar de ajuda, nossa equipe está à disposição!</p>
        
        <p>Abraços,<br><strong>Equipe Elevare AI</strong></p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI - Neurovendas com Inteligência Artificial</p>
        <p>Este é um email automático, por favor não responda.</p>
      </div>
    </body>
    </html>
  `;
}

export interface SubscriptionConfirmationData {
  userName: string;
  planName: string;
  credits: number;
  renewalDate: string;
  dashboardUrl: string;
}

export function subscriptionConfirmationEmail(data: SubscriptionConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>✅ Assinatura Confirmada!</h1>
      </div>
      <div class="content">
        <p>Olá <strong>${data.userName}</strong>,</p>
        
        <p>Sua assinatura do plano <strong>${data.planName}</strong> foi confirmada com sucesso! 🎉</p>
        
        <div class="credits-box">
          <h3>📊 Detalhes da Assinatura</h3>
          <p><strong>Plano:</strong> ${data.planName}</p>
          <p><strong>Créditos mensais:</strong> ${data.credits === -1 ? 'Ilimitados' : data.credits}</p>
          <p><strong>Próxima renovação:</strong> ${data.renewalDate}</p>
        </div>
        
        <p>Seus créditos já estão disponíveis e você pode começar a usar todas as funcionalidades premium agora mesmo!</p>
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="button">Ir para Dashboard</a>
        </div>
        
        <p>Obrigado por confiar na Elevare AI!</p>
        
        <p>Abraços,<br><strong>Equipe Elevare AI</strong></p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI - Neurovendas com Inteligência Artificial</p>
        <p>Dúvidas? Entre em contato conosco.</p>
      </div>
    </body>
    </html>
  `;
}

export interface CreditsLowData {
  userName: string;
  creditsRemaining: number;
  planName: string;
  upgradeUrl: string;
}

export function creditsLowEmail(data: CreditsLowData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>⚠️ Seus Créditos Estão Acabando</h1>
      </div>
      <div class="content">
        <p>Olá <strong>${data.userName}</strong>,</p>
        
        <p>Notamos que você está com poucos créditos disponíveis.</p>
        
        <div class="credits-box">
          <h3>📊 Status Atual</h3>
          <p><strong>Créditos restantes:</strong> ${data.creditsRemaining}</p>
          <p><strong>Plano atual:</strong> ${data.planName}</p>
        </div>
        
        <p>Para continuar usando todas as funcionalidades sem interrupções, considere fazer upgrade do seu plano!</p>
        
        <div style="text-align: center;">
          <a href="${data.upgradeUrl}" class="button">Ver Planos</a>
        </div>
        
        <p><strong>Dica:</strong> Seus créditos serão renovados automaticamente na próxima data de renovação.</p>
        
        <p>Abraços,<br><strong>Equipe Elevare AI</strong></p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI - Neurovendas com Inteligência Artificial</p>
      </div>
    </body>
    </html>
  `;
}

export interface RenewalReminderData {
  userName: string;
  planName: string;
  renewalDate: string;
  amount: string;
  manageSubscriptionUrl: string;
}

export function renewalReminderEmail(data: RenewalReminderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>🔄 Renovação Automática em Breve</h1>
      </div>
      <div class="content">
        <p>Olá <strong>${data.userName}</strong>,</p>
        
        <p>Este é um lembrete amigável de que sua assinatura será renovada automaticamente em breve.</p>
        
        <div class="credits-box">
          <h3>📋 Detalhes da Renovação</h3>
          <p><strong>Plano:</strong> ${data.planName}</p>
          <p><strong>Data de renovação:</strong> ${data.renewalDate}</p>
          <p><strong>Valor:</strong> ${data.amount}</p>
        </div>
        
        <p>Após a renovação, seus créditos serão recarregados e você continuará tendo acesso a todas as funcionalidades premium.</p>
        
        <p>Se desejar alterar ou cancelar sua assinatura, você pode fazer isso a qualquer momento:</p>
        
        <div style="text-align: center;">
          <a href="${data.manageSubscriptionUrl}" class="button">Gerenciar Assinatura</a>
        </div>
        
        <p>Obrigado por continuar conosco!</p>
        
        <p>Abraços,<br><strong>Equipe Elevare AI</strong></p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI - Neurovendas com Inteligência Artificial</p>
      </div>
    </body>
    </html>
  `;
}

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>🔐 Redefinir Senha</h1>
      </div>
      <div class="content">
        <p>Olá <strong>${data.userName}</strong>,</p>
        
        <p>Recebemos uma solicitação para redefinir sua senha da conta Elevare AI.</p>
        
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center;">
          <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
        </div>
        
        <p><strong>⚠️ Importante:</strong> Este link expira em ${data.expiresIn}.</p>
        
        <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
        
        <p>Abraços,<br><strong>Equipe Elevare AI</strong></p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI - Neurovendas com Inteligência Artificial</p>
        <p>Por segurança, nunca compartilhe este email com ninguém.</p>
      </div>
    </body>
    </html>
  `;
}
