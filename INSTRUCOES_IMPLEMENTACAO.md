# 🚀 INSTRUÇÕES DE IMPLEMENTAÇÃO
## Correções de Auditoria - Elevare AI NeuroVendas

---

## ⚡ INÍCIO RÁPIDO

### 1. Instalar Dependências

```bash
# Navegar para o diretório do projeto
cd elevare_ai_neurovendas

# Remover instalação antiga
rm -rf node_modules pnpm-lock.yaml

# Instalar dependências atualizadas
pnpm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env com um editor
nano .env
```

**Variáveis Obrigatórias:**

```env
# Aplicação
VITE_APP_ID=sua-app-id
JWT_SECRET=seu-jwt-secret-minimo-32-caracteres-aqui

# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/elevare_db

# OAuth
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=seu-owner-open-id

# APIs (obrigatório em produção)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-forge-api-key

# Stripe (obrigatório em produção)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_PLUS_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Opcional
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
PORT=3000
```

### 3. Aplicar Migrações de Banco

```bash
# Gerar e aplicar migrações
pnpm db:push
```

### 4. Iniciar em Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
pnpm dev
```

Acesse: http://localhost:3000

---

## 🔧 CONFIGURAÇÕES ADICIONAIS

### Configurar Webhook do Stripe

#### Em Desenvolvimento:

1. **Instalar Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

2. **Autenticar:**
```bash
stripe login
```

3. **Escutar Webhooks Localmente:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. **Copiar o Webhook Secret:**
```bash
# O comando acima retorna algo como:
# whsec_xxxxxxxxxxxxx
# Adicione ao .env:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

5. **Testar Eventos:**
```bash
# Em outro terminal
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

#### Em Produção:

1. Acessar [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Clicar em "Add endpoint"
3. URL: `https://seudominio.com/api/stripe/webhook`
4. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiar "Signing secret" para `STRIPE_WEBHOOK_SECRET`

---

## 🧪 TESTES

### Validação de Variáveis de Ambiente

```bash
# Deve FALHAR com erro claro
NODE_ENV=production DATABASE_URL="" pnpm start

# Mensagem esperada:
# ❌ ERRO CRÍTICO: Variável de ambiente obrigatória 'DATABASE_URL' não está definida.

# Deve FUNCIONAR
NODE_ENV=production pnpm start
# ✅ Todas as variáveis de ambiente obrigatórias foram validadas
```

### Rate Limiting

```bash
# Teste de rate limit (deve bloquear após 10 requisições)
for i in {1..15}; do
  echo "Requisição $i"
  curl -X POST http://localhost:3000/api/trpc/bioRadar.analyze \
    -H "Content-Type: application/json" \
    -d '{"instagramHandle":"test"}' \
    2>/dev/null | jq
done

# Após 10 requisições deve retornar:
# {
#   "error": "Muitas requisições. Tente novamente em 15 minutos.",
#   "code": "RATE_LIMIT_EXCEEDED"
# }
```

### CORS

```bash
# Origem permitida (deve funcionar)
curl -H "Origin: http://localhost:3000" \
  http://localhost:3000/api/trpc/auth.me

# Origem não permitida (deve bloquear)
curl -H "Origin: https://evil.com" \
  http://localhost:3000/api/trpc/auth.me
```

### Webhook do Stripe

```bash
# Terminal 1: Escutar webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 2: Disparar eventos de teste
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded

# Verificar logs do servidor
# Deve aparecer:
# [INFO] Checkout completed successfully
# [INFO] Credits renewed after payment
```

### Build de Produção

```bash
# Limpar dist anterior
rm -rf dist

# Build
pnpm build

# Deve gerar:
# - dist/index.js (servidor)
# - dist/public/* (client)

# Iniciar produção
NODE_ENV=production pnpm start

# Verificar
curl http://localhost:3000/api/trpc/system.health
```

---

## 📊 VERIFICAÇÃO DE CÓDIGO

### Verificar Console.log Removidos

```bash
# Não deve encontrar console.* em server/
grep -r "console\." server/ | grep -v "logger\."

# Resultado esperado: (vazio ou apenas comentários)
```

### Verificar Tipos TypeScript

```bash
# Verificar erros de tipo
pnpm check

# Resultado esperado:
# ✓ All type checks passed
```

### Verificar Formatação

```bash
# Formatar código
pnpm format

# Verificar se há mudanças
git status
```

---

## 🗄️ BANCO DE DADOS

### Verificar Índices Criados

