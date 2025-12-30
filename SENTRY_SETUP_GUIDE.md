# 🔍 SENTRY SETUP GUIDE - Passo a Passo

## ⏱️ Tempo Estimado: 10-15 minutos

---

## 📋 O que você vai fazer

- Criar conta em Sentry.io
- Criar projeto Node.js
- Obter DSN (Sentry Data Source Name)
- Configurar no .env.staging
- Validar que está funcionando

---

## PASSO 1: Criar Conta Sentry

### 1.1 Acessar Sentry.io

```
https://sentry.io/auth/login/
```

**Se não tiver conta:**
- Clique em "Create an account"
- Use email profissional (recomendado)
- Defina senha forte
- Confirme email

### 1.2 Dashboard Inicial

Após login, você verá:
```
Dashboard → Create Project
```

---

## PASSO 2: Criar Projeto Node.js

### 2.1 Criar Novo Projeto

1. Clique em **"Create Project"** (botão azul)
2. Selecione **"Node.js"** como plataforma
3. Selecione **"Express"** como framework
4. Nome: `elevare-ai-staging` (ou seu nome)
5. Clique **"Create Project"**

### 2.2 Configuração Inicial

```
Platform: Node.js
Framework: Express
Release Tracking: ON (recomendado)
Performance Monitoring: ON
```

---

## PASSO 3: Obter DSN

### 3.1 Localizar DSN

Após criar projeto, você será redirecionado para:
```
Settings → Client Keys (DSN)
```

Será algo como:
```
https://examplePublicKey@o0.ingest.sentry.io/0
```

### 3.2 Copiar DSN

O DSN tem este formato:
```
https://[PUBLIC_KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
```

**EXEMPLO:**
```
https://d12345abcdef@sentry.io/1234567
```

---

## PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Atualizar .env.staging

```bash
# Abrir arquivo .env.staging
nano .env.staging
# ou use seu editor favorito
```

Procure por:
```
SENTRY_DSN=https://sua_chave@sentry.io/projeto_id
```

**Substitua** pela DSN copiada:
```
SENTRY_DSN=https://d12345abcdef@sentry.io/1234567
```

**Também configure:**
```
NODE_ENV=staging
APP_VERSION=1.0.0-staging
LOG_LEVEL=info
```

### 4.2 Verificar variáveis

```bash
# Confirmar que está configurado
grep SENTRY_DSN .env.staging
```

Resultado esperado:
```
SENTRY_DSN=https://d12345abcdef@sentry.io/1234567
```

---

## PASSO 5: Testar Integração Localmente

### 5.1 Instalar dependências

```bash
# Se não fez ainda
pnpm install
```

### 5.2 Testar erro proposital

```bash
# Criar arquivo test-sentry.ts na raiz
cat > test-sentry.ts << 'EOF'
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "test",
  tracesSampleRate: 1.0,
});

console.log("🔍 Testando Sentry...");
console.log("DSN:", process.env.SENTRY_DSN);

// Simular erro
try {
  throw new Error("❌ Erro de teste para Sentry");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Erro enviado para Sentry!");
}

// Aguardar envio
setTimeout(() => {
  console.log("✅ Teste completo!");
  process.exit(0);
}, 2000);
EOF
```

### 5.3 Executar teste

```bash
# Carregar variáveis de .env.staging
export $(cat .env.staging | xargs)

# Rodar teste
npx tsx test-sentry.ts
```

**Resultado esperado:**
```
🔍 Testando Sentry...
DSN: https://d12345abcdef@sentry.io/1234567
✅ Erro enviado para Sentry!
✅ Teste completo!
```

### 5.4 Verificar Dashboard Sentry

1. Volte para Sentry.io dashboard
2. Vá para **"Issues"**
3. Procure por: **"Erro de teste para Sentry"**
4. Clique para ver detalhes

**Você deve ver:**
```
Title: Erro de teste para Sentry
Environment: test
Status: Unresolved
```

