# ✅ PLANO DE AÇÃO EXECUTIVO - ELEVARE AI

**Objetivo:** Levar o projeto de 6.5/10 → 9.5/10 em 2 meses  
**Data:** 26 de Dezembro de 2024  
**Público:** CEO + Tech Lead

---

## 🎯 OBJETIVO FINAL

**Vender com confiança.** Um produto com:
- ✅ Zero bugs críticos
- ✅ LGPD completa
- ✅ Features implementadas (não mockadas)
- ✅ Testes passando
- ✅ Integração WhatsApp operacional

---

## 📅 CRONOGRAMA REALISTA - 2 MESES

### SEMANA 1-2: EMERGÊNCIA (Bloqueadores)
**Objetivo:** Tudo que impede lançamento agora

#### Segunda-Feira (1-2h)
- [ ] **Corrigir VeoCinema.tsx**
  ```
  Arquivo: client/src/pages/VeoCinema.tsx:80
  Mudar: generateContent → generateReelScript
  Testar: Clicar em "Gerar Roteiro" não dá erro
  ```
- [ ] **Corrigir AdsManager.tsx**
  ```
  Arquivo: client/src/pages/AdsManager.tsx:55
  Mudar: generateContent → generateAd
  Testar: Clicar em "Gerar Campanha" não dá erro
  ```

#### Terça-Quarta (3h)
- [ ] **Testar Webhook Stripe**
  ```bash
  # Terminal 1
  stripe listen --forward-to http://localhost:3000/api/stripe/webhook

  # Terminal 2
  stripe trigger checkout.session.completed

  # Verificar no banco:
  SELECT * FROM subscription WHERE status = 'active';
  # Deve mostrar subscription criada
  ```
- [ ] **Testar Débito de Créditos**
  ```bash
  # Login como usuário free
  # Tentar gerar e-book
  # Verificar se crédito foi debitado:
  SELECT credits FROM subscription WHERE userId = 'xxx';
  ```

#### Quinta-Sexta (8h)
- [ ] **LGPD - Fase 1: Essencial**
  - Implementar cookie consent banner (SirketJS ou similar)
  - Adicionar botão "Excluir minha conta"
  - Criar endpoint DELETE /user/:id
  - Testar se dados são realmente deletados
  - Avisar usuário por e-mail antes de deletar (72h delay)

#### Final da Semana (5h)
- [ ] **Backup do Banco - Setup Automático**
  ```
  Via Railway:
  1. Acessar Dashboard do Railway
  2. Ir para Database MySQL
  3. Ativar "Backups automáticos"
  4. Configurar para fazer backup diário
  5. Testar restore em staging
  ```

**Deliverables:**
- VeoCinema e AdsManager funcionando
- Webhook Stripe testado e aprovado
- LGPD cookie banner visível
- Backups automáticos rodando

---

### SEMANA 3-4: TESTES CRÍTICOS
**Objetivo:** Implementar testes para features monetizadas

#### Testes de Créditos (15h)
```bash
# arquivo: server/__tests__/credits.test.ts
# Coverage esperada: 85%

✅ Test 1: checkCredits() bloqueia com 0 créditos
✅ Test 2: consumeCredits() decrementa corretamente
✅ Test 3: Admin tem créditos infinitos
✅ Test 4: Free user pode gerar 1 coisa
✅ Test 5: Plano essencial tem 100 créditos
✅ Test 6: Erro na geração não consome crédito
```

#### Testes de Webhook Stripe (20h)
```bash
# arquivo: server/__tests__/stripe.test.ts
# Coverage esperada: 90%

✅ Test 1: checkout.session.completed ativa subscription
✅ Test 2: customer.subscription.updated atualiza plan
✅ Test 3: invoice.payment_failed marca como falha
✅ Test 4: Assinatura cria subscription no banco
✅ Test 5: Créditos são adicionados corretamente
✅ Test 6: Webhook duplicado não cria 2x
```

#### Testes de Autenticação (10h)
```bash
# arquivo: server/__tests__/auth.test.ts

✅ Test 1: Login cria sessão JWT
✅ Test 2: Token expirado rejeita
✅ Test 3: Logout limpa cookie
✅ Test 4: Rotas protegidas bloqueiam sem auth
✅ Test 5: Admin pode acessar adminProcedure
```

#### Testes de Exportação PDF (5h)
```bash
# arquivo: client/__tests__/pdfGenerator.test.ts

✅ Test 1: PDF gera sem erros
✅ Test 2: Título está correto
✅ Test 3: Conteúdo está completo
```

#### Executar em CI/CD
```bash
# GitHub Actions roda testes a cada push
# Se teste falha → bloqueia merge para main
```

**Deliverables:**
- 50+ testes implementados
- Coverage >80% em features críticas
- CI/CD roda e bloqueia regressões

---

### SEMANA 5-6: INTEGRAÇÕES IMPORTANTES
**Objetivo:** WhatsApp e Email

