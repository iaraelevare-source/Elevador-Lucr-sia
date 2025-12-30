# 🚀 Guia de Deploy - Elevare AI NeuroVendas

Este guia fornece instruções passo a passo para fazer o deploy da plataforma Elevare em produção.

---

## 📋 Pré-requisitos

Antes de iniciar o deploy, você precisará:

1. **Conta no Stripe** (para pagamentos)
2. **Banco de dados MySQL** (PlanetScale, Railway, ou AWS RDS)
3. **Conta Manus** (para OAuth e APIs de IA)
4. **Plataforma de hospedagem** (Vercel, Railway, ou Render)
5. **Node.js 18+**
6. **pnpm 9+**

---

## 🔧 Configuração do Stripe

### 1. Criar Conta e Produtos

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. No dashboard, vá em **Products** → **Add Product**
3. Crie dois produtos:

#### Produto 1: Elevare PRO
- Nome: `Elevare PRO`
- Preço: `R$ 29,00`
- Tipo: `Recurring` (Mensal)
- Copie o **Price ID** (ex: `price_1ABC...`)

#### Produto 2: Elevare PRO+
- Nome: `Elevare PRO+`
- Preço: `R$ 79,00`
- Tipo: `Recurring` (Mensal)
- Copie o **Price ID** (ex: `price_2XYZ...`)

### 2. Configurar Webhook

1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/stripe/webhook`
4. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Webhook Secret** (ex: `whsec_...`)

### 3. Obter Chaves da API

1. Vá em **Developers** → **API keys**
2. Copie a **Secret key** (ex: `sk_live_...`)
3. ⚠️ **IMPORTANTE:** Use chaves de teste (`sk_test_...`) durante desenvolvimento

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: PlanetScale (Recomendado)

1. Acesse [planetscale.com](https://planetscale.com)
2. Crie um novo database
3. Copie a **Connection String**:
   ```
   mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}
   ```

### Opção 2: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione MySQL
4. Copie a **DATABASE_URL**

### Opção 3: AWS RDS

1. Crie uma instância MySQL no RDS
2. Configure security groups
3. Monte a connection string:
   ```
   mysql://username:password@endpoint:3306/database
   ```

---

## 🔐 Configuração do OAuth (Manus)

1. Acesse o dashboard Manus
2. Crie um novo app OAuth
3. Configure:
   - **Redirect URLs:** `https://seu-dominio.com/api/oauth/callback`
   - **Allowed Origins:** `https://seu-dominio.com`
4. Copie:
   - **App ID** (VITE_APP_ID)
   - **Owner OpenID** (OWNER_OPEN_ID)

---

## 🤖 Configuração das APIs de IA

As APIs de IA (Gemini e Image Generation) são fornecidas pela plataforma Manus através do Forge API.

1. No dashboard Manus, vá em **API Keys**
2. Copie:
   - **Forge API URL:** `https://forge.manus.im`
   - **Forge API Key:** `seu_api_key`

---

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth (Manus)
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_APP_ID=seu_app_id_aqui
OWNER_OPEN_ID=seu_owner_openid_aqui

# JWT
JWT_SECRET=gere_uma_chave_secreta_forte_aqui

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta
STRIPE_PRO_PRICE_ID=price_id_do_plano_pro
STRIPE_PRO_PLUS_PRICE_ID=price_id_do_plano_pro_plus
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# Forge API (IA)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=seu_forge_api_key

# Environment
NODE_ENV=production
```

### Gerar JWT Secret

```bash
# No terminal, execute:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🌐 Deploy

### Opção 1: Vercel (Recomendado para Full-Stack)

1. **Instale o Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Configure o projeto:**
   ```bash
   cd elevare_ai_neurovendas
   vercel
   ```

3. **Configure as variáveis de ambiente:**
   - Vá no dashboard Vercel
   - Settings → Environment Variables
   - Adicione todas as variáveis do `.env`

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Opção 2: Railway

