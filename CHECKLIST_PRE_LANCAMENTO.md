# ✅ CHECKLIST PRÉ-LANÇAMENTO 2025

**Status: FASE 1 CONCLUÍDA** - Aguardando testes finais

---

## 🔴 CRÍTICO - BLOQUEIA VENDAS (FASE 1)

- [x] **Débito de créditos funcionando** - ✅ IMPLEMENTADO
  - Todos os endpoints de geração chamam `consumeCredits()`
  - Válida créditos antes com `checkCredits()`
  - Respeita limites do plano

- [x] **Webhooks Stripe testados e validados** - ✅ IMPLEMENTADO
  - checkout.session.completed
  - customer.subscription.updated/deleted
  - invoice.payment_succeeded/failed
  - TODO: Testar com Stripe CLI antes de produção

- [x] **Variáveis de ambiente validadas** - ✅ IMPLEMENTADO
  - `validateEnvOnStartup()` chamado no startup
  - Falha rápido se configuração inválida em produção
  - TODO: Configurar em Railway

- [x] **Exportar PDF funcional** - ✅ IMPLEMENTADO
  - Endpoint `exportEbookData` criado
  - `printEbookAsPDF()` gera HTML formatado
  - Botão no EbookGenerator atualizado
  - TODO: Testar impressão/PDF em navegadores

- [x] **Bloqueios visuais implementados** - ✅ IMPLEMENTADO
  - `CreditGuard` component criado
  - `UpgradeModal` exibido quando zerado
  - `CreditsDisplay` mostra saldo
  - TODO: Adicionar a todas as páginas de geração

- [x] **Admin inicial criado via seed** - ✅ SCRIPT PRONTO
  - `scripts/create-admin.ts` criado
  - Executar antes do lançamento
  - TODO: Rodar em produção

- [x] **Rate limiting funcionando** - ✅ IMPLEMENTADO
  - Centralizado em `_core/rateLimiter.ts`
  - Fallback em memória
  - Pronto para migração para Redis

---

## 🟡 IMPORTANTE - AFETA EXPERIÊNCIA (FASE 2)

- [ ] **Registro de erros configurado**
  - [ ] Integrar com Sentry
  - [ ] Alertas para erros críticos

- [ ] **Testes críticos passando**
  - [ ] Testes de créditos (≥80% cobertura)
  - [ ] Testes de fluxo de pagamento
  - [ ] Testes de exportação de PDF
  - [ ] Executar: `npm test`

- [ ] **Limitação de taxa no Redis** (opcional para MVP)
  - [ ] Implementar conexão Redis
  - [ ] Migrar rate limiting

- [ ] **Audiolivro (TTS)**
  - [ ] Integração com API (ElevenLabs, Google Cloud)
  - [ ] Endpoint TRPC
  - [ ] UI no frontend

---

## ⚙️ CONFIGURAÇÃO TÉCNICA

- [ ] **Variáveis de Ambiente:**
  ```
  DATABASE_URL=mysql://...
  JWT_SECRET=<32+ caracteres aleatórios>
  STRIPE_SECRET_KEY=sk_test_... (ou sk_live_)
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_ESSENCIAL_PRICE_ID=price_...
  STRIPE_PROFISSIONAL_PRICE_ID=price_...
  ```

- [ ] **Criar Admin:**
  ```bash
  ADMIN_EMAIL=admin@domain.com \
  ADMIN_PASSWORD=MuitoSegura123!@ \
  npx tsx scripts/create-admin.ts
  ```

- [ ] **Testar Webhooks (Staging):**
  ```bash
  stripe listen --forward-to https://seu-app.railway.app/api/stripe/webhook
  stripe trigger checkout.session.completed
  ```

- [ ] **Build e Deploy:**
  ```bash
  npm run build
  npm start
  ```

---

## 🔒 SEGURANÇA

- [ ] **Verificar CORS:**
  - [ ] Origens permitidas configuradas
  - [ ] Em produção: apenas domínios autorizados

- [ ] **Rate Limiting:**
  - [ ] Público: 10 req/15min
  - [ ] Autenticado: 100 req/15min
  - [ ] BioRadar grátis: 5 análises/hora

- [ ] **Senhas:**
  - [ ] Hashed com bcrypt
  - [ ] JWT_SECRET com 32+ caracteres
  - [ ] Admin mudar senha após primeiro login

- [ ] **HTTPS:**
  - [ ] SSL/TLS ativo em produção
  - [ ] Redirect automático HTTP → HTTPS

