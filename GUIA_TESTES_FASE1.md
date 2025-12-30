# 🧪 GUIA DE TESTES - FASE 1

Complete esses testes antes do lançamento.

---

## 🔴 TESTES CRÍTICOS (Obrigatório fazer antes do lançamento)

### 1. Teste de Consumo de Créditos

**Objetivo:** Verificar se créditos são debitados corretamente

**Procedimento:**
1. Criar novo usuário no sistema
2. Verificar saldo inicial (deve ser plano "free" com 1 crédito)
3. Tentar gerar conteúdo:
   - ❌ Deve falhar com mensagem "Créditos insuficientes"
4. Fazer upgrade para plano "essencial" (5 créditos)
5. Aguardar webhook (ou manualmente adicionar créditos)
6. Tentar gerar conteúdo:
   - ✅ Deve gerar com sucesso
   - ✅ Saldo deve diminuir (5 - custo)
7. Repetir até créditos zerados
8. Tentar gerar novamente:
   - ❌ Deve mostrar modal "Créditos Zerados"

**Arquivo para testar:**
- `client/src/pages/AdsManager.tsx` (gera com 2 créditos)
- `client/src/pages/EbookGenerator.tsx` (gera com 20 créditos)

---

### 2. Teste de Webhooks Stripe

**Objetivo:** Verificar se webhooks ativam assinatura e créditos

**Setup:**
```bash
# Terminal 1: Iniciar seu servidor
npm run dev

# Terminal 2: Iniciar listener do Stripe
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Procedimento:**
1. Copie o signing secret do Stripe CLI
2. Configure em `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Abra webhook testing no Stripe Dashboard
4. Trigger evento `checkout.session.completed`:
   ```bash
   stripe trigger checkout.session.completed
   ```
5. Verifique no banco de dados:
   - ✅ Tabela `subscription` deve ser atualizada
   - ✅ Status deve ser "active"
   - ✅ `creditsRemaining` deve ser 5 (essencial) ou -1 (profissional)

**Eventos a testar:**
- [ ] `checkout.session.completed` → Ativa subscription
- [ ] `customer.subscription.updated` → Atualiza status
- [ ] `customer.subscription.deleted` → Marca como cancelled
- [ ] `invoice.payment_succeeded` → Renova créditos
- [ ] `invoice.payment_failed` → Registra erro

---

### 3. Teste de BioRadar Rate Limiting

**Objetivo:** Verificar se limite de análises gratuitas funciona

**Procedimento:**
1. Abrir `http://localhost:3000/bioradar` sem estar logado
2. Fazer 5 análises com endereços Instagram diferentes
   - ✅ Cada uma deve funcionar
3. Tentar fazer 6ª análise:
   - ❌ Deve retornar erro "Limite atingido. Aguarde 1 hora"
4. Fazer login
5. Tentar análise:
   - ✅ Deve funcionar (usuário autenticado não tem limite)
   - ✅ Deve consumir 5 créditos (se plano essencial/profissional)

---

### 4. Teste de CreditGuard Component

**Objetivo:** Verificar se UI bloqueia quando créditos zerados

**Procedimento:**
1. Criar usuário com 1 crédito (plano free)
2. Navegar para EbookGenerator
3. Tentar gerar e-book (custa 20 créditos)
4. Verificar:
   - ✅ Mostrar modal "Créditos Esgotados"
   - ✅ Não permite fechar modal
   - ✅ Botão "Fazer Upgrade Agora" redireciona para `/pricing`
5. Voltar e fazer upgrade para essencial (5 créditos)
6. Tentar gerar novamente:
   - ❌ Deve mostrar modal com mensagem diferente
   - ✅ Botão "Continuar com 5 crédito(s)" aparece

---

### 5. Teste de Exportação de PDF

**Objetivo:** Verificar se PDF é gerado corretamente

**Procedimento:**
1. Gerar um e-book (usar plano com créditos)
2. Clicar em "Exportar PDF"
3. Verificar:
   - ✅ Janela de impressão abre
   - ✅ E-book tem formatação correta:
     - Título em fonte grande
     - Capítulos com numeração
     - Conteúdo formatado
     - Conclusão e CTA visíveis
4. Pressionar Ctrl+P (ou imprimir)
5. Selecionar "Salvar como PDF"
6. Abrir PDF no Adobe Reader:
   - ✅ Conteúdo legível
   - ✅ Estrutura preservada