```sql
-- Conectar ao MySQL
mysql -u root -p elevare_db

-- Verificar índices em contentGeneration
SHOW INDEX FROM contentGeneration;

-- Deve mostrar:
-- user_id_idx
-- type_idx
-- user_type_idx
-- created_at_idx

-- Verificar índices em subscription
SHOW INDEX FROM subscription;

-- Deve mostrar:
-- subscription_user_id_idx
-- stripe_customer_idx
-- stripe_subscription_idx
-- status_idx
```

### Performance de Queries

```sql
-- Antes dos índices (slow)
EXPLAIN SELECT * FROM contentGeneration 
WHERE userId = 1 AND type = 'ebook' 
ORDER BY createdAt DESC;

-- Após índices (fast)
-- Deve usar index: user_type_idx
```

---

## 🔐 SEGURANÇA

### Checklist de Segurança

- [ ] JWT_SECRET tem mínimo 32 caracteres
- [ ] DATABASE_URL não está vazio
- [ ] STRIPE_SECRET_KEY configurado em produção
- [ ] STRIPE_WEBHOOK_SECRET configurado
- [ ] ALLOWED_ORIGINS lista apenas domínios confiáveis
- [ ] NODE_ENV=production em produção
- [ ] Console.log removidos do código de produção
- [ ] Rate limiting ativo
- [ ] CORS configurado

### Testar Segurança

```bash
# Verificar segredos não commitados
git log -p | grep -i "secret\|password\|key" | grep -v ".example"

# Verificar dependências vulneráveis
pnpm audit

# Resultado esperado:
# 0 vulnerabilities
```

---

## 🚀 DEPLOY

### Preparar para Deploy

1. **Verificar Build:**
```bash
pnpm build
```

2. **Testar Build Localmente:**
```bash
NODE_ENV=production pnpm start
```

3. **Configurar Variáveis de Ambiente no Servidor:**
```bash
# No servidor de produção
export NODE_ENV=production
export DATABASE_URL="mysql://user:pass@host/db"
export JWT_SECRET="seu-secret-seguro-32-chars-minimo"
# ... outras variáveis
```

4. **Configurar Webhook do Stripe:**
- URL: `https://seudominio.com/api/stripe/webhook`
- Copiar signing secret para `STRIPE_WEBHOOK_SECRET`

5. **Iniciar Servidor:**
```bash
# Com PM2 (recomendado)
pm2 start dist/index.js --name elevare-api

# Ou com systemd
sudo systemctl start elevare-api
```

### Monitoramento

```bash
# Logs em tempo real
pm2 logs elevare-api

# Status
pm2 status

# Restart
pm2 restart elevare-api
```

---

## 📝 TROUBLESHOOTING

### Erro: "Database not available"

**Solução:**
1. Verificar `DATABASE_URL` no `.env`
2. Testar conexão com MySQL:
```bash
mysql -h host -u user -p
```
3. Verificar permissões do usuário do banco

### Erro: "CORS blocked"

**Solução:**
1. Adicionar origem em `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://seudominio.com
```
2. Reiniciar servidor

### Erro: "Webhook signature verification failed"

**Solução:**
1. Verificar `STRIPE_WEBHOOK_SECRET` correto
2. Em desenvolvimento, usar `stripe listen`
3. Em produção, copiar secret do Stripe Dashboard

### Erro: "Rate limit exceeded"

**Normal!** Rate limiting está funcionando.

**Solução:**
- Aguardar 15 minutos
- Ou autenticar-se (limites maiores para usuários logados)

---

## 📞 SUPORTE

### Recursos Adicionais

- **Documentação Stripe:** https://stripe.com/docs/webhooks
- **Documentação Drizzle:** https://orm.drizzle.team/
- **Documentação tRPC:** https://trpc.io/

### Logs Úteis

```bash
# Ver logs do servidor
pm2 logs elevare-api

# Ver últimas 100 linhas
pm2 logs elevare-api --lines 100

# Filtrar erros
pm2 logs elevare-api | grep ERROR
```

---

## ✅ CHECKLIST FINAL

Antes de ir para produção:

- [ ] Todas as dependências instaladas (`pnpm install`)
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Migrações de banco aplicadas (`pnpm db:push`)
- [ ] Build funciona (`pnpm build`)
- [ ] Testes passam (rate limiting, CORS, etc)
- [ ] Webhook do Stripe configurado e testado
- [ ] Console.log removidos (`grep -r "console\." server/`)
- [ ] Tipos TypeScript válidos (`pnpm check`)
- [ ] HTTPS configurado em produção
- [ ] Backup do banco de dados configurado

---

**Boa sorte com o deploy! 🚀**

Elevare AI NeuroVendas - v1.1.0
