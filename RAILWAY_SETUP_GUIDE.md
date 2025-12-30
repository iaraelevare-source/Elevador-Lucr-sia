# 🚂 RAILWAY SETUP GUIDE - Deploy Completo

## ⏱️ Tempo Estimado: 30-45 minutos

---

## 📋 O que você vai fazer

- Criar conta em Railway.app
- Criar projeto Node.js + MySQL
- Configurar variáveis de ambiente
- Fazer deploy automático via GitHub
- Validar se está rodando

---

## PASSO 1: Criar Conta Railway

### 1.1 Acessar Railway

```
https://railway.app
```

### 1.2 Sign Up

- Clique em **"Sign Up"**
- Use GitHub/Google ou email
- **Recomendado:** GitHub (mais fácil integração)
- Confirme email

### 1.3 Dashboard

Você verá:
```
New Project → Create New Service
```

---

## PASSO 2: Criar Projeto + Database

### 2.1 Criar Projeto

1. Clique **"Create New Project"**
2. Nome: `elevare-ai-staging`
3. Clique **"Create Project"**

### 2.2 Adicionar Database

1. Clique **"Add Service"** → **"Database"**
2. Selecione **"MySQL"**
3. Railway criará automaticamente com:
   ```
   DATABASE_URL=mysql://...
   ```

**Aguarde 2-3 minutos** (provisionamento do banco)

### 2.3 Confirmar Database

```
Variables → DATABASE_URL
```

Deve aparecer:
```
mysql://root:[password]@[host]:[port]/railway
```

✅ **Database pronto!**

---

## PASSO 3: Conectar GitHub

### 3.1 Conectar Repositório

1. Clique **"Add Service"** → **"GitHub Repo"**
2. Selecione seu repositório
   ```
   Carine01/Elevador.Lucr-sia
   ```
3. Branch: `main`
4. Root Directory: `.` (raiz)

### 3.2 Configurar Build

Railway detectará automaticamente:
```
Framework: Node.js (TypeScript)
Build Command: pnpm build
Start Command: node dist/index.js
```

✅ **Se não detectar, configure manualmente:**

```
Settings → Build
  Build Command: pnpm build
  Start Command: node dist/index.js
  Root Directory: .
```

---

## PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Acessar Variables

```
Project → Variables → Add Variable
```

### 4.2 Adicionar Variáveis (Copiar de .env.staging)

**CRÍTICAS (sem essas não rodará):**

```
NODE_ENV=staging
DATABASE_URL=[GERADO AUTOMATICAMENTE PELO RAILWAY]
JWT_SECRET=seu_jwt_secret_aqui_32_chars
ENCRYPTION_KEY=sua_encryption_key_32_chars
```

**STRIPE:**

```
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**EMAIL:**

```
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@staging.seudominio.com
```

**SENTRY:**

```
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**OAUTH:**

```
MANUS_CLIENT_ID=xxxxx
MANUS_CLIENT_SECRET=xxxxx
MANUS_REDIRECT_URI=https://seu-railway-url.railway.app/api/auth/manus/callback
```

**GEMINI:**

```
GEMINI_API_KEY=xxxxx
```

**OUTROS:**

```
APP_VERSION=1.0.0-staging
PORT=3000
ALLOWED_ORIGINS=https://seu-railway-url.railway.app
```

### 4.3 Salvar Variáveis

Clique **"Save"** após cada adição

✅ **Todas as variáveis devem estar verdes**

---

## PASSO 5: Deploy Automático

### 5.1 Iniciar Deploy

```
GitHub → Push para main
```

Ou:

```
Railway Dashboard → Deploy
```

### 5.2 Monitorar Build

```
Build Logs:
  - Instalando dependências (pnpm install)
  - Building aplicação (vite build)
  - Compilando servidor (esbuild)
  - Iniciando servidor (node dist/index.js)
```

**Tempo esperado:** 5-10 minutos

### 5.3 Verificar Se Rodou

```
Logs → Real-time logs
```

Deve aparecer:
```
🚀 Server running on port 3000
✅ Database connected
✅ Stripe initialized
✅ Sentry initialized
```

---

## PASSO 6: Obter URL de Produção

### 6.1 Acessar Deployments

```
Project → Deployments → Latest
```

Você verá:
```
Live URL: https://elevare-ai-staging-production.up.railway.app
```

### 6.2 Testar URL

```bash
curl https://elevare-ai-staging-production.up.railway.app/api/health

# Resultado esperado:
# {"status":"healthy","version":"1.0.0","timestamp":"2025-12-27..."}
```

✅ **Server respondendo!**

---

## PASSO 7: Configurar Webhooks e Callbacks

### 7.1 Atualizar URLs em Serviços Externos

**Stripe:**
```
Dashboard → Webhooks → Add endpoint
  URL: https://seu-railway-url/api/stripe/webhook
  Events: checkout.session.completed, invoice.payment_succeeded, subscription.updated
```

**OAuth (Manus):**
```
Aplicação → Redirect URI
  https://seu-railway-url/api/auth/manus/callback
```

**Variáveis Railway:**
```
Variables → MANUS_REDIRECT_URI
  https://seu-railway-url.railway.app/api/auth/manus/callback
```

---

## PASSO 8: Executar Database Migrations

### 8.1 SSH para Container

```bash
# Via Railway CLI
railway shell
```

