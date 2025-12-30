# 🚀 DEPLOY AGORA - Instruções Finais

## ✅ Status: Código no GitHub!

Seu código já está no GitHub e pronto para deploy!

**Repositório:** https://github.com/iaraelevare-source/Elevador-Lucr-sia

---

## 🚀 Próximos 3 Passos (3 Minutos)

### 1️⃣ Acessar Railway (30 segundos)
```
1. Abra: https://railway.app
2. Clique em "Login"
3. Escolha "Login with GitHub"
4. Autorize Railway
```

### 2️⃣ Criar Novo Projeto (1 minuto)
```
1. No Railway, clique em "+ New Project"
2. Selecione "Deploy from GitHub repo"
3. Procure por: "Elevador-Lucr-sia"
4. Clique no repositório
5. Clique em "Deploy Now"
```

Railway vai automaticamente:
- ✅ Detectar Node.js
- ✅ Ler o Dockerfile
- ✅ Fazer build
- ✅ Iniciar o servidor

### 3️⃣ Adicionar MySQL (30 segundos)
```
1. No painel do projeto, clique em "+ New"
2. Selecione "Database" → "Add MySQL"
3. Railway cria automaticamente
4. A DATABASE_URL é adicionada automaticamente
```

### 4️⃣ Configurar Variáveis (1 minuto)
```
1. Clique no serviço Node.js (não no MySQL)
2. Vá para a aba "Variables"
3. Clique em "Add Variable"
4. Adicione as variáveis abaixo
```

---

## 🔐 Variáveis Obrigatórias

Copie e cole no Railway (Variables):

```env
NODE_ENV=production
PORT=3000
```

### Gerar Chaves Seguras
Execute no seu terminal:
```bash
openssl rand -hex 32
```

Adicione no Railway:
```env
JWT_SECRET=<cole_o_resultado_aqui>
ENCRYPTION_KEY=<gere_outro_e_cole_aqui>
```

### OAuth (Configure depois ou use valores de teste)
```env
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_APP_ID=dev_app_id
OWNER_OPEN_ID=dev_owner_id
```

### Stripe (Configure depois ou use valores de teste)
```env
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_ESSENCIAL_PRICE_ID=price_test_essencial
STRIPE_PROFISSIONAL_PRICE_ID=price_test_profissional
STRIPE_WEBHOOK_SECRET=whsec_test_webhook
```

### Forge API (Configure depois)
```env
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=your_key_here
```

### CORS
```env
ALLOWED_ORIGINS=https://seu-projeto.up.railway.app
```

**Importante:** Depois que o Railway gerar sua URL, volte e atualize `ALLOWED_ORIGINS` com a URL real.

---

## 🎯 Aguardar Deploy (2 minutos)

1. Railway vai fazer build automaticamente
2. Veja o progresso em "Deployments"
3. Aguarde até aparecer "Success" (verde)
4. Copie a URL gerada

---

## 🧪 Testar

Quando o deploy terminar, teste:

```bash
curl https://seu-projeto.up.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-30T...",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 🌐 Obter URL Pública

1. No Railway, clique no seu serviço
2. Vá para "Settings"
3. Procure por "Domains"
4. Copie a URL: `seu-projeto.up.railway.app`

---

## 🔄 Deploy Automático

Agora, cada vez que você fizer push para GitHub:

```bash
git add .
git commit -m "Nova feature"
git push origin master
```

Railway detecta automaticamente e faz deploy em ~2 minutos!

---

## 💰 Custos

Railway oferece:
- **$5 de crédito gratuito/mês** para novos usuários
- Depois: ~$10/mês (Node.js + MySQL)

---

## 🆘 Problemas?

### Build falha
- Veja os logs em "Deployments"
- Procure por erros de `pnpm install`

### Erro de DATABASE_URL
- Certifique-se de ter adicionado MySQL plugin
- Railway adiciona DATABASE_URL automaticamente

### Porta não responde
- Verifique se PORT=3000 está nas variáveis
- Reinicie o serviço

### Erro 502
- Veja os logs
- Verifique se todas as variáveis obrigatórias foram adicionadas

---

## ✅ Checklist

- [ ] Login no Railway com GitHub
- [ ] Criar novo projeto
- [ ] Selecionar repositório "Elevador-Lucr-sia"
- [ ] Adicionar MySQL plugin
- [ ] Configurar variáveis obrigatórias
- [ ] Aguardar deploy (Success)
- [ ] Testar health check
- [ ] Copiar URL pública
- [ ] Atualizar ALLOWED_ORIGINS com URL real

---

## 🎉 Pronto!

Seu aplicativo estará online permanentemente em:
```
https://seu-projeto.up.railway.app
```

**Tempo total: ~3-5 minutos**

---

## 📞 Links Úteis

- **Seu Repositório:** https://github.com/iaraelevare-source/Elevador-Lucr-sia
- **Railway:** https://railway.app
- **Documentação Railway:** https://docs.railway.app

---

*Criado em: 2025-12-30*
*Elevare AI NeuroVendas v1.0.0*