#### Email Transacional - SendGrid (20h)
**Por quê:** Usuário precisa confirmar cadastro, receber recibos

```typescript
// server/routers/email.ts - IMPLEMENTAR

// ✅ sendWelcomeEmail(userId)
// ✅ sendPaymentReceiptEmail(userId, amount)
// ✅ sendLeadNotificationEmail(adminId, lead)
// ✅ sendAccountDeletionWarning(userId)

// Templates:
// - Welcome (branding Elevare)
// - Payment receipt (logo, detalhes)
// - Lead notification (novo lead capturado)
// - Account deletion (aviso 72h)
```

**Setup:**
1. Criar conta SendGrid
2. Configurar domínio (verify DKIM/SPF)
3. Criar templates
4. Integrar API
5. Testar com fake email
6. Deploy em staging

#### WhatsApp Business API (40h)
**Por quê:** CRM precisa de integração real, não manual

**Escopo Mínimo (MVP):**
- [ ] Webhook para receber mensagens
- [ ] Enviar scripts de vendas via WhatsApp
- [ ] Marcar como "respondido" quando usuário responde
- [ ] Histórico de mensagens no CRM

```typescript
// server/routers/whatsapp.ts - NOVO

// ✅ sendWhatsAppMessage(leadId, template)
// ✅ handleWhatsAppWebhook(event)
// ✅ getWhatsAppConversation(leadId)
// ✅ getWhatsAppStats()
```

**Setup:**
1. Criar Business Account no WhatsApp
2. Gerar Phone Number ID
3. Integrar API oficial
4. Criar templates de mensagem
5. Testar com número de teste
6. Deploy em staging

**Estimativa mais realista:**
- API integration: 25h
- Templates e flows: 10h
- Testing: 5h
- Total: 40h

**Deliverables:**
- SendGrid configurado e testado
- Emails chegando (welcome, recibos, notificações)
- WhatsApp integrado (MVP)
- Mensagens via WhatsApp funcionando

---

### SEMANA 7-8: OTIMIZAÇÕES E POLISH
**Objetivo:** Escalar e afinar

#### Corrigir N+1 Queries (8h)
```typescript
// server/routers/crm.ts
// ANTES: 100 leads = 200 queries
// DEPOIS: 100 leads = 1 query

// ✅ Usar join ao invés de loop
// ✅ Índices corretos no banco
// ✅ Verificar com EXPLAIN
```

#### Implementar Cache Redis (15h)
```typescript
// server/_core/cache.ts
// Cache IA responses por 30 dias

// ✅ Gera e-book → salva em Redis
// ✅ Próximo usuário com prompt igual → usa cache
// ✅ Economia: 40% das requisições à IA
```

#### Alertas Sentry (5h)
```typescript
// Erros em produção → notificação automática

// ✅ Erro crítico → aviso no Slack
// ✅ 10+ erros/hora → alert
// ✅ Database down → notify
```

#### Performance Lighthouse (5h)
```
ALVO: Score > 80 em mobile

☐ Lazy load componentes
☐ Comprimir imagens
☐ Remove imports não usados
☐ Code split
☐ Minimize bundle
```

**Deliverables:**
- Performance score >80
- Cache Redis em produção
- Sentry alertas rodando
- N+1 queries corrigidas

---

## 📊 QUADRO DE CONTROLE

### Status por Semana

#### Semana 1-2: EMERGÊNCIA ✋
```
[████████████████────────────] 60%

✅ VeoCinema/AdsManager fixed
✅ Webhook testado
✅ LGPD fase 1
✅ Backups configurados

❌ Testes ainda não
❌ WhatsApp ainda não
❌ Email ainda não
```

#### Semana 3-4: TESTES 🧪
```
[████████████████████────────] 70%

✅ Tudo de antes
✅ 50+ testes
✅ CI/CD rodando
✅ Coverage >80%

❌ WhatsApp/Email ainda não
```

#### Semana 5-6: INTEGRAÇÕES 🔗
```
[████████████████████████────] 85%

✅ Tudo de antes
✅ Email transacional
✅ WhatsApp MVP
✅ Testes de integração

❌ Otimizações ainda não
```

#### Semana 7-8: POLISH 💎
```
[████████████████████████████] 100%

✅ Tudo funcionando
✅ Performance otimizada
✅ Alerts configurados
✅ Pronto para escalar
```

---

## 💰 ORÇAMENTO REALISTA

### Desenvolvimento (237h)
| Semana | Fase | Dev | Hours | Cost |
|--------|------|-----|-------|------|
| 1-2 | Emergência | 1 dev | 20h | R$ 6.000 |
| 3-4 | Testes | 1 dev | 50h | R$ 15.000 |
| 5-6 | Integrações | 1-2 devs | 60h | R$ 18.000 |
| 7-8 | Polish | 1 dev | 40h | R$ 12.000 |
| **TOTAL** | | | **170h** | **R$ 51.000** |