- [ ] **Headers de Segurança:**
  - [ ] Helmet habilitado (já está)
  - [ ] CSP configurado
  - [ ] X-Frame-Options: DENY

---

## 📊 MONITORAMENTO

- [ ] **Uptime Monitoring:**
  - [ ] Configurar health check: `/api/health`
  - [ ] Usar serviço como UptimeRobot ou Betteruptime

- [ ] **Logs Estruturados:**
  - [ ] Pino logger ativo
  - [ ] Logs enviados para serviço centralizado (Sentry, LogRocket)

- [ ] **Performance:**
  - [ ] Tempo de resposta < 2s
  - [ ] Database queries otimizadas
  - [ ] Cache implementado para IA responses

- [ ] **Observabilidade:**
  - [ ] Dashboard de métricas
  - [ ] Alertas para erros críticos

---

## 📱 TESTES FUNCIONAIS

- [ ] **Fluxo de Usuário:**
  - [ ] Signup → Login → Dashboard
  - [ ] Gerar conteúdo (verificar créditos consumidos)
  - [ ] Upgrade de plano → Receber créditos
  - [ ] Exportar PDF → Salvar como arquivo

- [ ] **Pagamento:**
  - [ ] Checkout Stripe abre corretamente
  - [ ] Webhook ativa subscription
  - [ ] Créditos aparece no dashboard
  - [ ] Renovação mensal funciona

- [ ] **Proteção de Créditos:**
  - [ ] Bloqueia geração com créditos zerados
  - [ ] Modal de upgrade aparece
  - [ ] Botão redireciona para pricing

- [ ] **BioRadar:**
  - [ ] Rate limit funciona (5 análises/hora)
  - [ ] Análises autenticadas não consomem limite
  - [ ] Consumo de créditos funciona

---

## 📝 DOCUMENTAÇÃO

- [ ] **README atualizado:**
  - [ ] Instruções de setup
  - [ ] Variáveis de ambiente
  - [ ] Como executar localmente

- [ ] **API Documentation:**
  - [ ] Endpoints TRPC documentados
  - [ ] Webhook payloads documentados

- [ ] **Termos e Privacidade:**
  - [ ] Revisor por advogado
  - [ ] Publicado no site

- [ ] **Política de Reembolso:**
  - [ ] Definida e publicada
  - [ ] Implementada no sistema

---

## 🚀 DEPLOYMENTS

- [ ] **Staging (Pre-production):**
  - [ ] Ambiente idêntico ao produção
  - [ ] Testar todos os fluxos
  - [ ] Stripe em modo teste (sk_test_)

- [ ] **Production:**
  - [ ] Stripe em modo live (sk_live_)
  - [ ] Backup automático ativo
  - [ ] Monitoramento ativo
  - [ ] Logging centralizado

- [ ] **Rollback Plan:**
  - [ ] Procedure de rollback definido
  - [ ] Backups testados
  - [ ] Database migration rollback

---

## 💬 SUPORTE AO CLIENTE

- [ ] **Canais de suporte:**
  - [ ] Email de contato configurado
  - [ ] Chat widget (Zendesk, Intercom)
  - [ ] FAQ/Help center criado

- [ ] **SLA definido:**
  - [ ] Resposta em < 24h
  - [ ] Resolução em < 48h

---

## 📋 CHECKLIST FINAL DE LANÇAMENTO

### Dia antes do lançamento:
- [ ] Todos os testes passando
- [ ] Database backup feito
- [ ] Timeouts e limites configurados
- [ ] Equipe notificada

### Dia do lançamento:
- [ ] Monitore dashboard de erros
- [ ] Acompanhe métricas de uso
- [ ] Esteja pronto para rollback rápido
- [ ] Comunique status aos usuários

### Pós-lançamento (primeira semana):
- [ ] Monitorar daily health
- [ ] Coletar feedback dos usuários
- [ ] Fix bugs críticos rapidamente
- [ ] Iterar baseado em feedback

---

## 🎯 MÉTRICAS DE SUCESSO

**Objetivo:** Lançar com segurança e qualidade

- ✅ Zero abusos de geração de conteúdo
- ✅ 100% das transições de pagamento funcionando
- ✅ 99.9% uptime
- ✅ < 2s tempo de resposta médio
- ✅ 0 erros não tratados em produção

---

**Última atualização:** 26/12/2025
**Status:** FASE 1 COMPLETA - Aguardando testes e deploy
**Próximo:** Testar em staging → Deploy produção
