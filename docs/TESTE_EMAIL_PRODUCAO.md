# 📧 Guia de Teste de Email em Produção

## 📋 Visão Geral

Este guia documenta como testar **todos os 5 templates de email** do Elevare em produção de forma segura, usando SendGrid ou Resend.

**Status:** ✅ Sistema de email implementado e pronto para teste  
**Última atualização:** Dezembro 2025

---

## 🎯 Objetivo

Validar que o sistema de email funciona corretamente em produção antes do lançamento, testando:

1. ✉️ Email de Boas-vindas
2. ✅ Confirmação de Assinatura
3. ⚠️ Alerta de Créditos Baixos
4. 🔄 Lembrete de Renovação
5. 🔐 Redefinição de Senha

---

## 🔧 Pré-requisitos

### 1. Configurar Provider de Email

**Opção A: SendGrid (Recomendado)**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Elevare <noreply@elevare.app>"
```

**Opção B: Resend**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Elevare <noreply@elevare.app>"
```

### 2. Configurar Email de Teste

Adicione no seu arquivo `.env`:
```bash
TEST_EMAIL=seu-email@gmail.com
```

**⚠️ IMPORTANTE:** Use seu próprio email para receber os testes de forma segura.

---

## 🚀 Como Executar

### Modo 1: Envio Real (Produção)

```bash
# Definir email de teste
TEST_EMAIL=seu-email@gmail.com pnpm test:email
```

### Modo 2: Dry Run (Simulação)

```bash
# Testar sem enviar emails de verdade
pnpm test:email:dry
```

### Modo 3: Linha de Comando Direto

```bash
# Executar diretamente com tsx
TEST_EMAIL=seu-email@gmail.com pnpm tsx scripts/test-email-production.ts

# Dry run direto
DRY_RUN=true TEST_EMAIL=seu-email@gmail.com pnpm tsx scripts/test-email-production.ts
```

---

## 📊 Exemplo de Saída

### Execução Bem-Sucedida

```bash
$ TEST_EMAIL=dev@elevare.com pnpm test:email

🚀 ============================================================
📧 TESTE DE EMAILS EM PRODUÇÃO - Elevare AI
🚀 ============================================================

🔍 Validando configuração...
✅ Provider configurado: SendGrid
📧 Emails serão enviados para: dev@elevare.com

📋 Iniciando testes...

📨 Testando: 1. Email de Boas-vindas...
✅   Enviado! Message ID: <abc123@sendgrid.net>

📨 Testando: 2. Confirmação de Assinatura...
✅   Enviado! Message ID: <def456@sendgrid.net>

📨 Testando: 3. Alerta de Créditos Baixos...
✅   Enviado! Message ID: <ghi789@sendgrid.net>

📨 Testando: 4. Lembrete de Renovação...
✅   Enviado! Message ID: <jkl012@sendgrid.net>

📨 Testando: 5. Redefinição de Senha...
✅   Enviado! Message ID: <mno345@sendgrid.net>

📊 ============================================================
📈 RELATÓRIO DE TESTES
📊 ============================================================

📧 Provider: SendGrid
📬 Email de teste: dev@elevare.com
📝 Total de templates: 5
✅ Sucesso: 5

📥 Verifique sua caixa de entrada: dev@elevare.com
💡 Nota: Emails de teste têm prefixo [TESTE] no assunto

🎉 TODOS OS TESTES PASSARAM! Sistema de email funcionando ✅
```

### Modo Dry Run

```bash
$ pnpm test:email:dry

🚀 ============================================================
📧 TESTE DE EMAILS EM PRODUÇÃO - Elevare AI
🚀 ============================================================

🔍 Validando configuração...
✅ Provider configurado: SendGrid
📧 Emails serão enviados para: dev@elevare.com
⚠️ Modo DRY_RUN ativado - Nenhum email será enviado de verdade

📋 Iniciando testes...

📨 Testando: 1. Email de Boas-vindas...
⏭️   [DRY RUN] Email não enviado

... (5 templates simulados)

📊 ============================================================
📈 RELATÓRIO DE TESTES
📊 ============================================================

📧 Provider: SendGrid
📬 Email de teste: dev@elevare.com
📝 Total de templates: 5
✅ Sucesso: 5

⚠️ Modo DRY_RUN - Nenhum email foi enviado de verdade

🎉 TODOS OS TESTES PASSARAM! Sistema de email funcionando ✅
```

---

## 🔍 O Que é Testado

### 1. Email de Boas-vindas
- **Quando:** Novo usuário se cadastra
- **Conteúdo:** Saudação, principais recursos, link para dashboard
- **Template:** `welcomeEmail()`

### 2. Confirmação de Assinatura
- **Quando:** Usuário assina um plano pago
- **Conteúdo:** Detalhes do plano, créditos, data de renovação
- **Template:** `subscriptionConfirmationEmail()`

### 3. Alerta de Créditos Baixos
- **Quando:** Usuário tem poucos créditos restantes
- **Conteúdo:** Créditos restantes, call-to-action para upgrade
- **Template:** `lowCreditsEmail()`

