# 🚀 PLANO DE EXECUÇÃO - FASE 1 (1 SEMANA)

**Elevare AI - Roteiro para Lançamento Seguro**  
**Timeline:** 26 Dez 2025 - 2 Jan 2026  
**Investimento:** R$ 4.200 (12-14 horas de dev)  
**Objetivo:** Score 7.8 → 8.5/10, zero bloqueadores críticos

---

## 📅 TIMELINE DIÁRIA

### ⏰ HOJE (26 Dez) - 3 horas

#### 9:00-10:00 | Setup & Verificação (1h)
```bash
# Checkout da branch main
git checkout main
git pull origin main

# Verificar variáveis de ambiente
cat .env | grep -E "DATABASE_URL|STRIPE_SECRET|SENDGRID_API"
# Validar: todas presentes?

# Testar conexão com DB
npm run check-db
# Deve retornar: ✅ Database connected

# Verificar backup MySQL está ativo
# Railway Dashboard → MySQL → Backups → Debe ver "Enabled"
```

#### 10:00-11:30 | Admin Setup (1.5h)
```bash
# Se admin ainda não foi criado:
npm run create-admin

# Script deve perguntar:
# Email: seu-email@empresa.com
# Senha: [gerar aleatória]

# Verificar admin foi criado
npm run verify-admin

# Confirmar que consegue fazer login em produção
# 1. Acessar app em produção
# 2. OAuth (deixa passar)
# 3. Ir em /admin
# 4. Deve funcionar
```

#### 11:30-12:00 | Documentação de Progresso (0.5h)
```markdown
# Checklist Dia 1

- [ ] .env verificado
- [ ] DB conectado
- [ ] Backup ativo
- [ ] Admin criado e testado
- [ ] Node/pnpm funcionando localmente

Status: ✅ Pronto para Dia 2
```

---

### ⏰ DIA 2 (27 Dez) - 4 horas

#### 9:00-10:00 | Smoke Test Local (1h)
```bash
# Instalar dependências (se não tiver)
pnpm install

# Rodar adapter smoke test
pnpm exec tsx scripts/adapter-smoke.ts

# Deve retornar: ✅ Adapter smoke test finished
```

#### 10:00-11:30 | Happy Path Test (1.5h)
**Testar como usuário normal, todo fluxo end-to-end:**

```markdown
## Teste 1: Cadastro & Login
- [ ] Acessar app em http://localhost:3000
- [ ] Clicar em "Login com Google"
- [ ] Fazer login com conta test Google
- [ ] Redirecionar para dashboard? ✅
- [ ] Avatar aparece? ✅
- [ ] Créditos aparecem (5)? ✅

## Teste 2: Diagnóstico Completo
- [ ] Ir para Diagnóstico
- [ ] Responder todos 9 perguntas
- [ ] Swipe left/right funciona? ✅
- [ ] Score calcula corretamente? ✅
- [ ] Resultado mostra perfil (Desbravadora/Estrategista/Rainha)? ✅
- [ ] Pode fazer diagnóstico de novo (refresh 24h)? ✅

## Teste 3: Geração de Conteúdo
- [ ] Ir para "Robô Produtor"
- [ ] Gerar post: descrição "procedimento limpeza profunda"
- [ ] Esperar 3-5 segundos
- [ ] Resultado aparece? ✅
- [ ] Tem copy, hashtags, timing? ✅
- [ ] Botão "Copiar" funciona? ✅
- [ ] Gerar ebook: "Guia de skincare"
- [ ] Resultado em PDF ou texto? ✅
- [ ] Créditos debitados corretamente? ✅ (5 → 3)

## Teste 4: CRM Leads
- [ ] Ir para "Fluxo de Clientes"
- [ ] Adicionar novo lead: "Maria", "maria@test.com", "11999999999"
- [ ] Lead aparece em "Novo"? ✅
- [ ] Mudar status para "Quente"
- [ ] Cor muda para vermelho? ✅
- [ ] Adicionar nota: "Interessada em botox"
- [ ] Nota salva? ✅
- [ ] Botão WhatsApp gera link correto? ✅

## Teste 5: Créditos & Limite
- [ ] Gerar conteúdo 3x mais (até zerar créditos)
- [ ] Sistema bloqueia geração quando 0? ✅ ("Créditos insuficientes")
- [ ] Mensagem é clara? ✅
- [ ] Link para upgrade funciona? ✅

Tempo estimado: 30 minutos por teste = 90 minutos total
```