**Navegadores a testar:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (se aplicável)
- [ ] Edge

---

## 🟡 TESTES SECUNDÁRIOS (Bom fazer antes do lançamento)

### 6. Teste de Validação de Variáveis de Ambiente

**Objetivo:** Verificar se servidor falha com configuração inválida

**Procedimento:**
1. Em `.env`, remova `DATABASE_URL`
2. Tente `npm run dev`:
   - ❌ Deve falhar com mensagem clara
3. Restaure `DATABASE_URL`
4. Altere `JWT_SECRET` para menos de 32 caracteres
5. Tente `npm run start` (produção):
   - ❌ Deve falhar com aviso de segurança
6. Restaure tudo

---

### 7. Teste de Seed Admin

**Objetivo:** Verificar se script de criação de admin funciona

**Procedimento:**
1. Criar backup do banco (ou usar banco de teste)
2. Executar:
   ```bash
   npx tsx scripts/create-admin.ts
   ```
3. Verificar output:
   - ✅ Mostra email e ID criado
   - ✅ Mostra credenciais temporárias
4. Login com email e senha:
   - ✅ Deve logar com sucesso
   - ✅ Dashboard mostrar plano "profissional"
5. Executar novamente:
   - ✅ Deve detectar que admin já existe
   - ✅ Não deve criar duplicado

---

### 8. Teste de Diferentes Tipos de Geração

**Objetivo:** Verificar se todos os endpoints funcionam

**Com créditos suficientes, testar:**

- [ ] **Posts (AdsManager)**
  - [ ] Gerar com sucesso
  - [ ] Consumir 2 créditos
  - [ ] Listagem funcionando

- [ ] **E-books (EbookGenerator)**
  - [ ] Gerar com sucesso
  - [ ] Consumir 20 créditos
  - [ ] Exportar PDF
  - [ ] Listar recentes

- [ ] **Prompts (alguma página com generatePrompt)**
  - [ ] Gerar com sucesso
  - [ ] Consumir 1 crédito

- [ ] **Anúncios (se tiver página)**
  - [ ] Gerar com sucesso
  - [ ] Consumir 2 créditos

---

## 🟢 TESTES OPCIONAIS (Nice-to-have)

### 9. Teste de Performance

```bash
# Instalar ferramentas
npm install -g k6

# Teste de carga simples
k6 run - <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/health');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
EOF
```

### 10. Teste de Segurança Básico

```bash
# Verificar headers de segurança
curl -I http://localhost:3000/

# Deve retornar:
# Strict-Transport-Security
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy
```

---

## 📝 RELATÓRIO DE TESTES

Use este template para documentar testes:

```markdown
## ✅ Teste: [Nome do Teste]

**Data:** 2025-12-26
**Tester:** [Seu nome]
**Ambiente:** [localhost/staging/production]

### Procedimento:
1. [Passo 1]
2. [Passo 2]
...

### Resultado:
- [x] Esperado 1 - ✅ PASSOU
- [x] Esperado 2 - ✅ PASSOU
- [x] Esperado 3 - ❌ FALHOU - [Descrição do erro]

### Bugs encontrados:
- Bug #1: [Descrição]
- Bug #2: [Descrição]

### Aprovado para produção?
[✅] SIM / [❌] NÃO

### Notas:
...
```

---

## 🔍 COMO DEBUGAR

### Ver logs do servidor:
```bash
npm run dev 2>&1 | grep -E "error|Error|ERROR"
```

### Verificar banco de dados:
```bash
# Conetar ao banco MySQL
mysql -u user -p database

# Verificar tabela de subscription
SELECT id, userId, plan, status, creditsRemaining FROM subscription LIMIT 5;

# Verificar table de contentGeneration
SELECT id, userId, type, creditsUsed, createdAt FROM contentGeneration LIMIT 5;
```

### Network tab do browser:
1. F12 → Network tab
2. Filtrar por "api"
3. Clicar em request para ver:
   - Request payload
   - Response JSON
   - Status code

---

## ✅ CHECKLIST DE TESTES

- [ ] Todos os 5 testes críticos passaram
- [ ] Nenhum erro critico encontrado
- [ ] Performance aceitável (< 2s)
- [ ] Bugs menores documentados
- [ ] Equipe notificada dos resultados
- [ ] Aprovado para produção

**Data de conclusão:** _______________

---

**Dúvidas durante testes?** Abrir issue com tag `test-failure` para investigar.
