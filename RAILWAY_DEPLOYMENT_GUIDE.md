# 🚀 Guia Completo: Deploy Permanente no Railway

## 📋 Índice
1. [Preparação](#preparação)
2. [Criar Conta Railway](#criar-conta-railway)
3. [Conectar Repositório](#conectar-repositório)
4. [Configurar Banco de Dados](#configurar-banco-de-dados)
5. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
6. [Deploy](#deploy)
7. [Configurar Domínio](#configurar-domínio)
8. [Monitoramento](#monitoramento)

---

## Preparação

✅ **Já feito:**
- Repositório Git inicializado
- Dockerfile criado
- railway.json configurado
- .env.production template criado
- Build otimizado

---

## Criar Conta Railway

### Passo 1: Acessar Railway
1. Visite: https://railway.app
2. Clique em **"Start Project"**
3. Escolha **"Deploy from GitHub"**

### Passo 2: Conectar GitHub
1. Clique em **"Connect GitHub"**
2. Autorize Railway a acessar seus repositórios
3. Selecione o repositório `Elevador.Lucr-sia-main`

### Passo 3: Criar Projeto
1. Clique em **"Deploy Now"**
2. Railway detectará automaticamente:
   - Node.js como runtime
   - Dockerfile para build
   - railway.json para configuração

---

## Conectar Repositório

### Opção A: Usar GitHub (Recomendado)
1. Faça push do código para GitHub:
```bash
cd /home/ubuntu/Elevador.Lucr-sia-main
git remote add origin https://github.com/seu-usuario/Elevador.Lucr-sia-main.git
git branch -M main
git push -u origin main
```

2. No Railway, selecione o repositório

### Opção B: Deploy Manual
1. No Railway, clique em **"Deploy from GitHub"**
2. Selecione **"Deploy from Docker"**
3. Configure o Dockerfile

---

## Configurar Banco de Dados

### Passo 1: Adicionar MySQL Plugin
1. No painel do Railway, clique em **"+ New"**
2. Selecione **"MySQL"**
3. Railway criará automaticamente a instância

### Passo 2: Obter Connection String
1. Clique no serviço MySQL
2. Copie a variável `DATABASE_URL`
3. Será algo como: `mysql://user:pass@host:port/db`

### Passo 3: Configurar no Projeto
1. No painel do Railway, vá para seu serviço Node.js
2. Clique em **"Variables"**
3. Adicione `DATABASE_URL` (Railway faz isso automaticamente se usar o plugin)

---

## Configurar Variáveis de Ambiente

### Passo 1: Acessar Variáveis
1. No Railway, clique no seu serviço Node.js
2. Vá para a aba **"Variables"**

### Passo 2: Adicionar Variáveis Críticas

```env
# Obrigatórias
NODE_ENV=production
PORT=3000

# JWT (GERE NOVOS VALORES!)
JWT_SECRET=seu_jwt_secret_aleatorio_com_32_caracteres_minimo
ENCRYPTION_KEY=sua_encryption_key_aleatoria_com_32_caracteres_minimo

# OAuth
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_owner_id

# Stripe (obtenha em https://stripe.com)
STRIPE_SECRET_KEY=sk_live_sua_chave_stripe_producao
STRIPE_ESSENCIAL_PRICE_ID=price_xxxxx
STRIPE_PROFISSIONAL_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Forge API
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_forge

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com

# Email (opcional)
SENDGRID_API_KEY=sua_chave_sendgrid
RESEND_API_KEY=sua_chave_resend

# Monitoramento (opcional)
SENTRY_DSN=seu_sentry_dsn
```

### Passo 3: Salvar Variáveis
1. Clique em **"Save"**
2. Railway reiniciará o serviço automaticamente

---

## Deploy

### Passo 1: Iniciar Deploy
1. Railway detectará mudanças no GitHub automaticamente
2. Ou clique em **"Deploy"** manualmente
3. Acompanhe o log de build

### Passo 2: Verificar Status
1. Vá para a aba **"Deployments"**
2. Procure pelo status **"Success"** (verde)
3. Copie a URL pública fornecida

### Passo 3: Testar Health Check
```bash
curl https://seu-projeto.up.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-30T12:56:28.893Z",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## Configurar Domínio

### Opção A: Usar Domínio Próprio

#### 1. Registrar Domínio
- Use Namecheap, GoDaddy, ou outro registrador
- Exemplo: `elevare.app`

#### 2. Configurar no Railway
1. No Railway, clique no seu serviço
2. Vá para **"Settings"**
3. Procure por **"Domains"**
4. Clique em **"+ New Domain"**
5. Digite seu domínio: `elevare.app`

#### 3. Configurar DNS
1. No seu registrador, vá para DNS settings
2. Crie um registro CNAME:
   - **Name**: `@` (ou deixe vazio)
   - **Value**: `seu-projeto.up.railway.app`

3. Para www, crie outro CNAME:
   - **Name**: `www`
   - **Value**: `seu-projeto.up.railway.app`

#### 4. Aguardar Propagação
- Pode levar 24-48 horas
- Verifique com: `nslookup elevare.app`

### Opção B: Usar Subdomínio Railway
- Railway fornece automaticamente: `seu-projeto.up.railway.app`
- HTTPS já está configurado

---

## Monitoramento

### Verificar Logs
1. No Railway, clique em **"Logs"**
2. Veja logs em tempo real
3. Procure por erros ou warnings

### Configurar Alertas
1. Vá para **"Settings"** do projeto
2. Configure alertas para:
   - Deploy failure
   - High memory usage
   - High CPU usage

### Metrics
1. Clique em **"Metrics"**
2. Monitore:
   - CPU usage
   - Memory usage
   - Network I/O
   - Request rate

---

## Troubleshooting

### Build falha
**Problema**: `pnpm: command not found`
**Solução**: Railway detecta automaticamente. Se falhar, adicione `nixpacks.toml`:
```toml
[phases.build]
cmds = ["pnpm install", "pnpm build"]
```

### Erro de conexão com banco de dados
**Problema**: `DATABASE_URL not configured`
**Solução**: 
1. Adicione MySQL plugin no Railway
2. Copie a `DATABASE_URL` gerada
3. Adicione às variáveis do serviço Node.js

### Porta não está respondendo
**Problema**: `Connection refused`
**Solução**:
1. Verifique se `PORT` está configurado como `3000`
2. Verifique se servidor está fazendo bind em `0.0.0.0`
3. Reinicie o serviço

### Erro 502 Bad Gateway
**Problema**: Aplicação crashou
**Solução**:
1. Verifique os logs
2. Procure por erros de startup
3. Verifique variáveis de ambiente

---

## Próximos Passos

### 1. Configurar Backup
```bash
# Railway faz backup automático do MySQL
# Você pode fazer backup manual em Settings > Backups
```

### 2. Configurar CI/CD
- Railway faz deploy automático em cada push para `main`
- Configure branch protection em GitHub

### 3. Configurar SSL/TLS
- Railway fornece automaticamente via Let's Encrypt
- Domínio próprio: Railway configura automaticamente

### 4. Escalar Aplicação
- No Railway, aumente RAM/CPU conforme necessário
- Configure auto-scaling se disponível

---

## Resumo de Custos (Railway)

| Recurso | Preço |
|---------|-------|
| Node.js (0.5GB) | ~$5/mês |
| MySQL (1GB) | ~$5/mês |
| Domínio | ~$10/ano (registrador) |
| **Total** | **~$10/mês** |

Railway oferece $5 de crédito gratuito por mês para novos usuários.

---

## Links Úteis

- **Railway**: https://railway.app
- **Documentação Railway**: https://docs.railway.app
- **Stripe**: https://stripe.com
- **Sentry**: https://sentry.io
- **GitHub**: https://github.com

---

## Suporte

Se encontrar problemas:
1. Verifique os logs no Railway
2. Consulte a documentação oficial
3. Abra uma issue no GitHub

---

*Guia criado em: 2025-12-30*
*Elevare AI NeuroVendas v1.0.0*