#### 11:30-12:00 | Documentar Problemas (0.5h)
Se encontrar algum bug:
```markdown
# BUG #1
- O quê: Créditos não debitam ao gerar post
- Quando: Após clicar "Gerar" e receber resultado
- Como reproduzir:
  1. Ir para Robô Produtor
  2. Gerar post
  3. Verificar créditos no dashboard
- Esperado: Créditos diminuem
- Real: Créditos não mudam
- Prioridade: 🔴 CRÍTICA

# AÇÃO
[ ] Dev identifica: checkCredits() ou consumeCredits()?
[ ] Cria fix
[ ] Testa de novo
```

---

### ⏰ DIA 3 (28 Dez) - 3 horas

#### 9:00-11:00 | Stripe Webhook Test (2h)

**Pré-requisito:** Stripe CLI instalado
```bash
# 1. Download Stripe CLI (Windows)
# https://github.com/stripe/stripe-cli/releases/download/v1.18.0/stripe_1.18.0_windows_x86_64.exe

# 2. Autenticar
stripe login

# 3. Forward eventos para localhost
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# Deve retornar: > Ready! Your webhook signing secret is whsec_test_...
# Copiar esse secret!

# 4. Em outro terminal, rodar dev server
pnpm dev

# 5. Disparar evento de teste
stripe trigger checkout.session.completed

# 6. Verificar logs
# Dev server deve mostrar:
# [Server] 🪝 Webhook Stripe recebido: checkout.session.completed
# [Server] ✅ User upgraded para PRO
# [Server] ✅ Créditos renovados: +250

# 7. Validar no banco de dados (se tiver acesso)
# SELECT * FROM users WHERE email = 'test@example.com';
# plan deve ser 'pro'
# credits deve ter aumentado
```

Se tiver problema:
```bash
# Erro: "Webhook not received"
# [ ] Verificar .env tem STRIPE_WEBHOOK_SECRET?
# [ ] Rodando stripe listen?
# [ ] Dev server está rodando?

# Erro: "Signature verification failed"
# [ ] Secret está correto?
# [ ] Copiar novamente do "stripe listen"
# [ ] Colocar em .env.local
# [ ] Restart dev server
```

#### 11:00-12:00 | Email Test (1h)

**Testar welcome email:**
```bash
# 1. Abrir Mailtrap (ferramente fake email para dev)
# https://mailtrap.io (criar conta free)

# 2. Copiar credentials:
# Login: [criar credencial SMTP]
# Host: smtp.mailtrap.io
# Port: 465 (ou 587)

# 3. Adicionar em .env.local (DEV)
SENDGRID_API_KEY=test_key_mailtrap  # Ou RESEND_API_KEY
EMAIL_FROM=noreply@elevare.app
EMAIL_FROM_NAME=Elevare

# 4. Testar enviando email manualmente
# Cria arquivo teste
# /tmp/test-email.ts
import { sendWelcomeEmail } from "@/server/email/client";
await sendWelcomeEmail({
  email: "seu-email@gmail.com",
  clinicName: "Clínica Teste"
});

# 5. Rodar:
npm run tsx /tmp/test-email.ts

# 6. Verificar:
# [ ] Email chegou em seu-email@gmail.com?
# [ ] Template está formatado?
# [ ] Links funcionam?
# [ ] Logo aparece?

# NOTA: Se usar Mailtrap no dev:
# - Emails vão para caixa virtual Mailtrap (não real)
# - Em PRODUÇÃO, usar SendGrid/Resend real
```

---

### ⏰ DIA 4-5 (29-30 Dez) - 2 horas cada

#### Dia 4: LGPD Review & Sentry Setup
```bash
# 1. Verificar Cookie Banner
# [ ] Site carrega com banner de cookies?
# [ ] Botões funcionam (Aceitar/Recusar)?
# [ ] Consent é salvo em localStorage?

# 2. Verificar Privacy Policy
# [ ] /privacy page existe?
# [ ] Menciona LGPD?
# [ ] Menciona direito ao esquecimento?

# 3. Enviar para advogado revisar
# Email: seu-advogado@email.com
# Anexos:
#   - docs/privacy.html
#   - client/src/components/CookieBanner.tsx
#   - server/routers/lgpd.ts
# Prazo: 24h para revisar

# 4. Setup Sentry
npm install @sentry/node @sentry/react

# 5. Adicionar em server/_core/index.ts
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: "https://seu-dsn@sentry.io/project",
  environment: "production",
  tracesSampleRate: 1.0,
});

# 6. Test Sentry com erro intencional
# Ir em admin, chamar endpoint de teste:
# /api/test-error
# Deve receber aviso em Sentry dashboard
```