### 8.2 Rodar Migrations

```bash
# Dentro do container
pnpm db:push
```

**Resultado esperado:**
```
✅ Migration 0006_add_2fa_columns executed
✅ Database schema updated
```

### 8.3 Sair

```
exit
```

---

## PASSO 9: Monitoramento e Logs

### 9.1 Acessar Logs em Tempo Real

```bash
# Via Railway CLI (recomendado)
railway login
railway logs -f

# Ou via Dashboard
Project → Logs → Filter by service
```

### 9.2 Monitorar Métricas

```
Project → Metrics
  - CPU Usage
  - Memory Usage
  - Network I/O
  - Requests/sec
```

### 9.3 Alertas

```
Project → Settings → Alerts
  - CPU > 80%: Notify
  - Memory > 90%: Notify
  - Deploy failed: Notify
```

---

## PASSO 10: Validar Sistema Completo

### 10.1 Health Check

```bash
curl https://seu-railway-url.railway.app/api/health
```

**Resultado:**
```json
{
  "status": "healthy",
  "version": "1.0.0-staging",
  "database": "connected",
  "stripe": "configured",
  "sentry": "active"
}
```

### 10.2 Teste de Erro (Sentry)

```bash
curl -X POST https://seu-railway-url.railway.app/api/test-error \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Verificar em Sentry Dashboard:
```
Issues → Deve aparecer novo erro
```

### 10.3 Teste de Email

```bash
curl -X POST https://seu-railway-url.railway.app/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@exemplo.com",
    "subject": "Teste Railway",
    "html": "<h1>Teste bem-sucedido!</h1>"
  }'
```

Verificar inbox por email

---

## PASSO 11: Configurar Domain (Opcional)

### 11.1 Se Quiser Usar Domínio Próprio

```
Project → Domains → Add Custom Domain
  seu-staging.seudominio.com
```

Railway fornecerá CNAME:
```
CNAME: xxx.railway.app
```

### 11.2 Atualizar DNS

```
Seu provider DNS → Add CNAME
  Name: seu-staging
  Value: xxx.railway.app
```

**Aguardar propagação:** 5-30 minutos

### 11.3 Atualizar Variáveis

```
Variables → MANUS_REDIRECT_URI
  https://seu-staging.seudominio.com/api/auth/manus/callback

Variables → ALLOWED_ORIGINS
  https://seu-staging.seudominio.com
```

---

## 🐛 Troubleshooting

### ❌ "Build Failed"

```bash
# Ver logs de erro
railway logs -f | grep -i error

# Causas comuns:
# 1. Dependência faltando: pnpm install
# 2. Erro TypeScript: npm run check
# 3. Variável faltando: Verificar DATABASE_URL
```

### ❌ "Server starts but crashes"

```bash
# Logar em SSH
railway shell

# Testar manualmente
node dist/index.js

# Verificar variáveis
printenv | grep -E "DATABASE|JWT|STRIPE"
```

### ❌ "Database connection refused"

```
1. Aguardar 2-3 min após criar MySQL
2. Verificar DATABASE_URL em Variables
3. SSH e testar: mysql -u root -p (usar senha do DATABASE_URL)
4. Se ainda não funcionar: Resetar database
   Project → Settings → Reset
```

### ❌ "Port already in use"

```
Railway usa porta aleatória. Certificar que código usa:
  const port = process.env.PORT || 3000
```

### ❌ "Webhook not reaching server"

```
1. Verificar Live URL em Deployments
2. Testar: curl https://live-url/api/stripe/webhook
   Deve retornar 405 (POST required)
3. Atualizar URL em Stripe Dashboard
4. Verificar em Stripe → Webhooks → Events
```

---

## ✅ Checklist Final

- [ ] Conta Railway criada
- [ ] Projeto criado (elevare-ai-staging)
- [ ] MySQL database provisionado
- [ ] GitHub conectado
- [ ] Todas as variáveis configuradas
- [ ] Primeira build bem-sucedida
- [ ] Server rodando em Live URL
- [ ] Health check respondendo
- [ ] Database migrations executadas
- [ ] Sentry capturando erros
- [ ] Webhooks Stripe configurados
- [ ] Email funcionando
- [ ] Logs sendo monitorados

---

## 📊 O Que Você Pode Fazer Agora

```
✅ Acessar aplicação: https://seu-railway-url.railway.app
✅ Logar com OAuth: /login
✅ Testar geração de conteúdo: Dashboard → Novo conteúdo
✅ Processar pagamento: /pricing → Checkout
✅ Monitorar erros: Sentry Dashboard
✅ Ver logs: railway logs -f
✅ Escalar: Project → Settings → Plan (se necessário)
```

---

## 📚 Referências

| Recurso | Link |
|---------|------|
| Railway Docs | https://docs.railway.app |
| Node.js Deploy | https://docs.railway.app/guides/nodejs |
| MySQL Setup | https://docs.railway.app/databases/mysql |
| Custom Domain | https://docs.railway.app/guides/custom-domain |
| Troubleshooting | https://docs.railway.app/troubleshooting |

---

## 🎯 Próximo Passo

Após confirmar que Railway funciona:
1. Coletar Live URL
2. Atualizar Stripe webhooks
3. Atualizar OAuth redirects
4. Fazer Beta testing com 10-20 usuários

**Tempo total:** 30-45 minutos ✅