1. **Conecte o repositório:**
   - Acesse [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Configure as variáveis de ambiente:**
   - Variables → Add Variable
   - Adicione todas as variáveis do `.env`

3. **Configure o build:**
   ```json
   {
     "build": "pnpm build",
     "start": "pnpm start"
   }
   ```

### Opção 3: Render

1. **Crie um novo Web Service:**
   - Conecte seu repositório
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

2. **Configure variáveis de ambiente:**
   - Environment → Add Environment Variable
   - Adicione todas as variáveis do `.env`

---

## 🗃️ Migração do Banco de Dados

Após configurar o banco de dados, execute as migrations:

```bash
# Gerar e aplicar migrations
pnpm db:push
```

Isso criará todas as tabelas necessárias:
- `users`
- `subscription`
- `bioRadarDiagnosis`
- `contentGeneration`
- `brandEssence`

---

## ✅ Checklist de Deploy

Antes de ir para produção, verifique:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrations aplicadas
- [ ] Stripe configurado com produtos e webhook
- [ ] OAuth Manus configurado com redirect URLs corretos
- [ ] Forge API key válida
- [ ] JWT secret forte gerado
- [ ] Build do projeto sem erros (`pnpm build`)
- [ ] Testes básicos funcionando
- [ ] HTTPS configurado (obrigatório para Stripe)
- [ ] Domínio customizado configurado (opcional)

---

## 🧪 Testar em Produção

### 1. Testar Autenticação
1. Acesse `https://seu-dominio.com`
2. Clique em "Entrar"
3. Complete o fluxo OAuth

### 2. Testar Radar de Bio
1. Vá em Dashboard → Radar de Bio
2. Digite um @ do Instagram
3. Verifique se a análise funciona

### 3. Testar Checkout (Modo Teste)
1. Use chaves de teste do Stripe
2. Vá em Pricing
3. Selecione um plano
4. Use cartão de teste: `4242 4242 4242 4242`
5. Verifique se o checkout funciona

### 4. Testar Geração de Conteúdo
1. Vá em Dashboard → Gerador de E-books
2. Preencha o formulário
3. Verifique se o e-book é gerado

---

## 🔄 Atualizações

Para fazer deploy de novas versões:

```bash
# 1. Commit suas mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 2. Deploy (Vercel)
vercel --prod

# 3. Ou deixe o CI/CD fazer automaticamente
```

---

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
```
Error: connect ECONNREFUSED
```
**Solução:**
- Verifique se `DATABASE_URL` está correta
- Confirme se o IP do servidor está na whitelist do banco
- Teste a conexão manualmente

### Erro no Stripe
```
Error: No such price: 'price_...'
```
**Solução:**
- Verifique se os Price IDs estão corretos
- Confirme se está usando chaves do mesmo ambiente (test/live)

### Erro de OAuth
```
Error: Invalid redirect_uri
```
**Solução:**
- Verifique se a URL de callback está registrada no Manus
- Confirme se `VITE_APP_ID` está correto

### Erro de IA
```
Error: OPENAI_API_KEY is not configured
```
**Solução:**
- Verifique se `BUILT_IN_FORGE_API_KEY` está configurada
- Confirme se a API key é válida

---

## 📊 Monitoramento

### Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
- Acesse o dashboard → View Logs

**Render:**
- Acesse o dashboard → Logs

### Métricas

Monitore:
- Taxa de conversão (Radar de Bio → Assinatura)
- Uso de créditos por usuário
- Erros de API
- Tempo de resposta

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] HTTPS habilitado
- [ ] Variáveis de ambiente não commitadas
- [ ] JWT secret forte (64+ caracteres)
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Webhook do Stripe validado
- [ ] Logs de acesso habilitados

### Backup

Configure backups automáticos do banco de dados:

**PlanetScale:**
- Backups automáticos diários incluídos

**Railway:**
- Configure snapshots automáticos

**AWS RDS:**
- Configure automated backups

---

## 📈 Escalabilidade

### Quando escalar?

Considere escalar quando:
- Mais de 1000 usuários ativos
- Mais de 10000 requisições/dia
- Tempo de resposta > 2s

### Como escalar?

1. **Banco de Dados:**
   - Upgrade para plano maior
   - Adicionar read replicas
   - Implementar cache (Redis)

2. **Servidor:**
   - Aumentar recursos (CPU/RAM)
   - Adicionar mais instâncias
   - Configurar load balancer

3. **CDN:**
   - Usar Cloudflare ou Vercel Edge
   - Cache de assets estáticos

---

## 🎉 Pronto!

Sua plataforma Elevare AI NeuroVendas está agora em produção! 🚀

**Próximos passos:**
1. Monitore logs e métricas
2. Colete feedback dos usuários
3. Implemente melhorias contínuas
4. Escale conforme necessário

**Suporte:**
- Documentação: `README.md`
- Issues: GitHub Issues
- Email: suporte@elevare.com

---

**Elevare AI NeuroVendas** - Venda como ciência, não como esperança. 🎯