### 4. Lembrete de Renovação
- **Quando:** 3-7 dias antes da renovação da assinatura
- **Conteúdo:** Data de renovação, valor, link para gerenciar
- **Template:** `renewalReminderEmail()`

### 5. Redefinição de Senha
- **Quando:** Usuário solicita reset de senha
- **Conteúdo:** Link seguro, tempo de expiração, avisos de segurança
- **Template:** `passwordResetEmail()`

---

## ⚠️ Troubleshooting

### Erro: "Configure TEST_EMAIL"

**Causa:** Variável `TEST_EMAIL` não configurada

**Solução:**
```bash
# Adicionar no .env
TEST_EMAIL=seu-email@gmail.com

# Ou passar diretamente
TEST_EMAIL=seu-email@gmail.com pnpm test:email
```

### Erro: "Configure SENDGRID_API_KEY ou RESEND_API_KEY"

**Causa:** Nenhum provider de email configurado

**Solução:**
```bash
# Adicionar no .env (escolha um)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# ou
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Erro: "SendGrid error: 401"

**Causa:** API key inválida ou expirada

**Solução:**
1. Verificar a API key no dashboard do SendGrid
2. Gerar nova API key se necessário
3. Atualizar no `.env`

### Erro: "Resend error: 403"

**Causa:** Domínio não verificado ou API key sem permissões

**Solução:**
1. Verificar domínio no dashboard do Resend
2. Verificar permissões da API key
3. Usar email de teste do Resend: `onboarding@resend.dev`

### Emails não chegam

**Possíveis causas:**
1. Email foi para spam/lixeira
2. Demora na entrega (aguardar 1-2 minutos)
3. Email bloqueado pelo servidor de destino

**Checklist:**
- ✅ Verificar pasta de spam
- ✅ Aguardar alguns minutos
- ✅ Tentar com outro email
- ✅ Verificar logs do provider

---

## 🔐 Segurança

### ✅ Boas Práticas

1. **Nunca commitar API keys** no repositório
2. **Use .env** para armazenar credenciais
3. **Teste com seu próprio email** antes de enviar para usuários
4. **Use prefixo [TESTE]** nos assuntos para identificar emails de teste
5. **Delay entre envios** (2 segundos) para evitar rate limiting

### ⚠️ O Que NUNCA Fazer

❌ Enviar emails de teste para usuários reais  
❌ Usar emails de produção em ambientes de teste  
❌ Commitar `.env` com API keys reais  
❌ Executar script sem configurar `TEST_EMAIL`

---

## 📝 Checklist Pré-Lançamento

Antes de lançar em produção, execute e valide:

- [ ] ✅ Script executado com sucesso
- [ ] ✅ Todos os 5 templates enviados
- [ ] ✅ Emails recebidos na caixa de entrada
- [ ] ✅ Templates renderizados corretamente (HTML)
- [ ] ✅ Links funcionando
- [ ] ✅ Design responsivo (testar em mobile)
- [ ] ✅ Sem erros de ortografia/gramática
- [ ] ✅ Imagens carregando (se houver)
- [ ] ✅ Footer com links de privacidade/unsubscribe

---

## 🛠️ Desenvolvimento

### Estrutura do Script

```typescript
scripts/test-email-production.ts
├── validateConfig()      // Valida .env e providers
├── testTemplate()        // Testa um template específico
├── runAllTests()         // Executa todos os 5 templates
└── Relatório Final       // Exibe resultados
```

### Adicionar Novo Template

1. Criar template em `server/email/templates.ts`
2. Exportar no `server/email/index.ts`
3. Adicionar teste no script:

```typescript
results.newTemplate = await testTemplate(
  "6. Novo Template",
  newTemplateEmail({
    userName: "Teste",
    // ... outros parâmetros
  })
);
```

### Modificar Delay

```typescript
await sleep(2000); // 2 segundos (padrão)
await sleep(5000); // 5 segundos (se houver rate limiting)
```

---

## 📚 Referências

- **Email Client:** `server/email/client.ts`
- **Templates:** `server/email/templates.ts`
- **Script de Teste:** `scripts/test-email-production.ts`
- **SendGrid Docs:** https://docs.sendgrid.com/
- **Resend Docs:** https://resend.com/docs

---

## 🎯 Próximos Passos

Após validar os emails em produção:

1. ✅ Executar script e validar templates
2. ✅ Testar em diferentes clientes de email (Gmail, Outlook, etc)
3. ✅ Configurar monitoramento de entregas
4. ✅ Adicionar testes automatizados (se necessário)
5. ✅ Documentar problemas encontrados

---

## 📞 Suporte

**Problemas com o script?**
- Verificar logs em tempo real
- Consultar documentação do provider
- Testar com modo `DRY_RUN` primeiro

**Dúvidas sobre templates?**
- Consultar `server/email/templates.ts`
- Ver exemplos de uso no código
- Testar renderização HTML

---

**✅ Script desenvolvido para auditoria técnica - Item #3: "Falta testar email (1 teste manual)"**