✅ **Se chegou aqui, Sentry está funcionando!**

### 5.5 Limpar arquivo de teste

```bash
rm test-sentry.ts
```

---

## PASSO 6: Configurar Monitoramento em Produção

### 6.1 Settings → General

```
Project Name: elevare-ai-staging
Platform: Node.js
Status: Active
```

### 6.2 Settings → Alerts

Criar alertas para:

1. **Error Rate**
   - Threshold: 5% errors/hour
   - Action: Email notification

2. **New Issues**
   - Action: Email notification

3. **Regression**
   - Action: Email notification

```
Settings → Alerts → Create Alert Rule
  When: An event is first seen
  Then: Send an email to my account
```

### 6.3 Settings → Integrations

Conectar com:
- **GitHub** (opcional): Para correlacionar releases
- **Slack** (opcional): Para notificações em tempo real

```
Integrations → GitHub → Authorize
Integrations → Slack → Connect
```

---

## PASSO 7: Performance Monitoring (Opcional)

### 7.1 Ativar Tracing

```
Settings → Performance
- Tracing: ON
- Sample Rate: 10% (em produção)
```

### 7.2 Monitorar:

- **Slow Transactions**: > 500ms
- **Slow Database Queries**: > 100ms
- **Frontend Performance**: Interaction timing

---

## PASSO 8: Release Tracking

### 8.1 Criar Releases

```bash
# Instalar Sentry CLI
npm install -g @sentry/cli

# Login no Sentry
sentry-cli login

# Criar release
sentry-cli releases -o sua-org -p seu-projeto create v1.0.0

# Upload sourcemaps
sentry-cli releases -o sua-org -p seu-projeto files v1.0.0 upload-sourcemaps ./dist
```

### 8.2 Ou automatizar via CI/CD

```yaml
# GitHub Actions example
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  with:
    environment: staging
    version: ${{ github.sha }}
```

---

## 🐛 Troubleshooting

### ❌ "DSN inválida"
```bash
# Verificar formato
echo $SENTRY_DSN
# Deve começar com: https://
# Deve conter @
# Deve conter ingest.sentry.io
```

### ❌ "Erro não aparece no Sentry"

1. Verificar se NODE_ENV é staging/production
   ```bash
   echo $NODE_ENV
   # Não funciona em development por padrão
   ```

2. Verificar sample rate
   ```typescript
   // Em dev: tracesSampleRate: 1.0 (100%)
   // Em prod: tracesSampleRate: 0.1 (10%)
   ```

3. Aguardar 5-10 segundos
   - Sentry pode levar alguns segundos

### ❌ "Rate limited by Sentry"

```
Error: Rate limit exceeded
```

Solução:
```
Settings → Rate Limits
- Error Events: 10,000/day (increase)
- Transaction Events: 10,000/day (increase)
```

---

## ✅ Checklist Final

- [ ] Conta Sentry criada
- [ ] Projeto Node.js criado
- [ ] DSN copiada
- [ ] .env.staging atualizado com SENTRY_DSN
- [ ] Teste local executado com sucesso
- [ ] Erro de teste visível no dashboard Sentry
- [ ] Alertas configurados (Email/Slack)
- [ ] Performance Monitoring ativo
- [ ] Release Tracking pronto

---

## 📚 Referências

| Recurso | Link |
|---------|------|
| Sentry Docs | https://docs.sentry.io |
| Node.js Guide | https://docs.sentry.io/platforms/node/ |
| Express Integration | https://docs.sentry.io/platforms/node/guides/express/ |
| Performance Monitoring | https://docs.sentry.io/product/performance/ |
| Release Tracking | https://docs.sentry.io/product/releases/ |

---

## 🎯 Próximo Passo

Após confirmar que Sentry funciona:
1. Atualizar .env.staging em Railway
2. Fazer deploy
3. Monitorar logs em tempo real

**Tempo total:** 10-15 minutos ✅