#### Dia 5: Documentação Final
```bash
# 1. Atualizar README.md
# - Status: v1.0.0 PRONTO PARA PRODUÇÃO
# - Remover seções "TODO"
# - Adicionar seção "Known Issues"

# 2. Criar DEPLOYMENT_CHECKLIST.md
[  ] Env vars em produção?
[  ] Backup MySQL ativo?
[  ] HTTPS configurado?
[  ] CORS correto?
[  ] Rate limiting ativo?
[  ] Sentry conectado?
[  ] Email provider (SendGrid/Resend) ativo?
[  ] Stripe live keys (não sandbox)?
[  ] Admin criado?
[  ] Health check endpoint ativo?

# 3. Criar ROLLBACK_PLAN.md
# Se algo der muito errado em produção:
# - Como revert para versão anterior?
# - Como restaurar backup do banco?
# - Quem chamar em emergência?

# 4. Update CHANGELOG
Version 1.0.0 - 2025-12-26
- ✅ Autenticação OAuth
- ✅ Diagnóstico Elevare
- ✅ CRM Leads
- ✅ Geração de Conteúdo (IA)
- ✅ Sistema de Créditos
- ✅ Pagamento Stripe
- ✅ Email Transacional
- ✅ LGPD Compliance
- ✅ Adapter Pattern (Logging, Email, Cache)

⚠️ Known Issues:
- Sem cache de IA (implementar em v1.1)
- Sem lazy loading listas (implementar em v1.1)
- Sem WhatsApp integrada (roadmap v1.1)

Roadmap v1.1 (próximas 4 semanas):
- [ ] Testes automatizados (Jest/Vitest)
- [ ] WhatsApp Business API
- [ ] Análise preditiva com ML
- [ ] Mobile app (React Native)
```

---

### ⏰ DIA 6-7 (31 Dez - 2 Jan) - 1 hora cada

#### Dia 6: Deploy Staging
```bash
# 1. Deploy em staging (Railway)
# Railway deve fazer auto-deploy ao push em `main`

# 2. Testar staging URL
# https://[seu-app]-staging.up.railway.app

# [ ] Login funciona?
# [ ] Geração de conteúdo funciona?
# [ ] Créditos funcionam?
# [ ] Email envia (Mailtrap)?

# 3. Se tudo ok:
git tag v1.0.0-rc1
git push origin v1.0.0-rc1
```

#### Dia 7: Deploy Produção
```bash
# ⚠️ ÚLTIMO PASSO - Fazer de manhã cedo

# 0. Backup de tudo
# [ ] MySQL backup feito? (Railway)
# [ ] Código em Git com tag? (v1.0.0)

# 1. Merge para produção
git checkout main
git merge staging
git push origin main

# 2. Railway faz deploy automático
# Monitora: https://railway.app/dashboard
# Status deve virar 🟢 green após 5 min

# 3. Testar produção
curl https://seu-app.railway.app/api/health
# Deve retornar: {"status": "ok"}

# 4. Fazer login em produção
# https://seu-app.railway.app
# Testar: Diagnóstico completo (da início ao fim)

# 5. Anunciar para usuários
# Email: "Elevare AI está vivo!"
# Slack/Discord do time

# 6. Monitorar por 24h
# [ ] Sentry zerado (nenhum erro)?
# [ ] Logs normais?
# [ ] Usuários conseguem fazer fluxo completo?
# [ ] Email chegando?
```

---

## 🎯 TAREFAS POR PESSOA

### Dev 1 - Backend
- [ ] Dia 1: Setup & verificações
- [ ] Dia 2: Happy path testing
- [ ] Dia 3: Stripe webhook test
- [ ] Dia 4: Sentry setup
- [ ] Dia 5-7: Deploy & monitoramento

**Responsável:** CTO/Tech Lead

### Dev 2 - Frontend (se existir)
- [ ] Dia 2: Happy path testing
- [ ] Dia 4: Email testing
- [ ] Dia 5: Documentação
- [ ] Dia 6-7: Staging/Produção

**Responsável:** Frontend Lead

### PM/CEO
- [ ] Dia 1: Comunicar timeline com time
- [ ] Dia 5: Enviar para advogado revisar LGPD
- [ ] Dia 6: Aprovar deploy
- [ ] Dia 7: Anunciar para usuários

**Responsável:** Product Owner

---

## 📋 CHECKLIST DE LANÇAMENTO

Antes de ir para produção, verificar:

### Segurança
- [ ] HTTPS em prod? (Railway auto-configura)
- [ ] Senhas hasheadas? (bcrypt)
- [ ] JWT tokens expiram? (30 dias)
- [ ] OAuth funciona? (Manus integrado)
- [ ] Rate limiting ativo? (express-rate-limit)
- [ ] CORS correto? (não wildcard *)
- [ ] Headers de segurança? (Helmet)
- [ ] SQL injection protection? (Drizzle ORM)

### Banco de Dados
- [ ] Backup automático? (Railway)
- [ ] Índices criados? (userId, createdAt)
- [ ] Tabelas criadas? (13 tabelas)
- [ ] Migrations rodaram? (6 migrações)

### Variáveis de Ambiente
- [ ] DATABASE_URL correto?
- [ ] GEMINI_API_KEY correto?
- [ ] STRIPE_SECRET_KEY correto? (não sandbox)
- [ ] STRIPE_PUBLISHABLE_KEY correto?
- [ ] STRIPE_WEBHOOK_SECRET correto?
- [ ] SENDGRID_API_KEY ou RESEND_API_KEY?
- [ ] JWT_SECRET gerado? (32+ caracteres)
- [ ] NODE_ENV = "production"?

### Features Críticas
- [ ] Login/Logout funciona?
- [ ] Diagnóstico completo (9 perguntas)?
- [ ] Geração de conteúdo (8 tipos)?
- [ ] Créditos debitam corretamente?
- [ ] Stripe upgrade funciona?
- [ ] Email envia ao cadastro?
- [ ] Admin consegue fazer login?

### Monitoring
- [ ] Sentry conectado?
- [ ] Health check endpoint ativa?
- [ ] Logs visíveis (Pino)?
- [ ] Alertas de erro configurados?

### Documentação
- [ ] README atualizado?
- [ ] CHANGELOG preenchido?
- [ ] DEPLOYMENT_CHECKLIST criado?
- [ ] ROLLBACK_PLAN criado?

---

## 🚨 PLANO DE EMERGÊNCIA

Se algo der muito errado em produção:

### Cenário 1: Usuário não consegue fazer login
```
Ação:
1. Verificar se OAuth está respondendo
2. Checar se admin usuário existe
3. Restart server (Railway Dashboard → Redeploy)
4. Se problema persistir: revert para versão anterior
   git revert HEAD~1 && git push origin main
```

### Cenário 2: Créditos estão sendo consumidos errado
```
Ação:
1. Parar gerações (desligar endpoint temporariamente)
2. Investigar checkCredits() vs consumeCredits()
3. Fazer patch e deploy
4. Restaurar créditos de usuários afetados (SQL manual)
```

### Cenário 3: Stripe webhook não está funcionando
```
Ação:
1. Verificar STRIPE_WEBHOOK_SECRET em produção
2. Testar webhook manualmente com Stripe CLI
3. Se erro 401: secret errado, atualizar
4. Se erro 500: bug no handler, investigar logs (Sentry)
```

### Cenário 4: Email não está chegando
```
Ação:
1. Verificar SENDGRID_API_KEY está correto
2. Testar SendGrid API manualmente
3. Verificar email está em spam (não em inbox)
4. Se SendGrid down: ativar Resend como fallback
```

### Número de Emergência
- CTO: [número]
- PM: [número]
- Dev: [número]

Whatsapp grupo: "Elevare On-Call"

---

## 💰 INVESTIMENTO RESUMIDO

| Tarefa | Dev | Custo (R$ 300/h) |
|--------|-----|------------------|
| Setup & Verificação | 3h | R$ 900 |
| Happy Path Tests | 4h | R$ 1.200 |
| Stripe Webhook | 2h | R$ 600 |
| Email Test | 1h | R$ 300 |
| LGPD Review | 1h | R$ 300 |
| Sentry Setup | 1h | R$ 300 |
| Documentação | 1h | R$ 300 |
| Deploy & Monitor | 2h | R$ 600 |
| **TOTAL** | **15h** | **R$ 4.500** |

---

## 🎯 SUCESSO

Quando você completar este plano:
- ✅ Score sobe de 7.8 → 8.5/10
- ✅ Zero bugs conhecidos
- ✅ Tudo testado manualmente
- ✅ Stripe funciona
- ✅ Email funciona
- ✅ Monitoramento ativo
- ✅ Documentação atualizada
- ✅ **Pronto para lançar com confiança**

---

**Plano Prático | Fase 1 | Elevare AI | v1.0**  
**Próximo passo:** Começar HOJE!
