# 🚀 GUIA COMPLETO DE DEPLOYMENT

## Índice
1. [Pré-Requisitos](#pré-requisitos)
2. [Checklist Pre-Launch](#checklist-pre-launch)
3. [Deployment Railway](#deployment-railway)
4. [Deployment Vercel](#deployment-vercel)
5. [Configuração de Produção](#configuração-de-produção)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)
8. [Plano de Rollback](#plano-de-rollback)

---

## Pré-Requisitos

### Contas Necessárias
- [ ] GitHub (repositório público/privado)
- [ ] Railway.app (deploy backend)
- [ ] Vercel (deploy frontend - opcional)
- [ ] Stripe (processamento de pagamentos)
- [ ] SendGrid/Resend (emails transacionais)
- [ ] Sentry (rastreamento de erros)

### Ferramentas
```bash
# Instalar dependências
pnpm install
pnpm install otpauth  # Para 2FA

# Ferramentas CLI
npm install -g stripe  # Para testar webhooks
npm install -g vercel  # Para deploy Vercel
```

---

## Checklist Pre-Launch

### ✅ Validação de Ambiente (Execute antes de qualquer deploy)

```bash
# 1. Validar readiness para produção
node scripts/production-readiness.ts

# Resultado esperado:
# 🚀 SISTEMA PRONTO PARA PRODUÇÃO!
# Críticos: 0
```

### ✅ Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env.production

# Preencher obrigatoriamente:
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=<32+ caracteres aleatórios>
ENCRYPTION_KEY=<32+ caracteres aleatórios>
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NODE_ENV=production
```

**Gerar chaves seguras:**
```bash
# JWT_SECRET e ENCRYPTION_KEY (32+ chars)
openssl rand -base64 32
# ou
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### ✅ Banco de Dados

```bash
# 1. Backup do banco atual (se houver)
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# 2. Executar migrations
pnpm db:push

# 3. Validar schema
mysql -u user -p database -e "DESCRIBE users;" | grep -E "2fa|twoFactor"
# Deve mostrar: twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes
```

### ✅ Stripe Webhooks

```bash
# 1. Listar endpoints configurados
stripe webhooks list

# 2. Se não existir, criar endpoint:
stripe listen --forward-to production-domain.com/api/stripe/webhook

# 3. Atualizar STRIPE_WEBHOOK_SECRET com a chave da resposta

# 4. Testar webhook localmente:
stripe listen --forward-to localhost:3000/api/stripe/webhook &
stripe trigger checkout.session.completed
```

### ✅ Email Transacional

```bash
# Testar com Postman ou curl
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'

# Resultado esperado: { "success": true }
```

### ✅ Segurança

- [ ] HTTPS configurado (Railway/Vercel fazem automaticamente)
- [ ] WAF ativo (enabled por padrão em produção)
- [ ] Rate limiting configurado (60 req/min padrão)
- [ ] Headers de segurança ativos (Helmet configurado)
- [ ] CORS whitelist preenchido

---

## Deployment Railway

### 1. Conectar Repositório

```bash
# Login no Railway
railway login

# Inicializar projeto
railway init

# Conectar ao GitHub
# Selecionar repositório e branch
```

### 2. Configurar Variáveis de Ambiente

```bash
# Via CLI
railway variables set DATABASE_URL mysql://...
railway variables set JWT_SECRET xxxxx
railway variables set ENCRYPTION_KEY xxxxx
railway variables set STRIPE_SECRET_KEY sk_live_xxxxx
railway variables set NODE_ENV production

# Ou via painel: https://railway.app/dashboard
# Project → Variables → Add
```

### 3. Configurar Banco de Dados

```bash
# Railway automaticamente cria MySQL se você usar Railway Database
# Ou conectar database externo

# Validar conexão
railway up  # Deploy teste
```

### 4. Deploy

```bash
# Deploy automático via GitHub (recomendado)
git push origin main
# Railway detecta push e redeploy automaticamente

# Ou deploy manual
railway up
```

### 5. Validar Deploy

```bash
# Acessar logs
railway logs

# Validar health check
curl https://seu-app.railway.app/api/health
# { "status": "healthy", "version": "1.0.0" }
```

---

## Deployment Vercel (Frontend Optional)

### 1. Conectar Repositório

```bash
# Login
vercel login

# Link projeto
vercel link

# Selecionar framework: "Other"
```

### 2. Configurar Build

```bash
# vercel.json (raiz do projeto)
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

### 3. Configurar Variáveis

```bash
# Vercel Dashboard → Settings → Environment Variables
VITE_API_URL=https://seu-backend.railway.app
VITE_APP_ID=your-app-id
```

### 4. Deploy

```bash
git push origin main
# Vercel autodeploy ativado
```

---

## Configuração de Produção

### Database

```sql
-- Validar índices para performance
SHOW INDEX FROM users;

-- Se faltarem índices:
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_openId (openId);
ALTER TABLE subscription ADD INDEX idx_userId (userId);
```

### Cache

```typescript
// Sistema de cache ATIVO em produção
// Configurado em server/_core/cache.ts
// TTLs padrão:
// - user: 5 min
// - ai: 30 min
// - analytics: 1 hora
// - content: 2 horas
```

### Rate Limiting

```typescript
// Configurado em server/_core/waf.ts
// 60 requisições por minuto por IP
// Bloqueio automático após 5 falhas por hora
// Whitelist para IPs confiáveis (adicionar ao WAF conforme necessário)
```

### Logging

```typescript
// Pino logger em modo production
// Salva logs estruturados em JSON
// Recomendação: Integrar com Sentry ou Datadog
```

---

## Monitoramento

### Sentry (Error Tracking)

```bash
# 1. Criar conta em https://sentry.io

# 2. Adicionar SDK
pnpm install @sentry/node @sentry/trpc

# 3. Configurar em server/_core/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.errorHandler());

# 4. Adicionar ENV var
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Alertas Críticos

```bash
# Monitorar:
- Erros 5xx (sistema down)
- Taxa de conversão Stripe (pagamentos falhando)
- Latência > 500ms (performance degradada)
- Taxa de erro > 1% (qualidade de código)
```

### Dashboards Recomendados

```
Railway:
  - CPU/Memory usage
  - Request count
  - Error rate
  - Logs

Sentry:
  - Error occurrences
  - Performance issues
  - Release health

Stripe:
  - Conversion rate
  - Failed payments
  - Revenue
```

---

## Troubleshooting

### ❌ "Database connection refused"

```bash
# Verificar conexão
mysql -u user -p -h host database

# Validar ENV
echo $DATABASE_URL

# Se em Railway, validar:
# Railway Dashboard → Variables → DATABASE_URL
```

### ❌ "STRIPE_WEBHOOK_SECRET invalid"

```bash
# Validar secret
echo $STRIPE_WEBHOOK_SECRET
# Deve começar com: whsec_

# Regenerar se necessário:
# Stripe Dashboard → Webhooks → criar novo endpoint
```

### ❌ "Cannot find module 'otpauth'"

```bash
# Instalar dependência
pnpm install otpauth

# Ou em produção (Railway):
# Adicionar ao package.json devDependencies
pnpm add otpauth
git push origin main
```

### ❌ "CORS error from frontend"

```bash
# Validar ALLOWED_ORIGINS em .env
ALLOWED_ORIGINS=https://seu-frontend.vercel.app,https://seu-dominio.com

# Verificar WAF
server/_core/waf.ts → csrfProtection middleware
```

### ❌ "Email not sending"

```bash
# Validar SendGrid/Resend key
echo $SENDGRID_API_KEY

# Testar envio direto
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Ou verificar logs
railway logs | grep -i email
```

---

## Plano de Rollback

### Se algo der errado em produção:

```bash
# 1. Rollback imediato (últimas 5 versões disponíveis)
railway rollback

# Ou manualmente:
# Railway Dashboard → Deployments → Select anterior → Deploy

# 2. Rollback do banco (se necessário)
mysql -u user -p database < backup-$(date -d '1 day ago' +%Y%m%d).sql

# 3. Notify users
# Email com aviso de manutenção
# Status page atualizado

# 4. Investigar
railway logs > investigation-$(date +%Y%m%d-%H%M%S).log

# 5. Fix & redeploy
git revert <commit-hash>
git push origin main
```

### Fallback URLs

```
Production: https://elevare.app
Staging: https://staging.elevare.app
Dev: http://localhost:3000

Ter sempre:
- Backup do banco
- Versão anterior deployada
- Runbook de incident
```

---

## Comandos Rápidos

```bash
# Verificar readiness
node scripts/production-readiness.ts

# Deploy automático
git push origin main

# Ver logs
railway logs -f

# SSH para container
railway shell

# Backup banco
mysqldump -u user -p db > backup.sql

# Teste de carga (opcional)
npm install -g artillery
artillery quick --count 100 --num 10 https://seu-app.com
```

---

## Próximos Passos Após Deploy

1. ✅ Monitoring 24/7 ativo
2. ✅ Beta privado com 10-20 usuários
3. ✅ Feedback coletado por 1 semana
4. ✅ Correções aplicadas
5. ✅ Lançamento público
6. ✅ Marketing ativado

---

**Última atualização:** 27 de Dezembro de 2025  
**Status:** Pronto para Produção ✅