### Serviços (Mensais em Produção)
| Serviço | Custo | Função |
|---------|-------|--------|
| SendGrid | R$ 15 | Email transacional |
| WhatsApp Business | R$ 0,50/msg | Mensagens WhatsApp |
| Sentry | R$ 250 | Error tracking |
| Redis (Railway) | R$ 30 | Cache |
| Database Backup | Incluído | Backups automáticos |
| **TOTAL/MÊS** | **R$ ~300** | |

### Um Tempo (Consulting/Review)
| Item | Horas | Custo |
|------|-------|-------|
| Review de segurança | 10h | R$ 3.000 |
| Review de LGPD (advogado) | 5h | R$ 5.000 |
| Code review antes de lançar | 8h | R$ 2.400 |
| **TOTAL** | **23h** | **R$ 10.400** |

### **INVESTIMENTO TOTAL**
- **Dev:** R$ 51.000
- **Reviews:** R$ 10.400
- **Serviços/mês:** ~R$ 300
- **TOTAL:** ~R$ 61.400 (uma vez) + R$ 300/mês

---

## ⚠️ RISCOS E MITIGAÇÃO

### Risco 1: Webpack Stripe é mais complexo que parece
**Probability:** 30% | **Impact:** 5 dias de atraso

**Mitigação:**
- Testar webhook antes de começar integração WhatsApp
- Ter especialista em Stripe review antes de deploy
- Testar com Stripe staging antes de prod

---

### Risco 2: Email delivery rate baixa
**Probability:** 20% | **Impact:** Experiência ruim

**Mitigação:**
- SendGrid tem 99% deliverability
- Seguir SPF/DKIM/DMARC
- Monitorar bounce rate
- Warmup de IP antes de escalar

---

### Risco 3: WhatsApp API é lenta para integrar
**Probability:** 40% | **Impact:** 15 dias de atraso

**Mitigação:**
- Usar biblioteca de wrapper (twilio/whatsapp)
- Testar fluxo básico antes de features avançadas
- Ter plano B: integração manual com links de chat

---

### Risco 4: LGPD exige mais do que pensamos
**Probability:** 30% | **Impact:** Multa legal

**Mitigação:**
- Revisar com advogado especializado
- Implementar tudo que ele pedir
- Documentar tudo para auditoria futura

---

## 🎬 PRIMEIRO PASSO - HOJE

### Ação Imediata (Próximas 2 horas)
```bash
# 1. Corrigir VeoCinema
# vim client/src/pages/VeoCinema.tsx
# Mudar linha 80

# 2. Corrigir AdsManager  
# vim client/src/pages/AdsManager.tsx
# Mudar linha 55

# 3. Testar
npm run build
npm test (se tiver)

# 4. Commit
git add .
git commit -m "Fix: Corrigir chamadas a generateReelScript e generateAd"
git push
```

### Esta Semana
```bash
# 1. Testar Stripe webhook
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
# Verificar no banco: SELECT * FROM subscription;

# 2. Chamar advogado
# Enviar código atual + README
# Pedir: "Está LGPD completo?"

# 3. Setup Backup
# Abrir Railway
# Ativar automatic backups
# Testar restore

# 4. Começar testes
# Criar arquivo: server/__tests__/credits.test.ts
# Escrever primeiros testes
```

---

## 📞 SUPORTE

**Se tiver dúvida:**
1. Revisar este documento
2. Revisar DIAGNOSTICO_HONESTO_AUDITORIA_SÊNIOR.md
3. Procurar no código comentado (BUG-XXX)

**Contato técnico:**
- Lead dev do projeto
- Ou revisor de segurança

---

## ✅ CHECKLIST FINAL

### Antes de Lançar
- [ ] Corrigir VeoCinema e AdsManager
- [ ] Testar webhook Stripe (com Stripe CLI)
- [ ] Testar débito de créditos (manualmente)
- [ ] LGPD cookie banner visible
- [ ] Direito ao esquecimento implementado
- [ ] Backup automático configurado e testado
- [ ] Testes de créditos passando
- [ ] Testes de webhook passando
- [ ] Testes de auth passando
- [ ] SendGrid enviando emails
- [ ] WhatsApp enviando mensagens
- [ ] Sentry recebendo erros
- [ ] Performance score >80
- [ ] Advogado aprovou LGPD
- [ ] Code review passou
- [ ] Deploy manual testado em staging
- [ ] Rollback plan documentado
- [ ] Monitoramento ativo (uptime, errors, performance)

### Go/No-Go Decision
```
Sim para TODOS itens acima?
→ PODE LANÇAR COM CONFIANÇA

Não em algum?
→ Não lance ainda, complete primeiro
```

---

**Documento criado em:** 26 de Dezembro de 2024  
**Prioridade:** ALTÍSSIMA  
**Status:** EXECUTAR AGORA
