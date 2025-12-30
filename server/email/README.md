# 📧 Sistema de Emails - Elevare

Sistema completo de emails transacionais com suporte a múltiplos providers.

## 🚀 Quick Start

### Desenvolvimento (sem configuração)

Em desenvolvimento, o sistema usa um **mock** que loga os emails no console:

```bash
pnpm dev
# Emails serão exibidos no console em vez de enviados
```

### Produção

Configure **uma** das variáveis de ambiente:

```env
# Opção 1: SendGrid (recomendado)
SENDGRID_API_KEY=SG.xxx

# Opção 2: Resend
RESEND_API_KEY=re_xxx

# Opcional: Email de origem
EMAIL_FROM=Elevare <noreply@elevare.app>
```

## 📦 Estrutura

```
server/email/
├── client.ts      # Cliente de envio (SendGrid/Resend/Mock)
├── templates.ts   # 5 templates HTML responsivos
├── index.ts       # Exports centralizados
└── README.md      # Esta documentação
```

## 🎨 Templates Disponíveis

| Template | Função | Uso |
|----------|--------|-----|
| `welcomeEmail` | Boas-vindas | Após cadastro |
| `subscriptionConfirmationEmail` | Confirmação de assinatura | Após pagamento |
| `lowCreditsEmail` | Alerta de créditos baixos | Quando créditos < 10 |
| `renewalReminderEmail` | Lembrete de renovação | 3 dias antes |
| `passwordResetEmail` | Redefinição de senha | Solicitação de reset |

## 🔌 API Endpoints (tRPC)

### Endpoints Protegidos (requer autenticação)

```typescript
// Enviar boas-vindas
trpc.email.sendWelcome.mutate({
  userName: "João",
  email: "joao@example.com",
  dashboardUrl: "https://elevare.app/dashboard"
});

// Confirmar assinatura
trpc.email.sendSubscriptionConfirmation.mutate({
  userName: "João",
  email: "joao@example.com",
  planName: "Profissional",
  monthlyCredits: 500,
  renewalDate: "15/01/2026"
});

// Alerta de créditos baixos
trpc.email.sendLowCreditsAlert.mutate({
  userName: "João",
  email: "joao@example.com",
  creditsRemaining: 5
});

// Lembrete de renovação
trpc.email.sendRenewalReminder.mutate({
  userName: "João",
  email: "joao@example.com",
  planName: "Essencial",
  renewalDate: "20/01/2026",
  amount: "R$ 49,90"
});
```

### Endpoint Público (não requer autenticação)

```typescript
// Redefinição de senha
trpc.email.sendPasswordReset.mutate({
  userName: "João",
  email: "joao@example.com",
  resetUrl: "https://elevare.app/reset?token=abc123",
  expiresIn: "1 hora"
});
```

### Endpoints Admin

```typescript
// Ver configuração
const config = await trpc.email.getConfig.query();
// { provider: "sendgrid", configured: true, defaultFrom: "..." }

// Testar templates (apenas desenvolvimento)
await trpc.email.testEmail.mutate({
  to: "test@example.com",
  template: "welcome" // ou "subscription", "lowCredits", "renewal", "passwordReset"
});
```

## 🛠️ Uso Direto (Server-side)

```typescript
import { sendEmail, welcomeEmail } from "../email";

// Gerar template
const template = welcomeEmail({ userName: "Maria" });

// Enviar
const result = await sendEmail({
  to: "maria@example.com",
  subject: template.subject,
  html: template.html,
});

if (result.success) {
  console.log("Enviado!", result.messageId);
}
```

## 🔧 Providers Suportados

### SendGrid
- **Grátis:** 100 emails/dia
- **Setup:** https://sendgrid.com/free
- **Variável:** `SENDGRID_API_KEY`

### Resend
- **Grátis:** 100 emails/dia, 3.000/mês
- **Setup:** https://resend.com
- **Variável:** `RESEND_API_KEY`

### Mock (Desenvolvimento)
- Usado quando nenhuma API key está configurada
- Loga emails completos no console
- Perfeito para testar sem gastar créditos

## 📋 Customização de Templates

Os templates usam CSS inline para compatibilidade máxima. Para customizar:

```typescript
// server/email/templates.ts

// Cores principais (gradiente Elevare)
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

// Modificar o baseLayout para alterar header/footer globalmente
const baseLayout = (content: string, preheader?: string) => `...`;
```

## ❓ Troubleshooting

### Email não enviado em produção
1. Verifique se `SENDGRID_API_KEY` ou `RESEND_API_KEY` está configurada
2. Confira os logs do servidor
3. Verifique se o domínio está verificado no provider

### Templates não renderizam corretamente
- Alguns clientes de email (Outlook) têm suporte CSS limitado
- Use CSS inline (já implementado)
- Teste em https://litmus.com ou https://emailonacid.com

### Rate limiting
- SendGrid: 100/dia grátis
- Resend: 3.000/mês grátis
- Para maior volume, faça upgrade do plano

## 📊 Logs

O sistema registra todos os envios via Pino logger:

```json
{
  "level": "info",
  "msg": "Email sent via SendGrid",
  "to": "user@example.com",
  "subject": "Bem-vindo ao Elevare",
  "messageId": "sg-xxx"
}
```

## 🔐 Segurança

- API keys nunca são expostas no frontend
- Endpoint de teste só funciona em desenvolvimento
- Rate limiting aplicado automaticamente
- Validação de input com Zod
