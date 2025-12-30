# 📧 Sistema de Email - Elevare AI

Sistema completo de emails transacionais com suporte para **SendGrid** e **Resend**.

---

## 🚀 Configuração

### Variáveis de Ambiente

Adicione no `.env` ou nas variáveis do Railway:

```bash
# Email Provider (escolha um)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx     # Para usar SendGrid
# OU
RESEND_API_KEY=re_xxxxxxxxxxxxx       # Para usar Resend

# Configurações de remetente
EMAIL_FROM=noreply@elevare.ai         # Email remetente
EMAIL_FROM_NAME=Elevare AI            # Nome do remetente
```

### Como Obter as Chaves

#### SendGrid
1. Acesse https://sendgrid.com
2. Crie uma conta (plano gratuito: 100 emails/dia)
3. Vá em Settings → API Keys
4. Crie uma nova API Key com permissões de envio
5. Copie a chave e adicione em `SENDGRID_API_KEY`

#### Resend
1. Acesse https://resend.com
2. Crie uma conta (plano gratuito: 100 emails/dia, 3.000/mês)
3. Vá em API Keys
4. Crie uma nova API Key
5. Copie a chave e adicione em `RESEND_API_KEY`

---

## 📚 Uso

### Via tRPC (Frontend)

```typescript
import { trpc } from '@/lib/trpc';

// Enviar email de boas-vindas
const { mutate: sendWelcome } = trpc.email.sendWelcomeEmail.useMutation();

sendWelcome({
  to: 'usuario@example.com',
  userName: 'João Silva',
  loginUrl: 'https://elevare.ai/login',
});

// Enviar confirmação de assinatura
const { mutate: sendConfirmation } = trpc.email.sendSubscriptionConfirmation.useMutation();

sendConfirmation({
  to: 'usuario@example.com',
  userName: 'João Silva',
  planName: 'PRO',
  credits: 100,
  renewalDate: '01/02/2025',
  dashboardUrl: 'https://elevare.ai/dashboard',
});
```

### Via Backend (Server-side)

```typescript
import { emailClient } from './email/client';
import { welcomeEmail } from './email/templates';

// Envio direto
await emailClient.send({
  to: 'usuario@example.com',
  subject: 'Bem-vindo!',
  html: welcomeEmail({
    userName: 'João Silva',
    loginUrl: 'https://elevare.ai/login',
  }),
});

// Envio em lote
await emailClient.sendBatch([
  {
    to: 'user1@example.com',
    subject: 'Assunto 1',
    html: '<p>Conteúdo 1</p>',
  },
  {
    to: 'user2@example.com',
    subject: 'Assunto 2',
    html: '<p>Conteúdo 2</p>',
  },
]);
```

---

## 📧 Templates Disponíveis

### 1. Welcome Email (Boas-vindas)
Enviado quando um novo usuário se cadastra.

**Dados necessários**:
- `userName`: Nome do usuário
- `loginUrl`: URL para fazer login

### 2. Subscription Confirmation (Confirmação de Assinatura)
Enviado quando uma assinatura é confirmada.

**Dados necessários**:
- `userName`: Nome do usuário
- `planName`: Nome do plano (PRO, PRO+, etc.)
- `credits`: Quantidade de créditos
- `renewalDate`: Data de renovação
- `dashboardUrl`: URL do dashboard

### 3. Credits Low (Créditos Baixos)
Enviado quando os créditos estão acabando.

**Dados necessários**:
- `userName`: Nome do usuário
- `creditsRemaining`: Créditos restantes
- `planName`: Nome do plano atual
- `upgradeUrl`: URL para upgrade

### 4. Renewal Reminder (Lembrete de Renovação)
Enviado alguns dias antes da renovação automática.

**Dados necessários**:
- `userName`: Nome do usuário
- `planName`: Nome do plano
- `renewalDate`: Data de renovação
- `amount`: Valor da renovação
- `manageSubscriptionUrl`: URL para gerenciar assinatura

### 5. Password Reset (Redefinição de Senha)
Enviado quando o usuário solicita redefinição de senha.

**Dados necessários**:
- `userName`: Nome do usuário
- `resetUrl`: URL para redefinir senha
- `expiresIn`: Tempo de expiração (ex: "24 horas")

---

## 🧪 Testando

### Modo Mock (Desenvolvimento)

Se nenhuma API key for configurada, o sistema usa um provider mock que apenas loga os emails no console.

### Enviar Email de Teste

```typescript
// Via tRPC (apenas em desenvolvimento ou para admins)
const { mutate: sendTest } = trpc.email.sendTestEmail.useMutation();

sendTest({
  to: 'seu-email@example.com',
});
```

---

## 🎨 Customização de Templates

Os templates estão em `server/email/templates/index.ts`.

Para criar um novo template:

1. Defina a interface de dados:
```typescript
export interface MyCustomEmailData {
  userName: string;
  customField: string;
}
```

2. Crie a função do template:
```typescript
export function myCustomEmail(data: MyCustomEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyle}
    </head>
    <body>
      <div class="header">
        <h1>Título</h1>
      </div>
      <div class="content">
        <p>Olá ${data.userName}</p>
        <p>${data.customField}</p>
      </div>
      <div class="footer">
        <p>© 2025 Elevare AI</p>
      </div>
    </body>
    </html>
  `;
}
```

3. Adicione endpoint no router (`server/routers/email.ts`).

---

## 📊 Monitoramento

Todos os envios são logados com:
- Email do destinatário
- Assunto
- Status (sucesso/erro)
- Message ID (para tracking)

Verifique os logs no Railway ou localmente para acompanhar os envios.

---

## 🔒 Segurança

- ✅ Validação de email format
- ✅ Rate limiting aplicado via tRPC
- ✅ Apenas usuários autenticados podem enviar
- ✅ Emails de teste bloqueados em produção (exceto admins)
- ✅ API keys nunca expostas no frontend

---

## 📈 Limites dos Planos Gratuitos

| Provider | Emails/Dia | Emails/Mês |
|----------|-----------|------------|
| SendGrid | 100       | 3.000      |
| Resend   | 100       | 3.000      |

Para volumes maiores, considere fazer upgrade nos respectivos providers.

---

## 🆘 Troubleshooting

### Emails não estão sendo enviados

1. Verifique se a API key está configurada corretamente
2. Confira os logs para ver mensagens de erro
3. Teste com o endpoint `sendTestEmail`
4. Verifique se o email remetente está verificado no provider

### Emails caindo no spam

1. Configure SPF, DKIM e DMARC no seu domínio
2. Use um domínio personalizado (não @gmail.com)
3. Evite palavras "spam" no assunto
4. Mantenha uma boa reputação de envio

---

## 🚀 Próximos Passos

- [ ] Adicionar suporte para anexos
- [ ] Implementar fila de emails (Bull/Redis)
- [ ] Adicionar analytics de abertura/clique
- [ ] Criar mais templates (newsletter, etc.)
- [ ] Integrar com sistema de notificações

---

**Desenvolvido com ❤️ pela equipe Elevare AI**
