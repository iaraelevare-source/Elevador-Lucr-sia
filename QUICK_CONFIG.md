# 🚀 CONFIGURAÇÃO RÁPIDA - Variáveis Críticas

## ⏱️ Tempo: 5 minutos

As 3 variáveis críticas que faltam para deploy:

---

## 1. ENCRYPTION_KEY

```bash
# Gerar chave segura (32+ caracteres)
openssl rand -base64 32

# Resultado será algo como:
# xK2mP9qLvN7dR5sT3bF1wZ8cH6jV4yM2lN0pQ=

# Adicionar a .env.staging:
ENCRYPTION_KEY=xK2mP9qLvN7dR5sT3bF1wZ8cH6jV4yM2lN0pQ=
```

---

## 2. STRIPE_WEBHOOK_SECRET

**Opção A: Local (para testes)**
```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:3000/api/stripe/webhook

# Será exibido:
# Ready! Your webhook signing secret is: whsec_test_xxxxx

STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

**Opção B: Dashboard Stripe**
```
https://dashboard.stripe.com/webhooks
  → Add an endpoint
  → URL: https://seu-railway-url/api/stripe/webhook
  → Events: checkout.session.completed, invoice.payment_succeeded
  → Criar
  → Copiar "Signing secret"

STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx
```

---

## 3. NODE_ENV

```bash
# Configurar em .env.staging
NODE_ENV=staging

# Ou para produção:
NODE_ENV=production
```

---

## ✅ Checklist Rápido

```bash
# 1. Abrir .env.staging
nano .env.staging

# 2. Verificar se tem:
grep -E "ENCRYPTION_KEY|STRIPE_WEBHOOK_SECRET|NODE_ENV" .env.staging

# 3. Se faltando, adicionar:
echo "ENCRYPTION_KEY=xK2mP9qLvN7dR5sT3bF1wZ8cH6jV4yM2lN0pQ=" >> .env.staging
echo "STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx" >> .env.staging
echo "NODE_ENV=staging" >> .env.staging

# 4. Validar novamente:
npx tsx scripts/production-readiness.ts
```

---

## 📊 Validação Final Esperada

```
Total de verificações: 21
✅ OK: 18 (era 14)
⚠️  Avisos: 3 (eram 4)
❌ Críticos: 0 (eram 3)

🚀 SISTEMA PRONTO PARA PRODUÇÃO!
```

---

**Próximo:** Deploy em Railway em 30 minutos ✅
